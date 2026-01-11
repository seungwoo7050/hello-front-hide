import { useEffect, useState, useCallback } from 'react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export interface ToastProps {
  /** 토스트 ID */
  id: string;
  /** 토스트 유형 */
  type?: ToastType;
  /** 제목 */
  title?: string;
  /** 메시지 */
  message: string;
  /** 표시 위치 */
  position?: ToastPosition;
  /** 자동 닫힘 시간 (ms), 0이면 자동 닫힘 비활성화 */
  duration?: number;
  /** 닫기 버튼 표시 여부 */
  closable?: boolean;
  /** 닫힐 때 콜백 */
  onClose?: (id: string) => void;
}

const positionMap: Record<ToastPosition, string> = {
  'top-right': styles.topRight,
  'top-left': styles.topLeft,
  'top-center': styles.topCenter,
  'bottom-right': styles.bottomRight,
  'bottom-left': styles.bottomLeft,
  'bottom-center': styles.bottomCenter,
};

const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

export function Toast({
  id,
  type = 'info',
  title,
  message,
  position = 'top-right',
  duration = 5000,
  closable = true,
  onClose,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.(id);
    }, 200); // slideOut 애니메이션 시간
  }, [id, onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const toastClasses = [
    styles.toast,
    styles[type],
    positionMap[position],
    isExiting && styles.exiting,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={toastClasses}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className={styles.icon} aria-hidden="true">
        {icons[type]}
      </span>

      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.message}>{message}</div>
      </div>

      {closable && (
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="알림 닫기"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default Toast;
