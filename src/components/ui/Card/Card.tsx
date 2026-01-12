import { type HTMLAttributes, type ReactNode, forwardRef } from 'react'
import styles from './Card.module.css'

export type CardVariant = 'elevated' | 'outlined'
export type CardPadding = 'none' | 'small' | 'medium' | 'large'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 카드 스타일 변형 */
  variant?: CardVariant
  /** 내부 패딩 */
  padding?: CardPadding
  /** 클릭 가능 여부 */
  interactive?: boolean
}

/**
 * Card 컴포넌트
 *
 * 콘텐츠를 그룹화하는 컨테이너 컴포넌트
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'outlined',
      padding = 'medium',
      interactive = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const paddingClass = {
      none: styles.paddingNone,
      small: styles.paddingSmall,
      medium: styles.paddingMedium,
      large: styles.paddingLarge,
    }[padding]

    const classNames = [
      styles.card,
      styles[variant],
      paddingClass,
      interactive && styles.interactive,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div
        ref={ref}
        className={classNames}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

/* Card 서브 컴포넌트들 */

export interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div className={`${styles.header} ${className || ''}`}>
      <div>
        <h3 className={styles.headerTitle}>{title}</h3>
        {subtitle && <p className={styles.headerSubtitle}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export interface CardBodyProps {
  children: ReactNode
  className?: string
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={`${styles.body} ${className || ''}`}>{children}</div>
}

export interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={`${styles.footer} ${className || ''}`}>{children}</div>
}
