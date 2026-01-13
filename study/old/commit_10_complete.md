# Commit #10 — 성능 최적화

## Meta
- **난이도**: ⭐⭐⭐⭐ 고급 (Advanced)
- **권장 커밋 메시지**: `perf(app): add debounce, throttle hooks and performance optimizations`

## 학습 목표
1. useDebounce, useThrottle 커스텀 훅을 구현한다
2. useDebouncedCallback 훅으로 콜백 함수를 최적화한다
3. React.memo, useMemo, useCallback의 적절한 사용법을 학습한다
4. 성능 최적화 훅의 테스트 작성 패턴을 익힌다

## TL;DR
검색 입력 최적화를 위한 debounce/throttle 훅을 구현한다. 각 훅에 대한 테스트를 작성하고, 불필요한 리렌더링을 방지한다. 기존 테스트 + 신규 18개로 총 357개 테스트 통과.

## 배경/맥락
프론트엔드 성능 최적화의 핵심 기법:
- **Debounce**: 연속된 이벤트 중 마지막 이벤트만 처리 (검색 입력)
- **Throttle**: 일정 간격으로 이벤트 처리 (스크롤, 리사이즈)
- **Memoization**: 불필요한 재계산/재렌더링 방지

## 변경 파일 목록
### 추가된 파일 (6개)
- `src/hooks/useDebounce.ts` — 값 디바운스 훅
- `src/hooks/useDebounce.test.ts` — 디바운스 훅 테스트
- `src/hooks/useDebouncedCallback.ts` — 콜백 디바운스 훅
- `src/hooks/useDebouncedCallback.test.ts` — 콜백 디바운스 테스트
- `src/hooks/useThrottle.ts` — 쓰로틀 훅
- `src/hooks/useThrottle.test.ts` — 쓰로틀 테스트

### 수정된 파일 (2개)
- `src/hooks/index.ts` — 훅 배럴 업데이트
- `src/features/notes/NotesFilter.tsx` — 검색에 debounce 적용

## 코드 스니펫

### 1. useDebounce 훅
```typescript
/* src/hooks/useDebounce.ts:1-35 */
import { useEffect, useState } from 'react'

/**
 * 값의 변경을 지정된 시간만큼 지연시키는 훅
 * 
 * @param value - 디바운스할 값
 * @param delay - 지연 시간 (밀리초)
 * @returns 디바운스된 값
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearch = useDebounce(searchTerm, 300)
 * 
 * useEffect(() => {
 *   // API 호출은 사용자가 타이핑을 멈춘 후 300ms 후에 실행
 *   fetchSearchResults(debouncedSearch)
 * }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // delay 후에 값 업데이트
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // 클린업: value나 delay가 변경되면 이전 타이머 취소
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
```

**선정 이유**: 가장 기본적인 debounce 패턴

**로직/흐름 설명**:
- `useState`: 디바운스된 값 저장
- `useEffect`: value 변경 시 타이머 설정
- 클린업 함수: 이전 타이머 취소 (연속 입력 시 마지막만 반영)

**런타임 영향**:
- 연속된 값 변경 중에는 debouncedValue가 업데이트되지 않음
- 마지막 변경 후 delay ms 후에 업데이트

**학습 포인트**:
- Q: 왜 clearTimeout을 클린업에서 호출하는가?
- A: value가 연속 변경될 때 이전 타이머를 취소하여 마지막 값만 반영

---

