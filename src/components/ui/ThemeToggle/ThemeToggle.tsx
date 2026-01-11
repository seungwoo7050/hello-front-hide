/**
 * 테마 토글 버튼
 * 라이트/다크/시스템 모드 전환
 */
import { useThemeStore } from '../../../stores/theme';
import styles from './ThemeToggle.module.css';

export interface ThemeToggleProps {
  className?: string;
  /** 버튼 크기 */
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { mode, resolvedTheme, toggleTheme } = useThemeStore();

  const getIcon = () => {
    if (mode === 'system') {
      return (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    }
    if (resolvedTheme === 'dark') {
      return (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    }
    return (
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    );
  };

  const getLabel = () => {
    if (mode === 'system') return '시스템 테마';
    if (mode === 'dark') return '다크 모드';
    return '라이트 모드';
  };

  return (
    <button
      type="button"
      className={`${styles.themeToggle} ${styles[size]} ${className || ''}`}
      onClick={toggleTheme}
      aria-label={`테마 변경: 현재 ${getLabel()}`}
      title={getLabel()}
    >
      {getIcon()}
    </button>
  );
}
