import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface SidebarProps {
  /** 사이드바 열림 상태 */
  isOpen: boolean;
  /** 사이드바 닫기 핸들러 */
  onClose: () => void;
  /** 네비게이션 섹션들 */
  sections?: NavSection[];
  /** 사이드바 축소 모드 (데스크탑) */
  isCollapsed?: boolean;
}

const defaultSections: NavSection[] = [
  {
    title: '메뉴',
    items: [
      {
        path: '/',
        label: '홈',
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        ),
      },
      {
        path: '/playground',
        label: 'Playground',
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        ),
      },
      {
        path: '/about',
        label: 'About',
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        ),
      },
    ],
  },
];

export function Sidebar({
  isOpen,
  onClose,
  sections = defaultSections,
  isCollapsed = false,
}: SidebarProps) {
  const sidebarClasses = [
    styles.sidebar,
    isOpen && styles.sidebarOpen,
    isCollapsed && styles.sidebarCollapsed,
  ]
    .filter(Boolean)
    .join(' ');

  const overlayClasses = [styles.overlay, isOpen && styles.overlayVisible]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {/* 오버레이 (모바일) */}
      <div
        className={overlayClasses}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 사이드바 */}
      <aside
        id="sidebar"
        className={sidebarClasses}
        aria-label="사이드바 네비게이션"
      >
        <div className={styles.sidebarContent}>
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={styles.sidebarSection}>
              {section.title && (
                <div className={styles.sectionTitle}>{section.title}</div>
              )}
              <nav className={styles.sidebarNav}>
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                    }
                    onClick={onClose}
                  >
                    {item.icon && (
                      <span className={styles.navIcon} aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
