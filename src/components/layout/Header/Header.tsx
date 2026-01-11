import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';

interface HeaderProps {
  /** 사이드바 열림 상태 */
  isSidebarOpen?: boolean;
  /** 사이드바 토글 핸들러 */
  onToggleSidebar?: () => void;
  /** 앱 이름 */
  appName?: string;
}

const navItems = [
  { path: '/', label: '홈' },
  { path: '/playground', label: 'Playground' },
  { path: '/about', label: 'About' },
];

export function Header({
  isSidebarOpen = false,
  onToggleSidebar,
  appName = 'Hello Front',
}: HeaderProps) {
  return (
    <header className={styles.header} role="banner">
      <div className={styles.headerContent}>
        <div className={styles.leftSection}>
          {/* 모바일 메뉴 버튼 */}
          <button
            className={styles.menuButton}
            onClick={onToggleSidebar}
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar"
            aria-label={isSidebarOpen ? '메뉴 닫기' : '메뉴 열기'}
            type="button"
          >
            <span className={styles.menuIcon} aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* 로고 */}
          <NavLink to="/" className={styles.logo}>
            <span className={styles.logoIcon} aria-hidden="true">
              HF
            </span>
            <span>{appName}</span>
          </NavLink>
        </div>

        {/* 데스크탑 네비게이션 */}
        <nav className={styles.nav} aria-label="메인 네비게이션">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* 우측 섹션 (추후 확장용) */}
        <div className={styles.rightSection}>
          {/* 테마 토글, 사용자 메뉴 등 */}
        </div>
      </div>
    </header>
  );
}

export default Header;