### 2. useDebounce 테스트
```typescript
/* src/hooks/useDebounce.test.ts:1-80 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('초기값을 즉시 반환한다', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('지연 시간 후에 값을 업데이트한다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    // 값 변경
    rerender({ value: 'updated', delay: 500 })

    // 지연 시간 전에는 이전 값 유지
    expect(result.current).toBe('initial')

    // 지연 시간 경과
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // 값 업데이트됨
    expect(result.current).toBe('updated')
  })

  it('연속된 변경 중에는 업데이트하지 않는다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 500 } }
    )

    // 빠르게 연속 변경
    rerender({ value: 'b', delay: 500 })
    act(() => vi.advanceTimersByTime(200))

    rerender({ value: 'c', delay: 500 })
    act(() => vi.advanceTimersByTime(200))

    rerender({ value: 'd', delay: 500 })

    // 아직 초기값
    expect(result.current).toBe('a')

    // 마지막 변경 후 500ms 경과
    act(() => vi.advanceTimersByTime(500))

    // 최종 값만 반영
    expect(result.current).toBe('d')
  })

  it('delay가 변경되면 타이머를 리셋한다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    rerender({ value: 'updated', delay: 500 })
    act(() => vi.advanceTimersByTime(300))

    // delay 변경 (타이머 리셋)
    rerender({ value: 'updated', delay: 1000 })
    act(() => vi.advanceTimersByTime(500))

    // 아직 업데이트 안 됨
    expect(result.current).toBe('initial')

    act(() => vi.advanceTimersByTime(500))

    // 이제 업데이트됨
    expect(result.current).toBe('updated')
  })
})
```

**선정 이유**: Vitest의 fake timer를 사용한 비동기 훅 테스트

**로직/흐름 설명**:
- `vi.useFakeTimers()`: 타이머 모킹
- `vi.advanceTimersByTime(ms)`: 시간 경과 시뮬레이션
- `renderHook`: 훅 단독 테스트
- `rerender`: props 변경 시뮬레이션

**학습 포인트**:
- `act()`: 상태 업데이트를 동기적으로 처리
- fake timer: 실제 시간 대기 없이 테스트

---

### 3. useDebouncedCallback 훅
```typescript
/* src/hooks/useDebouncedCallback.ts:1-50 */
import { useCallback, useEffect, useRef } from 'react'

/**
 * 콜백 함수를 디바운스하는 훅
 * 
 * @param callback - 디바운스할 콜백 함수
 * @param delay - 지연 시간 (밀리초)
 * @returns 디바운스된 콜백 함수
 * 
 * @example
 * const handleSearch = useDebouncedCallback((term: string) => {
 *   fetchSearchResults(term)
 * }, 300)
 * 
 * <input onChange={(e) => handleSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 최신 콜백 참조 유지
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // 이전 타이머 취소
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // 새 타이머 설정
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  )

  return debouncedCallback
}
```

**선정 이유**: 콜백 함수 디바운스 (값 디바운스와 다른 패턴)

**로직/흐름 설명**:
- `useRef(callback)`: 최신 콜백 참조 유지 (클로저 문제 해결)
- `useRef(timeout)`: 타이머 ID 저장
- `useCallback`: 안정적인 함수 참조 반환

**런타임 영향**:
- 호출마다 이전 타이머 취소 → 마지막 호출만 실행
- 콜백 변경 시에도 동작 유지

**학습 포인트**:
- Q: useDebounce vs useDebouncedCallback 차이는?
- A: useDebounce는 값, useDebouncedCallback은 함수를 디바운스
- Q: 왜 callbackRef를 사용하는가?
- A: useCallback의 의존성 배열에 callback을 넣지 않기 위해 (안정성)

---

### 4. useThrottle 훅
```typescript
/* src/hooks/useThrottle.ts:1-45 */
import { useCallback, useRef } from 'react'

/**
 * 콜백 함수를 쓰로틀하는 훅
 * 
 * @param callback - 쓰로틀할 콜백 함수
 * @param delay - 최소 호출 간격 (밀리초)
 * @returns 쓰로틀된 콜백 함수
 * 
 * @example
 * const handleScroll = useThrottle(() => {
 *   console.log('Scroll position:', window.scrollY)
 * }, 100)
 * 
 * window.addEventListener('scroll', handleScroll)
 */
export function useThrottle<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback)
  const lastCalledRef = useRef<number>(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 최신 콜백 참조 유지
  callbackRef.current = callback

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const timeSinceLastCall = now - lastCalledRef.current

      // delay 이후면 즉시 실행
      if (timeSinceLastCall >= delay) {
        lastCalledRef.current = now
        callbackRef.current(...args)
      } else {
        // 아니면 남은 시간 후 실행 예약 (trailing)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCalledRef.current = Date.now()
          callbackRef.current(...args)
        }, delay - timeSinceLastCall)
      }
    },
    [delay]
  )

  return throttledCallback
}
```

