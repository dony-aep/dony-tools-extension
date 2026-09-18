import { useRef, useCallback, useMemo } from 'react'
import {
  HOST_NOT_LOADED,
  parseHostEnvelope,
  wrapHostCall,
  type HostEnvelope,
} from '../lib/hostEnvelope'
import { createHostStats, hostCallName, recordCall, type HostStats } from '../lib/hostStats'

/** The private ExtendScript namespace every host function of this extension hangs off. */
const HOST_NAMESPACE = 'com_dony_tools'

/**
 * Returns true when running inside Adobe CEP (After Effects panel).
 * Outside CEP (e.g. `npm run dev` in browser) this is false.
 */
function isInsideCEP(): boolean {
  try {
    // The native CEP runtime injects this object
    return typeof window !== 'undefined' && '__adobe_cep__' in window
  } catch {
    return false
  }
}

/** Shared flag – evaluated once */
const CEP_AVAILABLE = isInsideCEP()

// Each evalScript occupies After Effects' main thread. These counters say how many calls
// the panel makes and how long the host takes, which is what to measure before touching
// anything in the bridge.
const hostStats: HostStats = createHostStats(Date.now())
if (CEP_AVAILABLE) {
  // Read with shared/diagnostics/cdp-eval.mjs over the port in public/.debug.
  ;(window as Window & { __dtHostStats?: HostStats }).__dtHostStats = hostStats
}

/**
 * Escape a string before it is embedded in an ExtendScript string literal.
 *
 * Host calls are built by concatenating source text, so any user-supplied value
 * — an output module template name, a preset name, a folder name — becomes part
 * of the program. A single unescaped double quote turns the call into a syntax
 * error, and After Effects answers a malformed script with a *modal dialog*
 * that blocks its scripting engine until the user dismisses it.
 *
 * Both quote styles are escaped so the helper is safe regardless of which one
 * the call site uses. U+2028/U+2029 are real line terminators in ExtendScript
 * and would truncate the literal. Implemented per code unit so this source
 * stays pure ASCII.
 */
export function escapeForEval(value: string): string {
  let out = ''
  for (let i = 0; i < value.length; i++) {
    switch (value.charCodeAt(i)) {
      case 0x5c: // backslash
        out += '\\\\'
        break
      case 0x22: // double quote
        out += '\\"'
        break
      case 0x27: // single quote
        out += "\\'"
        break
      case 0x0a: // newline
        out += '\\n'
        break
      case 0x0d: // carriage return
        out += '\\r'
        break
      case 0x2028: // line separator
        out += '\\u2028'
        break
      case 0x2029: // paragraph separator
        out += '\\u2029'
        break
      default:
        out += value[i]
    }
  }
  return out
}

/**
 * Serialise a value as an ExtendScript object literal.
 *
 * `JSON.stringify` escapes quotes and backslashes, but it leaves U+2028 and
 * U+2029 raw — and those are line terminators in ExtendScript, so a folder or
 * comp name pasted from the web could end the literal mid-string and break the
 * call. Everything else JSON produces is valid ExtendScript source.
 */
export function toEvalLiteral(value: unknown): string {
  const json = JSON.stringify(value)
  let out = ''
  for (let i = 0; i < json.length; i++) {
    const code = json.charCodeAt(i)
    if (code === 0x2028) out += '\\u2028'
    else if (code === 0x2029) out += '\\u2029'
    else out += json[i]
  }
  return out
}

export { HOST_NOT_LOADED }

/**
 * Custom hook that provides access to the CEP CSInterface.
 * Wraps evalScript calls into Promises and provides typed helpers.
 * When running outside CEP (browser dev), all calls are no-ops.
 */
