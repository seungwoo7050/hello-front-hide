import type { TextareaHTMLAttributes } from 'react'
import { useId } from 'react'
import styles from './Textarea.module.css'

interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'id'
> {
  /** 라벨 */
  label?: string
  /** 에러 메시지 */
  error?: string
  /** 도움말 텍스트 */
  helperText?: string
  /** 필수 입력 표시 */
  required?: boolean
  /** 문자 수 표시 */
  showCharCount?: boolean
  /** 최대 문자 수 */
  maxLength?: number
}

export function Textarea({
  label,
  error,
  helperText,
  required,
  showCharCount,
  maxLength,
  className,
  value,
  defaultValue,
  style,
  resize = 'vertical',
  ...props
}: TextareaProps & { resize?: 'none' | 'vertical' | 'horizontal' | 'both' }) {
  const id = useId()
  const errorId = `${id}-error`
  const helperId = `${id}-helper`

  // value 또는 defaultValue에서 길이 계산
  const displayValue = value ?? defaultValue ?? ''
  const currentLength =
    typeof displayValue === 'string' ? displayValue.length : 0
  const isOverLimit = maxLength ? currentLength > maxLength : false

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      {label && (
        <label
          htmlFor={id}
          className={`${styles.label} ${required ? styles.required : ''}`}
        >
          {label}
        </label>
      )}

      <textarea
        id={id}
        className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
        aria-invalid={!!error}
        aria-describedby={
          [error && errorId, helperText && helperId]
            .filter(Boolean)
            .join(' ') || undefined
        }
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        style={{ ...style, resize }}
        {...props}
      />

      {showCharCount && maxLength && (
        <span
          className={`${styles.charCount} ${isOverLimit ? styles.charCountError : ''}`}
        >
          {currentLength} / {maxLength}
        </span>
      )}

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

export default Textarea
