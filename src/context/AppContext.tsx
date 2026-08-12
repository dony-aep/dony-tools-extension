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

interface HostMessage {
  kind: ToastKind
  message: string
}

export function AppProvider({ children }: AppProviderProps) {
  const cep = useCSInterface()
  const { push } = useToasts()
  const { evalHostScript: rawEvalHostScript } = cep

  useEffect(() => {
    cep.loadJSX('hostscript.jsx')
  }, [cep.loadJSX])

  /**
   * Runs a host call, then drains anything the host queued through `report()`
   * and surfaces it as toasts. The host no longer calls `alert()`, so this is
   * the only path by which its messages reach the user.
   */
  const evalHostScript = useCallback(
    async (script: string): Promise<string> => {
      const result = await rawEvalHostScript(script)

      const raw = await rawEvalHostScript('takeMessages()')
      if (raw) {
        try {
          const messages = JSON.parse(raw) as HostMessage[]
          for (const entry of messages) {
            if (entry && entry.message) push(entry.message, entry.kind)
          }
        } catch {
          // A malformed queue must never break the action that just ran.
          console.error('[host] could not parse queued messages:', raw)
        }
      }

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
