import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useCSInterface } from '../hooks/useCSInterface'
import { useToasts, type ToastKind } from '../components/toast/ToastProvider'

interface AppContextValue {
  version: string
  evalScript: (script: string) => Promise<string>
  evalHostScript: (script: string) => Promise<string>
  loadJSX: (fileName: string) => void
  openURL: (url: string) => void
  setFlyoutMenu: (menuXML: string) => void
  addEventListener: (type: string, listener: (event: CSEvent) => void) => void
  removeEventListener: (type: string, listener: (event: CSEvent) => void) => void
  /** Show an in-panel notification. */
  notify: (message: string, kind?: ToastKind) => void
}

const AppContext = createContext<AppContextValue | null>(null)

interface AppProviderProps {
  children: ReactNode
}

const TOAST_KINDS: readonly string[] = ['success', 'warning', 'error', 'info']

/** The host is the one that names the kind, so an unknown one falls back to 'info'. */
function toToastKind(kind: string): ToastKind {
  return TOAST_KINDS.indexOf(kind) === -1 ? 'info' : (kind as ToastKind)
}

export function AppProvider({ children }: AppProviderProps) {
  const cep = useCSInterface()
  const { push } = useToasts()
  const { evalHostScript: rawEvalHostScript, loadJSX } = cep

  useEffect(() => {
    loadJSX('hostscript.jsx')
  }, [loadJSX])

  /**
   * Runs a host call and shows as toasts whatever it queued through `report()`. The host
   * cannot call `alert()`, so this is the only path by which its messages reach the user.
   *
   * Result and messages come back in the same round trip: see `src/lib/hostEnvelope.ts`.
   */
  const evalHostScript = useCallback(
    async (script: string): Promise<string> => {
      const { result, messages } = await rawEvalHostScript(script)
      for (const entry of messages) push(entry.message, toToastKind(entry.kind))
      return result
    },
    [rawEvalHostScript, push],
  )

  const value = useMemo<AppContextValue>(
    () => ({
      version: __APP_VERSION__,
      evalScript: cep.evalScript,
      evalHostScript,
      loadJSX: cep.loadJSX,
      openURL: cep.openURL,
      setFlyoutMenu: cep.setFlyoutMenu,
      addEventListener: cep.addEventListener,
      removeEventListener: cep.removeEventListener,
      notify: push,
    }),
    [cep, evalHostScript, push],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
