import type { FormHTMLAttributes } from 'react'
import styles from './Form.module.css'

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /** 자식 요소 */
  children: React.ReactNode
}

export function Form({ children, className, ...props }: FormProps) {
  const formClasses = [styles.form, className].filter(Boolean).join(' ')

  return (
    <form className={formClasses} {...props}>
      {children}
    </form>
  )
}

interface FormGroupProps {
  /** 자식 요소 */
  children: React.ReactNode
  /** 가로 배치 */
  row?: boolean
  /** 추가 클래스 */
  className?: string
}

export function FormGroup({
  children,
  row = false,
  className,
}: FormGroupProps) {
  const classes = [row ? styles.formGroupRow : styles.formGroup, className]
    .filter(Boolean)
    .join(' ')

  return <div className={classes}>{children}</div>
}

interface FormActionsProps {
  /** 자식 요소 */
  children: React.ReactNode
  /** 정렬 */
  align?: 'start' | 'center' | 'end' | 'space-between'
  /** 추가 클래스 */
  className?: string
}

export function FormActions({
  children,
  align = 'start',
  className,
}: FormActionsProps) {
  const alignClasses: Record<string, string> = {
    end: styles.formActionsEnd,
    center: styles.formActionsCenter,
    'space-between': styles.formActionsSpaceBetween,
  }

  const classes = [styles.formActions, alignClasses[align], className]
    .filter(Boolean)
    .join(' ')

  return <div className={classes}>{children}</div>
}

export default Form
