# Commit #10 — 성능 최적화 (Performance Optimization)

## Meta

- **난이도**: ⭐⭐⭐⭐ 중상급 (Upper Intermediate)
- **권장 커밋 메시지**: `feat: add performance optimization with code splitting, memoization and debounce/throttle`

---

## 학습 목표

1. React.lazy + Suspense로 라우트 기반 코드 스플리팅을 적용할 수 있다
2. React.memo와 useCallback으로 불필요한 리렌더링을 방지할 수 있다
3. useDebounce, useThrottle 훅으로 과도한 상태 업데이트를 방지할 수 있다
4. Debounce vs Throttle의 차이를 이해하고 적절히 사용할 수 있다

---

## TL;DR

`React.lazy`로 페이지별 코드 스플리팅을 적용하고, `Suspense`로 로딩 상태를 처리한다. `React.memo`와 커스텀 비교 함수로 NoteCard 컴포넌트를 최적화한다. `useDebounce`, `useThrottle`, `useDebouncedCallback` 훅으로 검색, 스크롤 등 빈번한 이벤트를 제어한다.

---

## 배경/컨텍스트

### 왜 이 변경이 필요한가?

- **초기 로딩 시간 단축**: 코드 스플리팅으로 필요한 코드만 로드
- **리렌더링 최소화**: 메모이제이션으로 불필요한 계산 방지
- **이벤트 최적화**: 디바운스/스로틀로 과도한 API 호출 방지
- **사용자 경험 향상**: 부드러운 UI 반응

### Debounce vs Throttle

| 특성 | Debounce | Throttle |
|------|----------|----------|
| 동작 | 마지막 호출 후 지연 시간이 지나면 실행 | 일정 간격으로 최대 1번 실행 |
| 사용 케이스 | 검색 입력, 폼 유효성 검사 | 스크롤 이벤트, 리사이즈 |
| 타이밍 | 입력이 멈춘 후 실행 | 입력 중에도 주기적 실행 |

```
입력: a--b--c--d--e------
                  (300ms 지연)
                  
Debounce: ----------------e
Throttle: a-----c-----e----
           (100ms 간격)
```

### 영향 범위

- 라우터에 코드 스플리팅 적용
- NoteCard 컴포넌트 최적화
- 성능 유틸리티 훅 추가
- 테스트 수 387개 → 402개로 증가 (+15)

---

## 변경 파일 목록

### 추가된 파일 (7개)

| 카테고리 | 파일 | 설명 |
|----------|------|------|
| Hook | `src/hooks/useDebounce.ts` | 값 디바운스 |
| Hook | `src/hooks/useDebounce.test.ts` | 테스트 |
| Hook | `src/hooks/useThrottle.ts` | 값 스로틀 |
| Hook | `src/hooks/useThrottle.test.ts` | 테스트 |
| Hook | `src/hooks/useDebouncedCallback.ts` | 콜백 디바운스 |
| Hook | `src/hooks/useDebouncedCallback.test.ts` | 테스트 |
| Docs | `docs/stage-9-performance.md` | 문서 |

### 수정된 파일 (3개)

| 파일 | 변경 내용 |
|------|------|
| `src/router/index.tsx` | React.lazy 코드 스플리팅 |
| `src/features/notes/components/NoteCard/NoteCard.tsx` | React.memo 최적화 |
| `src/hooks/index.ts` | 배럴 export |

---

## 코드 스니펫

### 1. 라우트 기반 코드 스플리팅

```typescript
/* src/router/index.tsx */
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Spinner } from '../components/ui';

// 동적 import로 각 페이지를 별도 청크로 분리
const Home = lazy(() => import('../pages/Home').then(m => ({ default: m.Home })));
const About = lazy(() => import('../pages/About').then(m => ({ default: m.About })));
const Notes = lazy(() => import('../pages/Notes').then(m => ({ default: m.Notes })));
const Login = lazy(() => import('../pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('../pages/Register').then(m => ({ default: m.Register })));
const Playground = lazy(() => import('../pages/Playground').then(m => ({ default: m.Playground })));
const FormDemo = lazy(() => import('../pages/FormDemo').then(m => ({ default: m.FormDemo })));

// 폴백 컴포넌트
function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner size="lg" />
    </div>
  );
}

// Suspense 래퍼
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <LazyPage><Home /></LazyPage> },
      { path: '/about', element: <LazyPage><About /></LazyPage> },
      { path: '/notes', element: <ProtectedRoute><LazyPage><Notes /></LazyPage></ProtectedRoute> },
      { path: '/login', element: <PublicRoute><LazyPage><Login /></LazyPage></PublicRoute> },
      { path: '/register', element: <PublicRoute><LazyPage><Register /></LazyPage></PublicRoute> },
      { path: '/playground', element: <LazyPage><Playground /></LazyPage> },
      { path: '/form-demo', element: <LazyPage><FormDemo /></LazyPage> },
    ],
  },
]);
```

**빌드 결과 비교:**
```
# 코드 스플리팅 전
dist/assets/index.js   386.58 kB

# 코드 스플리팅 후
dist/assets/index-CfKd_iis.js   334.84 kB  (메인 번들)
dist/assets/Notes-BoZ9KbZw.js    21.85 kB  (Notes 페이지)
dist/assets/FormDemo-Bm1DfOVN.js 11.08 kB  (FormDemo 페이지)
...
```

---

### 2. React.memo + useCallback 최적화

