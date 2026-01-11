import { type ButtonHTMLAttributes, forwardRef } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'small' | 'medium' | 'large'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼 스타일 변형 */
  variant?: ButtonVariant
  /** 버튼 크기 */
  size?: ButtonSize
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean
  /** 로딩 상태 */
  loading?: boolean
}

/**
 * Button 컴포넌트
 * 
 * 다양한 변형과 상태를 지원하는 기본 버튼 컴포넌트
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.button,
      styles[variant],
      size !== 'medium' && styles[size],
      fullWidth && styles.fullWidth,
      loading && styles.loading,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <span className={styles.spinner} aria-hidden="true" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
