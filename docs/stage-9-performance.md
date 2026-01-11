# Stage 9: 성능 최적화

## 학습 목표

이 스테이지에서는 React 애플리케이션의 성능 최적화 기법을 배웁니다:

- **코드 스플리팅**: React.lazy와 Suspense를 사용한 동적 import
- **메모이제이션**: React.memo, useMemo, useCallback으로 불필요한 리렌더링 방지
- **성능 유틸리티**: useDebounce, useThrottle로 과도한 상태 업데이트 방지

## 주요 개념

### 1. 라우트 기반 코드 스플리팅

```typescript
import { lazy, Suspense } from 'react';

// 동적 import로 각 페이지를 별도 청크로 분리
const Home = lazy(() => import('../pages/Home').then(m => ({ default: m.Home })));
const About = lazy(() => import('../pages/About').then(m => ({ default: m.About })));
const Notes = lazy(() => import('../pages/Notes').then(m => ({ default: m.Notes })));

// 폴백 컴포넌트
function PageLoader() {
  return <Spinner size="large" />;
}

// Suspense로 감싸서 로딩 상태 처리
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// 라우터에서 사용
{
  path: 'about',
  element: (
    <LazyPage>
      <About />
    </LazyPage>
  ),
}
```

**빌드 결과 비교:**
```
# 코드 스플리팅 전
dist/assets/index.js   386.58 kB

# 코드 스플리팅 후
dist/assets/index-CfKd_iis.js   334.84 kB  (메인 번들)
dist/assets/index-BoZ9KbZw.js    21.85 kB  (Notes 페이지)
dist/assets/index-Bm1DfOVN.js    11.08 kB  (FormDemo 페이지)
...
```

### 2. React.memo로 컴포넌트 메모이제이션

```typescript
import { memo, useCallback } from 'react';

// 내부 컴포넌트
function NoteCardBase({ note, isSelected, onSelect, onDelete }: Props) {
  // useCallback으로 핸들러 메모이제이션
  const handleClick = useCallback(() => {
    onSelect?.(note);
  }, [note, onSelect]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(note.id);
  }, [note.id, onDelete]);

  return (
    <article onClick={handleClick}>
      {/* ... */}
    </article>
  );
}

// memo로 감싸고 커스텀 비교 함수 제공
export const NoteCard = memo(NoteCardBase, (prevProps, nextProps) => {
  // true 반환 = 리렌더링 스킵
  return (
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.title === nextProps.note.title &&
    prevProps.note.updatedAt === nextProps.note.updatedAt &&
    prevProps.isSelected === nextProps.isSelected
  );
});
```

### 3. useDebounce 훅

```typescript
/**
 * 값의 변경을 지연시켜 과도한 업데이트를 방지
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

// 사용 예시
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

useEffect(() => {
  // 타이핑이 멈춘 후 300ms 후에만 API 호출
  fetchResults(debouncedSearch);
}, [debouncedSearch]);
```

### 4. useThrottle 훅

```typescript
/**
 * 값의 변경 빈도를 제한 (지정된 간격마다 최대 1번만 업데이트)
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

// 사용 예시: 스크롤 이벤트
const [scrollY, setScrollY] = useState(0);
const throttledScrollY = useThrottle(scrollY, 100);
```

### 5. useDebouncedCallback 훅

```typescript
/**
 * 콜백 함수의 호출을 지연시킴
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

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

// 사용 예시
const handleSearch = useDebouncedCallback((query: string) => {
  fetchSearchResults(query);
}, 300);

<input onChange={(e) => handleSearch(e.target.value)} />
```

## 파일 구조

```
src/
├── router/
│   └── index.tsx              # React.lazy로 코드 스플리팅 적용
├── hooks/
│   ├── useDebounce.ts         # 값 debounce
│   ├── useDebounce.test.ts
│   ├── useThrottle.ts         # 값 throttle
│   ├── useThrottle.test.ts
│   ├── useDebouncedCallback.ts # 콜백 debounce
│   ├── useDebouncedCallback.test.ts
│   └── index.ts               # 배럴 export
└── features/notes/components/
    └── NoteCard/
        └── NoteCard.tsx       # React.memo + useCallback 적용
```

## Debounce vs Throttle

| 특성 | Debounce | Throttle |
|------|----------|----------|
| 동작 | 마지막 호출 후 지연 시간이 지나면 실행 | 일정 간격으로 최대 1번 실행 |
| 사용 케이스 | 검색 입력, 폼 유효성 검사 | 스크롤 이벤트, 리사이즈 |
| 타이밍 | 입력이 멈춘 후 실행 | 입력 중에도 주기적 실행 |

**시각적 비교:**
```
입력: a--b--c--d--e------
                  (300ms 지연)
                  
Debounce: ----------------e
Throttle: a-----c-----e----
           (100ms 간격)
```

## 테스트 코드 예시

```typescript
describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('지연 시간 내 연속 변경 시 마지막 값만 적용된다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    rerender({ value: 'b', delay: 300 });
    rerender({ value: 'c', delay: 300 });
    rerender({ value: 'd', delay: 300 });

    expect(result.current).toBe('a'); // 아직 변경 안됨

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('d'); // 마지막 값만 적용
  });
});
```

## 성능 최적화 베스트 프랙티스

### 1. 언제 메모이제이션을 사용할까?

```typescript
// ✅ 좋음: 리스트 아이템 (많은 렌더링)
export const ListItem = memo(({ item, onClick }) => ...);

// ✅ 좋음: 비용이 큰 계산
const expensiveResult = useMemo(() => {
  return items.filter(/* 복잡한 필터 */).map(/* 복잡한 변환 */);
}, [items]);

// ❌ 피해야 함: 간단한 컴포넌트 (오버헤드가 더 클 수 있음)
export const SimpleDiv = memo(({ text }) => <div>{text}</div>);
```

### 2. 콜백 최적화

```typescript
// ✅ 좋음: 자식에게 전달되는 콜백
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ❌ 피해야 함: 로컬에서만 사용되는 함수
const localHandler = () => setCount(c => c + 1);
```

### 3. 불필요한 리렌더링 방지

```typescript
// ✅ 좋음: 필요한 상태만 구독
const count = useStore(state => state.count);

// ❌ 피해야 함: 전체 상태 구독
const { count, name, email, ... } = useStore();
```

## 다음 단계

- Stage 10에서는 프로덕션 준비를 다룹니다:
  - 에러 바운더리로 에러 처리
  - 최종 코드 정리 및 문서화
