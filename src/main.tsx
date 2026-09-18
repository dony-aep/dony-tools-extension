import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { AppProvider } from './context/AppContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './components/toast/ToastProvider'
import { installPointerEventFallback } from './lib/pointerEventFallback'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/styles.css'

// Before the render: react-aria wires its press handlers on mount, and on CEP 11 for macOS
// they would listen for pointer events the engine never sends. No-op everywhere else.
installPointerEventFallback()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)
