import { createContext, useContext } from 'react';
import type { ToastPosition, ToastType } from './Toast';

interface ToastOptions {
  type?: ToastType;
  title?: string;
  position?: ToastPosition;
  duration?: number;
  closable?: boolean;
}

export interface ToastContextValue {
  /** 토스트 표시 */
  toast: (message: string, options?: ToastOptions) => string;
  /** 성공 토스트 */
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  /** 에러 토스트 */
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  /** 경고 토스트 */
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  /** 정보 토스트 */
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  /** 특정 토스트 제거 */
  dismiss: (id: string) => void;
  /** 모든 토스트 제거 */
  dismissAll: () => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
