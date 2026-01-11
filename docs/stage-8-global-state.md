# Stage 8: 전역 상태 관리 (Zustand)

## 학습 목표

이 스테이지에서는 Zustand를 사용한 전역 상태 관리를 배웁니다:

- **Zustand 기본**: 간결하고 유연한 상태 관리 라이브러리
- **Store 패턴**: 상태와 액션을 하나의 store로 관리
- **Persist Middleware**: localStorage를 통한 상태 영속화
- **선택자 패턴**: 성능 최적화를 위한 세분화된 구독
- **테마 시스템**: 라이트/다크/시스템 모드 지원

## 주요 개념

### 1. Zustand Store 생성

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'system',
      resolvedTheme: getSystemTheme(),
      setMode: (mode) => {
        const resolvedTheme = resolveTheme(mode);
        applyTheme(resolvedTheme);
        set({ mode, resolvedTheme });
      },
      toggleTheme: () => {
        const { mode } = get();
        const nextMode = mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system';
        // ...
      },
    }),
    { name: 'theme-storage' }
  )
);
```

### 2. Persist Middleware 활용

```typescript
persist(
  storeCreator,
  {
    name: 'storage-key',           // localStorage 키
    onRehydrateStorage: () => (state) => {
      // 스토리지에서 복원 시 실행되는 콜백
      if (state) {
        applyTheme(state.resolvedTheme);
      }
    },
  }
)
```

### 3. 선택자 훅 패턴

```typescript
// 전체 스토어를 구독하는 대신 특정 상태만 구독
export const useSidebarOpen = () => useUIStore((state) => state.sidebar.isOpen);
export const useSidebarCollapsed = () => useUIStore((state) => state.sidebar.isCollapsed);
export const useModalState = () => useUIStore((state) => state.modal);
export const useIsLoading = () => useUIStore((state) => state.isLoading);
```

### 4. 시스템 테마 감지

```typescript
// 시스템 테마 감지
function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// 시스템 테마 변경 감지 리스너
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const state = useThemeStore.getState();
  if (state.mode === 'system') {
    const resolvedTheme = e.matches ? 'dark' : 'light';
    applyTheme(resolvedTheme);
    useThemeStore.setState({ resolvedTheme });
  }
});
```

### 5. CSS 테마 변수 시스템

```css
/* 기본 (라이트 모드) */
:root {
  --color-background: #ffffff;
  --color-text: var(--color-gray-900);
  --color-border: var(--color-gray-200);
}

/* 다크 모드 - 수동 설정 */
[data-theme='dark'] {
  --color-background: var(--color-gray-900);
  --color-text: var(--color-gray-100);
  --color-border: var(--color-gray-700);
}

/* 다크 모드 - 시스템 설정 (light 수동 설정이 아닐 때만) */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --color-background: var(--color-gray-900);
    /* ... */
  }
}
```

## 파일 구조

```
src/
├── stores/
│   ├── theme/
│   │   ├── types.ts          # 테마 타입 정의
│   │   ├── store.ts          # 테마 스토어 (persist)
│   │   ├── store.test.ts     # 테마 스토어 테스트
│   │   └── index.ts          # 배럴 export
│   ├── ui/
│   │   ├── types.ts          # UI 상태 타입
│   │   ├── store.ts          # UI 스토어
│   │   ├── store.test.ts     # UI 스토어 테스트
│   │   └── index.ts          # 배럴 export
│   └── index.ts              # 메인 배럴 export
├── components/
│   └── ui/
│       └── ThemeToggle/
│           ├── ThemeToggle.tsx
│           ├── ThemeToggle.module.css
│           ├── ThemeToggle.test.tsx
│           └── index.ts
└── styles/
    └── tokens.css            # 다크 모드 CSS 변수 추가
```

## 구현된 기능

### 테마 스토어 (`useThemeStore`)

| 상태/액션 | 설명 |
|-----------|------|
| `mode` | 현재 테마 모드 (`'light'` \| `'dark'` \| `'system'`) |
| `resolvedTheme` | 실제 적용되는 테마 (`'light'` \| `'dark'`) |
| `setMode(mode)` | 테마 모드 설정 |
| `toggleTheme()` | 테마 순환 (system → light → dark → system) |

### UI 스토어 (`useUIStore`)

| 상태/액션 | 설명 |
|-----------|------|
| `sidebar` | 사이드바 상태 (isOpen, isCollapsed) |
| `modal` | 모달 상태 (isOpen, content) |
| `isLoading` | 전역 로딩 상태 |
| `toggleSidebar()` | 사이드바 토글 |
| `openModal(content)` | 모달 열기 |
| `closeModal()` | 모달 닫기 |
| `setLoading(bool)` | 로딩 상태 설정 |

### ThemeToggle 컴포넌트

```tsx
<ThemeToggle />
<ThemeToggle size="lg" />
<ThemeToggle className="custom" />
```

## Zustand vs 다른 상태 관리 라이브러리

| 특징 | Zustand | Redux | Context API |
|------|---------|-------|-------------|
| 보일러플레이트 | 최소 | 많음 | 적음 |
| 번들 크기 | ~2KB | ~7KB | 0 (내장) |
| DevTools | 지원 | 지원 | 제한적 |
| 미들웨어 | 지원 | 지원 | 불가 |
| 성능 | 우수 | 우수 | 최적화 필요 |
| 학습 곡선 | 낮음 | 높음 | 낮음 |

## 테스트 코드 예시

### 스토어 테스트

```typescript
describe('테마 스토어', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('toggleTheme으로 테마를 순환할 수 있다', async () => {
    const { useThemeStore } = await import('./store');
    
    expect(useThemeStore.getState().mode).toBe('system');
    
    act(() => {
      useThemeStore.getState().toggleTheme();
    });
    expect(useThemeStore.getState().mode).toBe('light');
    
    act(() => {
      useThemeStore.getState().toggleTheme();
    });
    expect(useThemeStore.getState().mode).toBe('dark');
  });
});
```

## 베스트 프랙티스

### 1. 스토어 분리

```typescript
// ✅ 좋음: 도메인별 스토어 분리
useThemeStore  // 테마 관련만
useUIStore     // UI 상태만
useAuthStore   // 인증 관련만

// ❌ 피해야 함: 하나의 거대한 스토어
useGlobalStore // 모든 것을 포함
```

### 2. 선택자로 성능 최적화

```typescript
// ✅ 좋음: 필요한 상태만 구독
const isOpen = useUIStore((state) => state.sidebar.isOpen);

// ❌ 피해야 함: 전체 상태 구독
const { sidebar, modal, isLoading } = useUIStore();
```

### 3. 액션에서 부수 효과 처리

```typescript
// ✅ 좋음: 액션 내에서 DOM 조작
setMode: (mode) => {
  const resolvedTheme = resolveTheme(mode);
  applyTheme(resolvedTheme);  // DOM에 테마 적용
  set({ mode, resolvedTheme });
}
```

## 다음 단계

- Stage 9에서는 성능 최적화를 다룹니다:
  - `React.lazy`와 `Suspense`를 사용한 코드 스플리팅
  - `React.memo`, `useMemo`, `useCallback`으로 리렌더링 최적화
  - 라우트 기반 지연 로딩
