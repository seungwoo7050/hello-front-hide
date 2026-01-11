/**
 * useThrottle 훅
 * 값의 변경 빈도를 제한
 */
import { useState, useEffect, useRef } from 'react';

/**
 * 값을 throttle하는 훅
 * @param value - throttle할 값
 * @param limit - 최소 간격 (ms)
 * @returns throttle된 값
 * 
 * @example
 * ```tsx
 * const [scrollY, setScrollY] = useState(0);
 * const throttledScrollY = useThrottle(scrollY, 100);
 * 
 * useEffect(() => {
 *   const handleScroll = () => setScrollY(window.scrollY);
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, []);
 * 
 * // throttledScrollY는 100ms마다 최대 1번만 업데이트
 * ```
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRanRef = useRef<number | null>(null);

  useEffect(() => {
    // 초기화: 첫 실행 시 lastRan 설정
    if (lastRanRef.current === null) {
      lastRanRef.current = Date.now();
    }

    const lastRan = lastRanRef.current;
    const elapsed = Date.now() - lastRan;
    const remaining = Math.max(limit - elapsed, 0);

    const handler = setTimeout(() => {
      const now = Date.now();
      if (lastRanRef.current !== null && now - lastRanRef.current >= limit) {
        setThrottledValue(value);
        lastRanRef.current = now;
      }
    }, remaining);

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

export default useThrottle;
