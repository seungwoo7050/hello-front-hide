# Commit #9 — Zustand 전역 상태 관리 (Global State with Zustand)

## Meta

- **난이도**: ⭐⭐⭐ 중급 (Intermediate)
- **권장 커밋 메시지**: `feat: add zustand for global state management with theme and ui stores`

---

## 학습 목표

1. Zustand로 전역 상태를 관리할 수 있다
2. Persist 미들웨어로 상태를 localStorage에 영속화할 수 있다
3. 시스템 테마 감지 및 다크 모드를 구현할 수 있다
4. 여러 스토어를 분리하여 관리할 수 있다

---

## TL;DR

Zustand로 Theme Store(다크모드)와 UI Store(사이드바, 모달)를 구현한다. Persist 미들웨어로 테마 설정을 localStorage에 저장하고, `prefers-color-scheme` 미디어 쿼리로 시스템 테마를 감지한다. ThemeToggle 컴포넌트로 Light/Dark/System 선택을 제공한다.

---

## 배경/컨텍스트

### 왜 이 변경이 필요한가?

- **Context 보일러플레이트 감소**: Zustand는 Provider 없이 사용 가능
- **성능**: 선택적 리렌더링 (selector 기반)
- **영속화**: 미들웨어로 간편한 상태 저장
- **DevTools**: Redux DevTools 연동 가능

### Zustand vs Context vs Redux

| 특성 | Context | Redux | Zustand |
|------|---------|-------|---------|
| 보일러플레이트 | 중간 | 높음 | 낮음 |
| Provider 필요 | ✅ | ✅ | ❌ |
| 미들웨어 | ❌ | ✅ | ✅ |
| 번들 크기 | 0 | ~7KB | ~1KB |

### 영향 범위

- 새로운 패키지: `zustand`
- Theme Store: 다크모드 관리
- UI Store: 사이드바, 모달 상태
- CSS 변수 기반 테마
- 테스트 수 370개 → 387개로 증가 (+17)

---

## 변경 파일 목록

### 추가된 파일 (12개)

| 카테고리 | 파일 | 설명 |
|----------|------|------|
| Store | `src/stores/theme/themeStore.ts` | 테마 스토어 |
| Store | `src/stores/theme/themeStore.test.ts` | 스토어 테스트 |
| Store | `src/stores/ui/uiStore.ts` | UI 스토어 |
| Store | `src/stores/ui/uiStore.test.ts` | 스토어 테스트 |
| Store | `src/stores/index.ts` | 스토어 배럴 |
| Component | `src/components/ui/ThemeToggle/` | 테마 토글 |
| Style | `src/styles/theme-dark.css` | 다크 테마 CSS |
| Hook | `src/hooks/useSystemTheme.ts` | 시스템 테마 감지 |

### 수정된 파일 (5개)

| 파일 | 변경 내용 |
|------|------|
| `package.json` | zustand 추가 |
| `src/main.tsx` | 테마 초기화 |
| `src/styles/tokens.css` | 테마 변수 리팩토링 |
| `src/components/layout/AppLayout.tsx` | ThemeToggle 추가 |

---

## 코드 스니펫

### 1. themeStore.ts — Zustand 스토어 + Persist

```typescript
/* src/stores/theme/themeStore.ts */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
}

interface ThemeActions {
  setMode: (mode: ThemeMode) => void;
  setResolvedTheme: (theme: 'light' | 'dark') => void;
}

// 시스템 테마 감지
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      mode: 'system',
      resolvedTheme: getSystemTheme(),

      setMode: (mode) => {
        const resolvedTheme = mode === 'system' ? getSystemTheme() : mode;
        set({ mode, resolvedTheme });
        applyTheme(resolvedTheme);
      },

      setResolvedTheme: (theme) => {
        set({ resolvedTheme: theme });
        applyTheme(theme);
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ mode: state.mode }), // mode만 저장
      onRehydrateStorage: () => (state) => {
        // 복원 후 resolvedTheme 계산
        if (state) {
          const resolved = state.mode === 'system' ? getSystemTheme() : state.mode;
          state.resolvedTheme = resolved;
          applyTheme(resolved);
        }
      },
    }
  )
);

// DOM에 테마 적용
function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
}
```

---

### 2. 시스템 테마 감지 훅

```typescript
/* src/hooks/useSystemTheme.ts */
import { useEffect } from 'react';
import { useThemeStore } from '../stores';

export function useSystemTheme() {
  const { mode, setResolvedTheme } = useThemeStore();

  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
    };

    // 초기값 설정
    setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, setResolvedTheme]);
}
```

---

### 3. ThemeToggle 컴포넌트

