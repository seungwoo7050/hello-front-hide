import { type HTMLAttributes, forwardRef } from 'react'
import styles from './Spinner.module.css'

export type SpinnerSize = 'small' | 'medium' | 'large'
export type SpinnerColor = 'primary' | 'secondary' | 'white'

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** 스피너 크기 */
  size?: SpinnerSize
  /** 스피너 색상 */
  color?: SpinnerColor
  /** 전체 페이지 로딩 표시 */
  fullPage?: boolean
  /** 스크린 리더용 라벨 */
  label?: string
}

/**
 * Spinner 컴포넌트
 *
 * 로딩 상태를 표시하는 회전 인디케이터
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = 'medium',
      color = 'primary',
      fullPage = false,
      label = '로딩 중',
      className,
      ...props
    },
    ref
  ) => {
    const spinnerClassNames = [
      styles.spinner,
      styles[size],
      styles[color],
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const spinner = (
      <div
        ref={ref}
        className={spinnerClassNames}
        role="status"
        aria-label={label}
        {...props}
      >
        <span className="visually-hidden">{label}</span>
      </div>
    )

    if (fullPage) {
      return (
        <div className={`${styles.container} ${styles.fullPage}`}>
          {spinner}
        </div>
      )
    }

    return spinner
  }
)

Spinner.displayName = 'Spinner'
