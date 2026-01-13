# Commit #9 — 전역 상태 관리 (Zustand)

## Meta
- **난이도**: ⭐⭐⭐ 중급 (Intermediate)
- **권장 커밋 메시지**: `feat(state): add Zustand stores for theme and UI state`

## 학습 목표
1. Zustand를 사용한 전역 상태 관리를 이해한다
2. 테마(다크/라이트 모드) 토글 기능을 구현한다
3. UI 상태(사이드바 열림/닫힘)를 전역으로 관리한다
4. localStorage와 Zustand 연동으로 상태 영속성을 구현한다

## TL;DR
Zustand로 테마 스토어와 UI 스토어를 구현한다. 테마 스토어는 다크/라이트 모드를 전환하고 localStorage에 저장한다. UI 스토어는 사이드바 상태 등 UI 관련 전역 상태를 관리한다.

## 배경/맥락
React의 상태 관리 옵션 중 Zustand의 장점:
- **최소한의 보일러플레이트**: Redux 대비 훨씬 적은 코드
- **TypeScript 지원**: 타입 추론이 자연스러움
- **번들 크기**: ~2KB로 매우 작음
- **React 외부에서 접근**: 컴포넌트 밖에서도 상태 접근 가능
- **미들웨어 지원**: persist, devtools 등 내장 미들웨어

## 변경 파일 목록
### 추가된 파일 (6개)
- `src/stores/theme/themeStore.ts` — 테마 스토어
- `src/stores/theme/index.ts` — 테마 배럴
- `src/stores/ui/uiStore.ts` — UI 스토어
- `src/stores/ui/index.ts` — UI 배럴
- `src/stores/index.ts` — 스토어 배럴
- `src/components/ui/ThemeToggle/ThemeToggle.tsx` — 테마 토글 컴포넌트

### 수정된 파일 (4개)
- `package.json` — zustand 의존성 추가
- `src/App.tsx` — 테마 적용
- `src/components/layout/Header/Header.tsx` — ThemeToggle, 사이드바 토글 추가
- `src/styles/tokens.css` — 다크 모드 CSS 변수

## 코드 스니펫

### 1. 테마 스토어 (localStorage 영속성)
```typescript
/* src/stores/theme/themeStore.ts:1-60 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  resolvedTheme: ResolvedTheme
}

interface ThemeActions {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

type ThemeStore = ThemeState & ThemeActions

// 시스템 테마 감지
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light'
}

// 테마 해석
function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // 상태
      theme: 'system',
      resolvedTheme: getSystemTheme(),
      
      // 액션
      setTheme: (theme) => {
        set({ 
          theme, 
          resolvedTheme: resolveTheme(theme) 
        })
      },
      
      toggleTheme: () => {
        const current = get().resolvedTheme
        const next = current === 'light' ? 'dark' : 'light'
        set({ 
          theme: next, 
          resolvedTheme: next 
        })
      },
    }),
    {
      name: 'theme-storage', // localStorage 키
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }), // theme만 저장
    }
  )
)

// 시스템 테마 변경 감지 (컴포넌트 외부)
if (typeof window !== 'undefined') {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      const state = useThemeStore.getState()
      if (state.theme === 'system') {
        useThemeStore.setState({ 
          resolvedTheme: e.matches ? 'dark' : 'light' 
        })
      }
    })
}
```

**선정 이유**: Zustand의 persist 미들웨어와 시스템 테마 연동

**로직/흐름 설명**:
- `create()`: Zustand 스토어 생성
- `persist()`: localStorage 자동 동기화 미들웨어
- `partialize`: 저장할 상태 필드 선택 (resolvedTheme은 저장 안 함)
- `getState()`: 컴포넌트 외부에서 상태 접근
- `matchMedia`: 시스템 다크모드 감지

**런타임 영향**:
- 페이지 로드 시 localStorage에서 테마 복원
- 시스템 테마 변경 시 자동 반영 (theme === 'system'일 때)

**학습 포인트**:
- Q: 왜 theme과 resolvedTheme을 분리하는가?
- A: theme은 사용자 선택('system' 포함), resolvedTheme은 실제 적용 값
- Q: partialize를 왜 쓰는가?
- A: resolvedTheme은 런타임에 계산하므로 저장할 필요 없음

---

### 2. UI 스토어
```typescript
/* src/stores/ui/uiStore.ts:1-40 */
import { create } from 'zustand'

interface UIState {
  isSidebarOpen: boolean
  isMobileMenuOpen: boolean
  isCommandPaletteOpen: boolean
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
  toggleCommandPalette: () => void
  setCommandPaletteOpen: (open: boolean) => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>()((set) => ({
  // 상태
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  isCommandPaletteOpen: false,
  
  // 액션
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
}))

// 선택자 (성능 최적화)
export const selectIsSidebarOpen = (state: UIStore) => state.isSidebarOpen
export const selectIsMobileMenuOpen = (state: UIStore) => state.isMobileMenuOpen
```

**선정 이유**: 간단한 UI 상태 관리 패턴

**로직/흐름 설명**:
- persist 미들웨어 없이 기본 스토어 사용 (UI 상태는 세션 중에만 유효)
- toggle/set 액션 쌍으로 유연한 제어
- 선택자(selector)로 필요한 상태만 구독

