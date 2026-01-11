/**
 * useThrottle 훅 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThrottle } from './useThrottle';

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기값을 즉시 반환한다', () => {
    const { result } = renderHook(() => useThrottle('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('limit 시간 내 변경은 무시된다', () => {
    const { result, rerender } = renderHook(
      ({ value, limit }) => useThrottle(value, limit),
      { initialProps: { value: 0, limit: 300 } }
    );

    expect(result.current).toBe(0);

    // 빠르게 여러 번 변경
    rerender({ value: 1, limit: 300 });
    rerender({ value: 2, limit: 300 });
    rerender({ value: 3, limit: 300 });

    // limit 시간 경과 전 - 아직 0
    expect(result.current).toBe(0);
  });

  it('limit 시간 후에 마지막 값으로 업데이트된다', () => {
    const { result, rerender } = renderHook(
      ({ value, limit }) => useThrottle(value, limit),
      { initialProps: { value: 0, limit: 300 } }
    );

    rerender({ value: 5, limit: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(5);
  });

  it('limit 간격으로 값이 업데이트된다', () => {
    const { result, rerender } = renderHook(
      ({ value, limit }) => useThrottle(value, limit),
      { initialProps: { value: 0, limit: 100 } }
    );

    // 첫 번째 업데이트
    rerender({ value: 1, limit: 100 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(1);

    // 두 번째 업데이트
    rerender({ value: 2, limit: 100 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(2);
  });
});
