import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useCSInterface } from '../hooks/useCSInterface'

interface AppContextValue {
  version: string
  evalScript: (script: string) => Promise<string>
  loadJSX: (fileName: string) => void
  openURL: (url: string) => void
  setFlyoutMenu: (menuXML: string) => void
  addEventListener: (type: string, listener: (event: CSEvent) => void) => void
  removeEventListener: (type: string, listener: (event: CSEvent) => void) => void
}

const AppContext = createContext<AppContextValue | null>(null)

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const cep = useCSInterface()

  useEffect(() => {
    cep.loadJSX('hostscript.jsx')
  }, [cep.loadJSX])

  const value: AppContextValue = {
    version: __APP_VERSION__,
    evalScript: cep.evalScript,
    loadJSX: cep.loadJSX,
    openURL: cep.openURL,
    setFlyoutMenu: cep.setFlyoutMenu,
    addEventListener: cep.addEventListener,
    removeEventListener: cep.removeEventListener,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