**학습 포인트**:
- `set((state) => ...)`: 이전 상태 기반 업데이트
- `set({ ... })`: 직접 값 설정
- 선택자: 불필요한 리렌더링 방지

---

### 3. 테마 토글 컴포넌트
```typescript
/* src/components/ui/ThemeToggle/ThemeToggle.tsx:1-50 */
import { useThemeStore } from '../../../stores/theme'
import styles from './ThemeToggle.module.css'

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore()

  return (
    <div className={styles.container}>
      <button
        onClick={toggleTheme}
        className={styles.toggle}
        aria-label={`현재 ${resolvedTheme === 'dark' ? '다크' : '라이트'} 모드. 클릭하여 전환`}
        title="테마 전환"
      >
        {resolvedTheme === 'dark' ? (
          <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className={styles.select}
        aria-label="테마 선택"
      >
        <option value="light">라이트</option>
        <option value="dark">다크</option>
        <option value="system">시스템</option>
      </select>
    </div>
  )
}
```

**선정 이유**: Zustand 스토어를 사용하는 컴포넌트 예시

**로직/흐름 설명**:
- `useThemeStore()`: 스토어 전체 구독
- 토글 버튼: 빠른 전환
- Select: 세 가지 옵션 (light, dark, system)

**학습 포인트**:
- 훅처럼 사용: `useThemeStore()`
- 구조 분해로 필요한 것만 추출

---

### 4. 다크 모드 CSS 변수
```css
/* src/styles/tokens.css (다크 모드 추가) */
:root {
  /* 라이트 모드 (기본) */
  --color-background: #ffffff;
  --color-surface: #f5f5f5;
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #666666;
  --color-border: #e0e0e0;
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
}

[data-theme='dark'] {
  /* 다크 모드 */
  --color-background: #1a1a1a;
  --color-surface: #2d2d2d;
  --color-text-primary: #ffffff;
  --color-text-secondary: #a0a0a0;
  --color-border: #404040;
  --color-primary: #60a5fa;
  --color-primary-hover: #3b82f6;
}
```

**선정 이유**: CSS 변수를 사용한 테마 시스템

**로직/흐름 설명**:
- `:root`: 기본 라이트 모드 변수
- `[data-theme='dark']`: 다크 모드 오버라이드
- 컴포넌트에서 `var(--color-background)` 형태로 사용

---

### 5. App.tsx에서 테마 적용
```typescript
/* src/App.tsx (테마 적용 부분) */
import { useEffect } from 'react'
import { useThemeStore } from './stores/theme'

function App() {
  const { resolvedTheme } = useThemeStore()

  // 테마 변경 시 document에 data-theme 속성 설정
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])

  return (
    // ... 기존 JSX
  )
}
```

**선정 이유**: Zustand 상태를 DOM에 반영하는 패턴

**로직/흐름 설명**:
- `useEffect`: resolvedTheme 변경 시 `<html>` 태그에 `data-theme` 속성 설정
- CSS에서 `[data-theme='dark']` 선택자로 스타일 적용

## 재현 단계 (CLI 우선)

### CLI 명령어
```bash
# 1. Zustand 설치
npm install zustand

# 2. 개발 서버 실행
npm run dev

# 3. 테스트 실행
npm test -- --run

# 4. 빌드 확인
npm run build
```

### 구현 단계 (코드 작성 순서)
1. **Zustand 설치**: `npm install zustand`
2. **테마 스토어 생성**: `src/stores/theme/themeStore.ts`
3. **UI 스토어 생성**: `src/stores/ui/uiStore.ts`
4. **스토어 배럴 생성**: `src/stores/index.ts`
5. **다크 모드 CSS 변수 추가**: `src/styles/tokens.css`
6. **ThemeToggle 컴포넌트**: `src/components/ui/ThemeToggle/`
7. **App.tsx 수정**: 테마 적용 useEffect
8. **Header 수정**: ThemeToggle, 사이드바 토글 추가
9. **검증**: 다크/라이트 모드 전환 테스트

## 설명

### 설계 결정
1. **Zustand vs Context/Redux**: 적은 보일러플레이트, 좋은 TypeScript 지원
2. **persist 미들웨어**: 테마는 저장, UI 상태는 저장 안 함
3. **CSS 변수**: JavaScript 없이 CSS만으로 테마 전환

### 트레이드오프
- **Zustand vs Redux Toolkit**: RTK는 더 많은 기능이 있지만 복잡함
- **CSS 변수 vs CSS-in-JS**: CSS 변수는 런타임 오버헤드 없음
- **system 테마**: 추가 로직 필요하지만 UX 향상

### 스토어 분리 전략
| 스토어 | 영속성 | 용도 |
|-------|-------|------|
| themeStore | localStorage | 사용자 테마 선호도 |
| uiStore | 없음 | 세션 중 UI 상태 |

## 검증 체크리스트

### 자동 검증
```bash
npm run lint      # PASS
npm test -- --run # 모든 테스트 통과
npm run build     # 성공
```

### 수동 검증
- [ ] 테마 토글 버튼 클릭 시 다크/라이트 전환
- [ ] Select에서 system 선택 시 OS 테마 따라감
- [ ] 새로고침 후 테마 설정 유지
- [ ] 다크 모드에서 모든 컴포넌트 가독성 확인
- [ ] 사이드바 토글 동작 확인
- [ ] DevTools > Application > Local Storage에서 theme-storage 확인

## 누락 정보
- 없음