export function useCSInterface() {
  const csInterfaceRef = useRef<CSInterface | null>(null)

  // Lazy initialization – only create when actually inside CEP
  const getCSInterface = useCallback(() => {
    if (!CEP_AVAILABLE) return null
    if (!csInterfaceRef.current) {
      try {
        csInterfaceRef.current = new CSInterface()
      } catch {
        console.warn('CSInterface not available – running outside CEP')
      }
    }
    return csInterfaceRef.current
  }, [])

  /**
   * Evaluate an ExtendScript expression and return the result as a Promise
   */
  const evalScript = useCallback(
    (script: string): Promise<string> => {
      return new Promise((resolve) => {
        const cs = getCSInterface()
        if (!cs) {
          console.warn('evalScript called outside CEP:', script)
          resolve('')
          return
        }
        cs.evalScript(script, (result) => {
          // CEP hands back this sentinel when the ExtendScript engine throws.
          // After Effects 26 often returns an empty string instead, which is
          // indistinguishable from a void return — so this catches what it can
          // and the host is expected to return its own status strings.
          if (typeof result === 'string' && result.indexOf('EvalScript error') === 0) {
            console.error('[host] evalScript failed:', script, result)
            resolve('')
            return
          }
          resolve(result)
        })
      })
    },
    [getCSInterface],
  )

  /**
   * Call a method exposed by this extension's private hostscript namespace and collect
   * both its return value and the notices it queued, in a single round trip.
   *
   * Interpolated values must go through `escapeForEval` — this builds source
   * text, so an unescaped quote is a syntax error, not a bad argument.
   */
  const evalHostScript = useCallback(
    async (call: string): Promise<HostEnvelope> => {
      const script = wrapHostCall(HOST_NAMESPACE, call)
      const startedAt = Date.now()
      const raw = await evalScript(script)
      recordCall(hostStats, hostCallName(script), Date.now() - startedAt, raw === '')

      if (raw === HOST_NOT_LOADED) {
        console.error('[host] hostscript.jsx is not loaded; call ignored:', call)
        return { result: '', messages: [] }
      }
      return parseHostEnvelope(raw)
    },
    [evalScript],
  )

  /**
   * Load a JSX file from the extension's jsx/ folder
   */
  const loadJSX = useCallback(
    (fileName: string) => {
      const cs = getCSInterface()
      if (!cs) return
      const extensionRoot = cs.getSystemPath(SystemPath.EXTENSION) + '/jsx/'
      cs.evalScript(`$.evalFile("${extensionRoot}${fileName}")`)
    },
    [getCSInterface],
  )

  /**
   * Open a URL in the user's default browser
   */
  const openURL = useCallback(
    (url: string) => {
      const cs = getCSInterface()
      if (cs) {
        cs.openURLInDefaultBrowser(url)
      } else {
        window.open(url, '_blank')
      }
    },
    [getCSInterface],
  )

  /**
   * Set the panel's flyout menu
   */
  const setFlyoutMenu = useCallback(
    (menuXML: string) => {
      const cs = getCSInterface()
      if (cs) {
        cs.setPanelFlyoutMenu(menuXML)
      }
    },
    [getCSInterface],
  )

  /**
   * Listen for CEP events (flyout menu, theme changes, etc.)
   */
  const addEventListener = useCallback(
    (type: string, listener: (event: CSEvent) => void) => {
      const cs = getCSInterface()
      if (cs) {
        cs.addEventListener(type, listener)
      }
    },
    [getCSInterface],
  )

  /**
   * Remove a CEP event listener
   */
  const removeEventListener = useCallback(
    (type: string, listener: (event: CSEvent) => void) => {
      const cs = getCSInterface()
      if (cs) {
        cs.removeEventListener(type, listener)
      }
    },
    [getCSInterface],
  )

  // Every callback above is stable, so the object may be too. Returning a literal made it
  // a fresh value on every render, and AppContext carries it in the dependencies of the
  // useMemo that builds its own value: one render here re-rendered every consumer.
  return useMemo(
    () => ({
      csInterface: getCSInterface(),
      evalScript,
      evalHostScript,
      loadJSX,
      openURL,
      setFlyoutMenu,
      addEventListener,
      removeEventListener,
    }),
    [
      getCSInterface,
      evalScript,
      evalHostScript,
      loadJSX,
      openURL,
      setFlyoutMenu,
      addEventListener,
      removeEventListener,
    ],
  )
}