```typescript
/* src/components/ui/ThemeToggle/ThemeToggle.tsx */
import { useThemeStore } from '../../../stores';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { mode, resolvedTheme, setMode } = useThemeStore();

  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${mode === 'light' ? styles.active : ''}`}
        onClick={() => setMode('light')}
        aria-label="라이트 모드"
        aria-pressed={mode === 'light'}
      >
        ☀️
      </button>
      
      <button
        className={`${styles.button} ${mode === 'dark' ? styles.active : ''}`}
        onClick={() => setMode('dark')}
        aria-label="다크 모드"
        aria-pressed={mode === 'dark'}
      >
        🌙
      </button>
      
      <button
        className={`${styles.button} ${mode === 'system' ? styles.active : ''}`}
        onClick={() => setMode('system')}
        aria-label="시스템 설정 따르기"
        aria-pressed={mode === 'system'}
      >
        💻
      </button>
      
      <span className={styles.indicator}>
        현재: {resolvedTheme === 'dark' ? '다크' : '라이트'}
      </span>
    </div>
  );
}
```

---

### 4. CSS 테마 변수

```css
/* src/styles/tokens.css */
:root {
  /* Light theme (기본) */
  --color-bg: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-text: #1a1a1a;
  --color-text-secondary: #666666;
  --color-border: #e0e0e0;
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
}

[data-theme='dark'] {
  /* Dark theme */
  --color-bg: #1a1a1a;
  --color-bg-secondary: #2d2d2d;
  --color-text: #f5f5f5;
  --color-text-secondary: #a0a0a0;
  --color-border: #404040;
  --color-primary: #60a5fa;
  --color-primary-hover: #3b82f6;
}
```

---

### 5. uiStore.ts — UI 상태 관리

```typescript
/* src/stores/ui/uiStore.ts */
import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;
}

interface UIActions {
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  isSidebarOpen: true,
  isModalOpen: false,
  modalContent: null,

  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  openModal: (content) => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),
}));
```

---

### 6. 스토어 테스트

```typescript
/* src/stores/theme/themeStore.test.ts */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore } from './themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    // 스토어 리셋
    useThemeStore.setState({ mode: 'system', resolvedTheme: 'light' });
    localStorage.clear();
  });

  it('should initialize with system mode', () => {
    const state = useThemeStore.getState();
    expect(state.mode).toBe('system');
  });

  it('should change mode to dark', () => {
    const { setMode } = useThemeStore.getState();
    setMode('dark');

    const state = useThemeStore.getState();
    expect(state.mode).toBe('dark');
    expect(state.resolvedTheme).toBe('dark');
  });

  it('should persist mode to localStorage', () => {
    const { setMode } = useThemeStore.getState();
    setMode('dark');

    const stored = JSON.parse(localStorage.getItem('theme-storage') || '{}');
    expect(stored.state.mode).toBe('dark');
  });

  it('should apply theme to document', () => {
    const { setMode } = useThemeStore.getState();
    setMode('dark');

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
```

---

## 재현 단계 (CLI 우선)

### 1. 패키지 설치

```bash
npm install zustand
```

### 2. 디렉토리 구조

```bash
mkdir -p src/stores/theme
mkdir -p src/stores/ui
mkdir -p src/components/ui/ThemeToggle
```

### 3. 구현 단계

1. **src/stores/theme/themeStore.ts**: Zustand + Persist
2. **src/stores/ui/uiStore.ts**: UI 상태 스토어
3. **src/stores/index.ts**: 배럴 파일
4. **src/hooks/useSystemTheme.ts**: 시스템 테마 감지
5. **src/styles/tokens.css**: CSS 변수에 다크 테마 추가
6. **src/components/ui/ThemeToggle/**: 테마 전환 UI
7. **src/main.tsx**: 초기 테마 적용
8. **src/App.tsx**: `useSystemTheme()` 호출

### 4. main.tsx에 초기 테마 적용

```typescript
// src/main.tsx
import { useThemeStore } from './stores';

// 앱 로드 전 테마 즉시 적용 (깜빡임 방지)
const theme = useThemeStore.getState().resolvedTheme;
document.documentElement.setAttribute('data-theme', theme);
```

---

## 검증 체크리스트

- [ ] `npm test -- --run` 실행 시 387개 테스트 통과
- [ ] ThemeToggle로 Light/Dark/System 전환 동작
- [ ] 새로고침 후에도 선택한 테마 유지 (localStorage)
- [ ] System 모드에서 OS 테마 변경 시 반영
- [ ] 다크 모드에서 CSS 변수 변경 확인

---

## 누락 정보

- ✅ 커밋 해시: `af6ce47b442767a56c02057b8456a87fc5faf231`
- ✅ 테스트 결과: 387개 통과 (+17)

**핵심 학습 포인트**:
- Zustand: `create()` 함수로 스토어 생성, Provider 불필요
- Persist 미들웨어: `partialize`로 저장할 상태 선택
- `onRehydrateStorage`: 복원 시 추가 로직 실행
- CSS 변수 + `[data-theme]` 선택자로 테마 구현
- `prefers-color-scheme` 미디어 쿼리로 시스템 테마 감지
