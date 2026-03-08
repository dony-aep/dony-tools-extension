import { useRef, useCallback } from 'react'

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
          resolve(result)
        })
      })
    },
    [getCSInterface],
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

  return {
    csInterface: getCSInterface(),
    evalScript,
    loadJSX,
    openURL,
    setFlyoutMenu,
    addEventListener,
    removeEventListener,
  }
}
