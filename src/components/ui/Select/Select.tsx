import type { SelectHTMLAttributes } from 'react';
import { useId } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  /** 라벨 */
  label?: string;
  /** 옵션 목록 */
  options: SelectOption[];
  /** 에러 메시지 */
  error?: string;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 필수 입력 표시 */
  required?: boolean;
  /** 플레이스홀더 */
  placeholder?: string;
}

export function Select({
  label,
  options,
  error,
  helperText,
  required,
  placeholder,
  className,
  ...props
}: SelectProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

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

      <div className={styles.selectWrapper}>
        <select
          id={id}
          className={`${styles.select} ${error ? styles.selectError : ''}`}
          aria-invalid={!!error}
          aria-describedby={
            [error && errorId, helperText && helperId].filter(Boolean).join(' ') ||
            undefined
          }
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <svg
          className={styles.chevron}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

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
  );
}

export default Select;
