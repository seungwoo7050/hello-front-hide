/**
 * useDebounce 훅 테스트
 */
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

  it('지연 시간 후에 값이 업데이트된다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // 값 변경
    rerender({ value: 'updated', delay: 500 })

    // 지연 시간 전에는 이전 값 유지
    expect(result.current).toBe('initial')

    // 지연 시간 경과
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated')
  })

  it('지연 시간 내 연속 변경 시 마지막 값만 적용된다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    )

    expect(result.current).toBe('a')

    // 빠르게 연속 변경
    rerender({ value: 'b', delay: 300 })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    rerender({ value: 'c', delay: 300 })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    rerender({ value: 'd', delay: 300 })

    // 아직 변경 안됨
    expect(result.current).toBe('a')

    // 마지막 변경 후 지연 시간 경과
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // 마지막 값만 적용
    expect(result.current).toBe('d')
  })

  it('지연 시간이 변경되면 새로운 지연 시간이 적용된다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    rerender({ value: 'updated', delay: 100 })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current).toBe('updated')
  })

  it('객체 값도 debounce할 수 있다', () => {
    const initialObj = { name: 'Alice' }
    const updatedObj = { name: 'Bob' }

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 300 } }
    )

    expect(result.current).toBe(initialObj)

    rerender({ value: updatedObj, delay: 300 })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe(updatedObj)
  })
})
