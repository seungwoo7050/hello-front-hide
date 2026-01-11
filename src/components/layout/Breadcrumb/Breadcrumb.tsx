import { Link, useLocation } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  /** 커스텀 항목 (제공 시 자동 생성 비활성화) */
  items?: BreadcrumbItem[];
  /** 홈 아이콘 표시 여부 */
  showHomeIcon?: boolean;
  /** 경로-레이블 매핑 */
  pathLabels?: Record<string, string>;
}

const defaultPathLabels: Record<string, string> = {
  '': '홈',
  playground: 'Playground',
  about: 'About',
};

const HomeIcon = () => (
  <svg
    className={styles.homeIcon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ChevronIcon = () => (
  <svg
    className={styles.breadcrumbIcon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export function Breadcrumb({
  items,
  showHomeIcon = true,
  pathLabels = defaultPathLabels,
}: BreadcrumbProps) {
  const location = useLocation();

  // 커스텀 항목이 없으면 현재 경로에서 자동 생성
  const breadcrumbItems: BreadcrumbItem[] = items || generateBreadcrumbs(location.pathname, pathLabels);

  // 홈만 있으면 표시하지 않음
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className={styles.breadcrumb} aria-label="현재 위치">
      <ol className={styles.breadcrumbList}>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isFirst = index === 0;

          return (
            <li key={item.path ?? index} className={styles.breadcrumbItem}>
              {index > 0 && (
                <span className={styles.breadcrumbSeparator} aria-hidden="true">
                  <ChevronIcon />
                </span>
              )}

              {isLast ? (
                <span className={styles.breadcrumbCurrent} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.path ?? '/'} className={styles.breadcrumbLink}>
                  {isFirst && showHomeIcon ? <HomeIcon /> : item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function generateBreadcrumbs(
  pathname: string,
  pathLabels: Record<string, string>
): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: pathLabels[''] ?? '홈', path: '/' }];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = pathLabels[segment] ?? segment;
    items.push({ label, path: currentPath });
  }

  return items;
}

export default Breadcrumb;
