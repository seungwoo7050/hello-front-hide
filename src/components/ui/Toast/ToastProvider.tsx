import { useState, useCallback, useId } from 'react'
import { createPortal } from 'react-dom'
import type { ToastPosition, ToastType } from './Toast'
import { Toast } from './Toast'
import type { ToastContextValue } from './ToastContext'
import { ToastContext } from './ToastContext'
import styles from './ToastContainer.module.css'

interface ToastItem {
  id: string
  type: ToastType
  title?: string
  message: string
  position: ToastPosition
  duration: number
  closable: boolean
}

interface ToastOptions {
  type?: ToastType
  title?: string
  position?: ToastPosition
  duration?: number
  closable?: boolean
}

const positionClasses: Record<ToastPosition, string> = {
  'top-right': styles.topRight,
  'top-left': styles.topLeft,
  'top-center': styles.topCenter,
  'bottom-right': styles.bottomRight,
  'bottom-left': styles.bottomLeft,
  'bottom-center': styles.bottomCenter,
}

interface ToastProviderProps {
  children: React.ReactNode
  /** 기본 위치 */
  position?: ToastPosition
  /** 기본 지속 시간 */
  defaultDuration?: number
  /** 최대 표시 개수 */
  maxToasts?: number
}

export function ToastProvider({
  children,
  position = 'top-right',
  defaultDuration = 5000,
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idPrefix = useId()

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  const toast = useCallback(
    (message: string, options?: ToastOptions): string => {
      const id = `${idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const newToast: ToastItem = {
        id,
        type: options?.type ?? 'info',
        title: options?.title,
        message,
        position: options?.position ?? position,
        duration: options?.duration ?? defaultDuration,
        closable: options?.closable ?? true,
      }

      setToasts((prev) => {
        const updated = [...prev, newToast]
        // 최대 개수 초과 시 오래된 것부터 제거
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts)
        }
        return updated
      })

      return id
    },
    [idPrefix, position, defaultDuration, maxToasts]
  )

  const success = useCallback(
    (message: string, options?: Omit<ToastOptions, 'type'>) =>
      toast(message, { ...options, type: 'success' }),
    [toast]
  )

  const error = useCallback(
    (message: string, options?: Omit<ToastOptions, 'type'>) =>
      toast(message, { ...options, type: 'error' }),
    [toast]
  )

  const warning = useCallback(
    (message: string, options?: Omit<ToastOptions, 'type'>) =>
      toast(message, { ...options, type: 'warning' }),
    [toast]
  )

  const info = useCallback(
    (message: string, options?: Omit<ToastOptions, 'type'>) =>
      toast(message, { ...options, type: 'info' }),
    [toast]
  )

  const contextValue: ToastContextValue = {
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  }

  // 위치별로 토스트 그룹화
  const toastsByPosition = toasts.reduce(
    (acc, t) => {
      if (!acc[t.position]) {
        acc[t.position] = []
      }
      acc[t.position].push(t)
      return acc
    },
    {} as Record<ToastPosition, ToastItem[]>
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <>
            {(
              Object.entries(toastsByPosition) as [ToastPosition, ToastItem[]][]
            ).map(([position, positionToasts]) => (
              <div
                key={position}
                className={`${styles.container} ${positionClasses[position]}`}
                aria-live="polite"
                aria-label={`${position} 알림 영역`}
              >
                {positionToasts.map((t) => (
                  <Toast
                    key={t.id}
                    id={t.id}
                    type={t.type}
                    title={t.title}
                    message={t.message}
                    position={position}
                    duration={t.duration}
                    closable={t.closable}
                    onClose={dismiss}
                  />
                ))}
              </div>
            ))}
          </>,
          document.body
        )}
    </ToastContext.Provider>
  )
}
