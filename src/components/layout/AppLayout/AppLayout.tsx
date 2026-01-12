import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '../Header'
import { Sidebar } from '../Sidebar'
import { Main } from '../Main'
import { Footer } from '../Footer'
import { Breadcrumb } from '../Breadcrumb'
import { ApiErrorListener } from '../../ApiErrorListener'
import styles from './AppLayout.module.css'

interface AppLayoutProps {
  /** 사이드바 표시 여부 */
  showSidebar?: boolean
  /** 푸터 표시 여부 */
  showFooter?: boolean
  /** Breadcrumb 표시 여부 */
  showBreadcrumb?: boolean
}

export function AppLayout({
  showSidebar = true,
  showFooter = true,
  showBreadcrumb = true,
}: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])

  return (
    <div className={styles.layout}>
      <Header
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      />

      {showSidebar && (
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      )}

      <Main hasSidebar={showSidebar}>
        <ApiErrorListener />
        {showBreadcrumb && <Breadcrumb />}
        <Outlet />
      </Main>

      {showFooter && <Footer hasSidebar={showSidebar} />}
    </div>
  )
}

export default AppLayout
