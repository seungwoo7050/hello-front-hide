/**
 * 테마 스토어 (Zustand)
 * 라이트/다크 모드 및 시스템 테마 관리
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode, ThemeStore } from './types';

/** 시스템 테마 감지 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** 실제 테마 계산 */
function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
}

/** 테마를 DOM에 적용 */
function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  
  document.documentElement.setAttribute('data-theme', theme);
  
  // 메타 태그 업데이트 (모바일 브라우저 테마 색상)
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a2e' : '#ffffff');
  }
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'system',
      resolvedTheme: getSystemTheme(),

      setMode: (mode: ThemeMode) => {
        const resolvedTheme = resolveTheme(mode);
        applyTheme(resolvedTheme);
        set({ mode, resolvedTheme });
      },

      toggleTheme: () => {
        const { mode } = get();
        // system → light → dark → system
        const nextMode: ThemeMode =
          mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system';
        const resolvedTheme = resolveTheme(nextMode);
        applyTheme(resolvedTheme);
        set({ mode: nextMode, resolvedTheme });
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // 스토리지에서 복원 시 테마 적용
        if (state) {
          const resolvedTheme = resolveTheme(state.mode);
          applyTheme(resolvedTheme);
          // resolvedTheme이 시스템 테마에 따라 변경될 수 있으므로 업데이트
          if (state.resolvedTheme !== resolvedTheme) {
            state.resolvedTheme = resolvedTheme;
          }
        }
      },
    }
  )
);

// 시스템 테마 변경 감지
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const state = useThemeStore.getState();
    if (state.mode === 'system') {
      const resolvedTheme = e.matches ? 'dark' : 'light';
      applyTheme(resolvedTheme);
      useThemeStore.setState({ resolvedTheme });
    }
  });
}
