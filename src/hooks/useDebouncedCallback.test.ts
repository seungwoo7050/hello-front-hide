/**
 * useDebouncedCallback 훅 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedCallback } from './useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('지연 시간 후에 콜백이 호출된다', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current('test');
    });

    // 즉시 호출되지 않음
    expect(callback).not.toHaveBeenCalled();

    // 지연 시간 경과
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('test');
  });

  it('지연 시간 내 여러 호출은 마지막 것만 실행된다', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current('a');
      result.current('b');
      result.current('c');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('c');
  });

  it('여러 인자를 전달할 수 있다', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 200));

    act(() => {
      result.current('arg1', 'arg2', 123);
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 123);
  });

  it('콜백이 변경되어도 새 콜백이 사용된다', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { result, rerender } = renderHook(
      ({ callback }) => useDebouncedCallback(callback, 200),
      { initialProps: { callback: callback1 } }
    );

    act(() => {
      result.current();
    });

    // 콜백 변경
    rerender({ callback: callback2 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('컴포넌트 언마운트 시 타이머가 정리된다', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current();
    });

    // 언마운트
    unmount();

    // 지연 시간 경과 후에도 콜백이 호출되지 않음
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('반환된 함수 참조는 안정적이다', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(() => useDebouncedCallback(callback, 300));

    const firstReference = result.current;

    rerender();

    expect(result.current).toBe(firstReference);
  });
});
