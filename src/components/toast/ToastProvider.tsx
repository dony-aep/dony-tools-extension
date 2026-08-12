import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Button as AriaButton } from 'react-aria-components'
import { Icon } from '../ui/Icon'
import styles from './Toast.module.css'

export type ToastKind = 'success' | 'warning' | 'error' | 'info'

const EXIT_MS = 220
const MAX_VISIBLE = 3

/* Auto-dismiss scaled to reading time rather than a flat delay. */
const MIN_DISMISS_MS = 4000
const MAX_DISMISS_MS = 12000
const MS_PER_CHAR = 45
const SEVERITY_FACTOR = 1.3
const RESUME_GRACE_MS = 2000

function autoDismissDelay(message: string, kind: ToastKind): number {
  const base = Math.min(Math.max(MIN_DISMISS_MS, message.length * MS_PER_CHAR), MAX_DISMISS_MS)
  return kind === 'warning' || kind === 'error' ? Math.round(base * SEVERITY_FACTOR) : base
}

const KIND_ICON: Record<ToastKind, string> = {
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
  info: 'info',
}

interface ToastItem {
  id: number
  message: string
  kind: ToastKind
  leaving: boolean
}

interface ToastContextValue {
  push: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToasts(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToasts must be used within a ToastProvider')
  return ctx
}

/**
 * In-panel notifications. These replace the host's `alert()` calls, which
 * froze After Effects until the user dismissed them — a modal dialog for
 * "please select a layer" stops the whole application.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)
  const timersRef = useRef(new Map<number, number>())

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const dismiss = useCallback(
    (id: number) => {
      const pending = timersRef.current.get(id)
      if (pending !== undefined) {
        window.clearTimeout(pending)
        timersRef.current.delete(id)
      }
      setToasts((list) =>
        list.map((t) => (t.id === id && !t.leaving ? { ...t, leaving: true } : t)),
      )
      window.setTimeout(() => remove(id), EXIT_MS)
    },
    [remove],
  )

  const push = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = ++idRef.current
      setToasts((list) => {
        const next = [...list, { id, message, kind, leaving: false }]
        // Cap the stack: the panel is short, so drop the oldest silently.
        return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next
      })
      timersRef.current.set(
        id,
        window.setTimeout(() => dismiss(id), autoDismissDelay(message, kind)),
      )
    },
    [dismiss],
  )

  /** Pointer entered a toast: hold it open while it is being read. */
  const hold = useCallback((id: number) => {
    const pending = timersRef.current.get(id)
    if (pending !== undefined) {
      window.clearTimeout(pending)
      timersRef.current.delete(id)
    }
  }, [])

  /** Pointer left: short grace period, then dismiss. */
  const resume = useCallback(
    (id: number) => {
      if (timersRef.current.has(id)) return
      timersRef.current.set(id, window.setTimeout(() => dismiss(id), RESUME_GRACE_MS))
    },
    [dismiss],
  )

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      timers.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className={styles.viewport} aria-live="polite" aria-label="Notifications">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.kind === 'error' ? 'alert' : 'status'}
            className={[styles.toast, styles[toast.kind], toast.leaving ? styles.leaving : '']
              .filter(Boolean)
              .join(' ')}
            onMouseEnter={() => hold(toast.id)}
            onMouseLeave={() => resume(toast.id)}
          >
            <Icon name={KIND_ICON[toast.kind]} size={16} className={styles.kindIcon} />
            <p className={styles.message}>{toast.message}</p>
            <AriaButton
              className={styles.close}
              aria-label="Dismiss notification"
              onPress={() => dismiss(toast.id)}
            >
              <Icon name="close" size={14} />
            </AriaButton>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
