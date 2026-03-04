import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'

type ToastType = 'success' | 'warning' | 'error' | 'info'

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const borderColors: Record<ToastType, string> = {
  success: 'var(--status-ok)',
  warning: 'var(--status-warn)',
  error: 'var(--status-error)',
  info: 'var(--status-info)',
}

const AUTO_DISMISS_MS = 4000

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    // Trigger slide-in
    requestAnimationFrame(() => setVisible(true))

    timerRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 200)
    }, AUTO_DISMISS_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast.id, onDismiss])

  return (
    <div
      className="rounded-[var(--radius-sm)] px-4 py-3 text-sm font-medium shadow-lg transition-all duration-200 cursor-pointer"
      style={{
        background: 'var(--bg-surface)',
        color: 'var(--text)',
        borderLeft: `3px solid ${borderColors[toast.type]}`,
        boxShadow: 'var(--shadow-lg)',
        transform: visible ? 'translateX(0)' : 'translateX(110%)',
        opacity: visible ? 1 : 0,
        minWidth: '280px',
        maxWidth: '420px',
      }}
      onClick={() => {
        setVisible(false)
        setTimeout(() => onDismiss(toast.id), 200)
      }}
    >
      {toast.message}
    </div>
  )
}

let toastIdCounter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastIdCounter
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
        style={{ pointerEvents: toasts.length === 0 ? 'none' : 'auto' }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