```typescript
/* src/features/notes/components/NoteCard/NoteCard.tsx */
import { memo, useCallback } from 'react';
import type { Note } from '../../types';
import styles from './NoteCard.module.css';

interface NoteCardProps {
  note: Note;
  isSelected?: boolean;
  onSelect?: (note: Note) => void;
  onDelete?: (id: string) => void;
}

function NoteCardBase({ note, isSelected, onSelect, onDelete }: NoteCardProps) {
  // useCallback으로 핸들러 메모이제이션
  const handleClick = useCallback(() => {
    onSelect?.(note);
  }, [note, onSelect]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(note.id);
  }, [note.id, onDelete]);

  return (
    <article
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
    >
      <header className={styles.header}>
        <h3 className={styles.title}>{note.title}</h3>
        {note.isPinned && <span className={styles.pin}>📌</span>}
      </header>
      <p className={styles.content}>{note.content}</p>
      <footer className={styles.footer}>
        <span className={styles.date}>{new Date(note.updatedAt).toLocaleDateString()}</span>
        <button onClick={handleDelete} className={styles.deleteBtn}>삭제</button>
      </footer>
    </article>
  );
}

// memo로 감싸고 커스텀 비교 함수 제공
export const NoteCard = memo(NoteCardBase, (prevProps, nextProps) => {
  // true 반환 = 리렌더링 스킵
  return (
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.title === nextProps.note.title &&
    prevProps.note.content === nextProps.note.content &&
    prevProps.note.updatedAt === nextProps.note.updatedAt &&
    prevProps.note.isPinned === nextProps.note.isPinned &&
    prevProps.isSelected === nextProps.isSelected
  );
});
```

---

### 3. useDebounce 훅

```typescript
/* src/hooks/useDebounce.ts */
import { useState, useEffect } from 'react';

/**
 * 값의 변경을 지연시켜 과도한 업데이트를 방지
 * @param value - 디바운스할 값
 * @param delay - 지연 시간 (ms)
 * @returns 디바운스된 값
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

**사용 예시:**
```typescript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

useEffect(() => {
  // 타이핑이 멈춘 후 300ms 후에만 API 호출
  fetchResults(debouncedSearch);
}, [debouncedSearch]);
```

---

### 4. useThrottle 훅

```typescript
/* src/hooks/useThrottle.ts */
import { useState, useEffect, useRef } from 'react';

/**
 * 값의 변경 빈도를 제한 (지정된 간격마다 최대 1번만 업데이트)
 * @param value - 스로틀할 값
 * @param limit - 제한 간격 (ms)
 * @returns 스로틀된 값
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => clearTimeout(handler);
  }, [value, limit]);

  return throttledValue;
}
```

**사용 예시:**
```typescript
// 스크롤 이벤트
const [scrollY, setScrollY] = useState(0);
const throttledScrollY = useThrottle(scrollY, 100);

useEffect(() => {
  const handleScroll = () => setScrollY(window.scrollY);
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

---

### 5. useDebouncedCallback 훅

```typescript
/* src/hooks/useDebouncedCallback.ts */
import { useCallback, useRef, useEffect } from 'react';

/**
 * 콜백 함수의 호출을 지연시킴
 * @param callback - 디바운스할 콜백
 * @param delay - 지연 시간 (ms)
 * @returns 디바운스된 콜백
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // 최신 콜백 참조 유지
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}
```

**사용 예시:**
```typescript
const handleSearch = useDebouncedCallback((query: string) => {
  fetchSearchResults(query);
}, 300);

<input onChange={(e) => handleSearch(e.target.value)} />
```

---

### 6. 테스트 코드

```typescript
/* src/hooks/useDebounce.test.ts */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기값을 즉시 반환한다', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('지연 시간 전에는 값이 변경되지 않는다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    rerender({ value: 'b', delay: 300 });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('a');
  });

  it('지연 시간 후에 최종 값이 적용된다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    rerender({ value: 'b', delay: 300 });
    rerender({ value: 'c', delay: 300 });
    rerender({ value: 'd', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('d'); // 마지막 값만 적용
  });
});
```

---

## 재현 단계 (CLI 우선)

### 1. 디렉토리 확인

```bash
ls src/hooks/
# 기존 훅 파일 확인
```

### 2. 구현 단계

1. **src/hooks/useDebounce.ts**: 값 디바운스 훅
2. **src/hooks/useDebounce.test.ts**: 테스트
3. **src/hooks/useThrottle.ts**: 값 스로틀 훅
4. **src/hooks/useThrottle.test.ts**: 테스트
5. **src/hooks/useDebouncedCallback.ts**: 콜백 디바운스 훅
6. **src/hooks/useDebouncedCallback.test.ts**: 테스트
7. **src/hooks/index.ts**: 배럴 파일에 추가
8. **src/router/index.tsx**: React.lazy 적용
9. **src/features/notes/components/NoteCard/NoteCard.tsx**: React.memo 적용

### 3. 빌드 결과 확인

```bash
npm run build
# 청크 파일 분리 확인
ls dist/assets/
```

---

## 검증 체크리스트

- [ ] `npm test -- --run` 실행 시 402개 테스트 통과
- [ ] `npm run build` 후 청크 파일이 분리됨
- [ ] 검색 입력 시 디바운스 적용 확인 (Network 탭)
- [ ] NoteCard가 불필요하게 리렌더링되지 않음 (React DevTools)
- [ ] 페이지 전환 시 Suspense 폴백 표시

---

## 누락 정보

- ✅ 커밋 해시: `2b2a2cb4f9cc06c28de5da04b41aff1b71dc1f76`
- ✅ 테스트 결과: 402개 통과 (+15)

**핵심 학습 포인트**:
- `React.lazy`: 동적 import로 코드 분할
- `Suspense`: 비동기 컴포넌트 로딩 상태 처리
- `React.memo`: 커스텀 비교 함수로 정밀한 리렌더링 제어
- `useDebounce`: 연속 변경 후 마지막 값만 적용
- `useThrottle`: 일정 간격으로 값 업데이트 제한
- `useDebouncedCallback`: 콜백 호출 지연
