import type { InputHTMLAttributes } from 'react'
import { useId } from 'react'
import styles from './Checkbox.module.css'

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'id'
> {
  /** 라벨 */
  label: string
  /** 에러 메시지 */
  error?: string
  /** 도움말 텍스트 */
  helperText?: string
  /** 필수 입력 표시 */
  required?: boolean
}

export function Checkbox({
  label,
  error,
  helperText,
  required,
  className,
  ...props
}: CheckboxProps) {
  const id = useId()
  const errorId = `${id}-error`
  const helperId = `${id}-helper`

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <label className={styles.container}>
        <span className={styles.checkboxWrapper}>
          <input
            type="checkbox"
            id={id}
            className={`${styles.checkbox} ${error ? styles.checkboxError : ''}`}
            aria-invalid={!!error}
            aria-describedby={
              [error && errorId, helperText && helperId]
                .filter(Boolean)
                .join(' ') || undefined
            }
            {...props}
          />
          <span className={styles.checkboxVisual} aria-hidden="true">
            <svg
              className={styles.checkmark}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        </span>
        <span className={`${styles.label} ${required ? styles.required : ''}`}>
          {label}
        </span>
      </label>

      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}

      {helperText && !error && (
        <span id={helperId} className={styles.helper}>
          {helperText}
        </span>
      )}
    </div>
  )
}

export default Checkbox