**선정 이유**: debounce와 다른 throttle 패턴

**로직/흐름 설명**:
- `lastCalledRef`: 마지막 호출 시간 기록
- `timeSinceLastCall >= delay`: 충분한 시간이 지났으면 즉시 실행
- trailing 호출: 마지막 호출도 누락되지 않도록 예약

**런타임 영향**:
- delay 간격으로 최대 1회만 실행
- 스크롤, 리사이즈 이벤트에 적합

**학습 포인트**:
- Debounce: 마지막 호출만 실행 (검색)
- Throttle: 일정 간격으로 실행 (스크롤)

---

### 5. 검색에 debounce 적용
```typescript
/* src/features/notes/NotesFilter.tsx (변경 부분) */
import { useState } from 'react'
import { useDebounce } from '../../hooks'

export function NotesFilter({ onFilterChange }: NotesFilterProps) {
  const [searchInput, setSearchInput] = useState('')
  
  // 검색어 디바운스 (300ms)
  const debouncedSearch = useDebounce(searchInput, 300)

  // 디바운스된 검색어가 변경되면 필터 업데이트
  useEffect(() => {
    onFilterChange({ search: debouncedSearch })
  }, [debouncedSearch, onFilterChange])

  return (
    <Input
      type="search"
      placeholder="검색..."
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
    />
  )
}
```

**선정 이유**: useDebounce의 실제 적용 예시

**로직/흐름 설명**:
- 사용자 입력(searchInput)은 즉시 UI에 반영
- API 호출은 debouncedSearch가 변경될 때만 (300ms 후)

**런타임 영향**:
- 타이핑 중 API 호출 횟수 감소
- 서버 부하 감소, 네트워크 비용 절감

## 재현 단계 (CLI 우선)

### CLI 명령어
```bash
# 1. 개발 서버 실행
npm run dev

# 2. 테스트 실행 (357개)
npm test -- --run

# 3. 특정 훅 테스트만 실행
npm test -- --run useDebounce

# 4. 빌드 확인
npm run build
```

### 구현 단계 (코드 작성 순서)
1. **useDebounce 훅 구현**: `src/hooks/useDebounce.ts`
2. **useDebounce 테스트 작성**: `src/hooks/useDebounce.test.ts`
3. **useDebouncedCallback 훅 구현**: `src/hooks/useDebouncedCallback.ts`
4. **useDebouncedCallback 테스트 작성**: `src/hooks/useDebouncedCallback.test.ts`
5. **useThrottle 훅 구현**: `src/hooks/useThrottle.ts`
6. **useThrottle 테스트 작성**: `src/hooks/useThrottle.test.ts`
7. **훅 배럴 업데이트**: `src/hooks/index.ts`
8. **NotesFilter에 debounce 적용**
9. **검증**: `npm test` (357개 통과)

## 설명

### 설계 결정
1. **값 vs 콜백 디바운스 분리**: 사용 사례에 따라 선택
2. **Trailing throttle**: 마지막 호출 누락 방지
3. **useRef로 콜백 참조**: useCallback 의존성 배열 최소화

### 트레이드오프
- **lodash.debounce vs 커스텀 훅**: 커스텀 훅은 React 생명주기와 더 잘 통합
- **300ms delay**: 사용자 경험과 서버 부하의 균형점

### 테스트 통계
| 파일 | 테스트 수 |
|-----|----------|
| useDebounce.test.ts | 4 |
| useDebouncedCallback.test.ts | 6 |
| useThrottle.test.ts | 8 |
| **Stage 9 추가** | **18** |
| **전체 누적** | **357** |

## 검증 체크리스트

### 자동 검증
```bash
npm run lint      # PASS
npm test -- --run # 357 tests passed
npm run build     # 성공
```

### 수동 검증
- [ ] 검색창에 빠르게 타이핑 시 API 호출 횟수 감소 확인 (Network 탭)
- [ ] 타이핑 멈춘 후 300ms 후에 API 호출 확인
- [ ] 스크롤 시 throttle 동작 확인 (콘솔 로그)

## 누락 정보
- 없음
