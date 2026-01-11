import { type HTMLAttributes, forwardRef } from 'react'
import styles from './Badge.module.css'

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'

export type BadgeSize = 'small' | 'medium' | 'large'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** 배지 색상 변형 */
  variant?: BadgeVariant
  /** 배지 크기 */
  size?: BadgeSize
  /** 도트 표시 여부 */
  dot?: boolean
}

/**
 * Badge 컴포넌트
 *
 * 상태나 카테고리를 표시하는 라벨 컴포넌트
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'medium',
      dot = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.badge,
      styles[variant],
      size !== 'medium' && styles[size],
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <span ref={ref} className={classNames} {...props}>
        {dot && <span className={styles.dot} aria-hidden="true" />}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
