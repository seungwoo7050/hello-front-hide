import { type InputHTMLAttributes, forwardRef, type ReactNode, useId } from 'react'
import styles from './Input.module.css'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 라벨 텍스트 */
  label?: string
  /** 에러 메시지 */
  error?: string
  /** 도움말 텍스트 */
  helperText?: string
  /** 왼쪽 아이콘 */
  leftIcon?: ReactNode
  /** 오른쪽 아이콘 */
  rightIcon?: ReactNode
}

/**
 * Input 컴포넌트
 *
 * 라벨, 에러 메시지, 아이콘을 지원하는 텍스트 입력 컴포넌트
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      id,
      ...props
    },
    ref
  ) => {
    // React 18+ useId 훅으로 안정적인 id 생성
    const generatedId = useId()
    const inputId = id || generatedId
    const errorId = error ? `${inputId}-error` : undefined
    const helperId = helperText && !error ? `${inputId}-helper` : undefined

    const inputClassNames = [
      styles.input,
      error && styles.error,
      leftIcon && styles.hasLeftIcon,
      rightIcon && styles.hasRightIcon,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.inputWrapper}>
          {leftIcon && (
            <span className={styles.leftIcon} aria-hidden="true">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputClassNames}
            aria-invalid={!!error}
            aria-describedby={errorId || helperId}
            {...props}
          />
          {rightIcon && (
            <span className={styles.rightIcon} aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <span id={errorId} className={styles.errorMessage} role="alert">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
