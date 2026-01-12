import styles from './Main.module.css'

interface MainProps {
  /** 자식 컴포넌트 */
  children: React.ReactNode
  /** 사이드바 포함 여부 */
  hasSidebar?: boolean
  /** 사이드바 축소 상태 */
  isSidebarCollapsed?: boolean
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean
  /** 추가 CSS 클래스 */
  className?: string
}

export function Main({
  children,
  hasSidebar = false,
  isSidebarCollapsed = false,
  fullWidth = false,
  className,
}: MainProps) {
  const mainClasses = [
    styles.main,
    hasSidebar && styles.mainWithSidebar,
    hasSidebar && isSidebarCollapsed && styles.mainWithCollapsedSidebar,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const contentClasses = [styles.mainContent, fullWidth && styles.mainFullWidth]
    .filter(Boolean)
    .join(' ')

  return (
    <main className={mainClasses} role="main">
      <div className={contentClasses}>{children}</div>
    </main>
  )
}

export default Main
