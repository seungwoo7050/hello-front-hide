/**
 * useDebounce 훅
 * 값의 변경을 지연시켜 과도한 업데이트를 방지
 */
import { useState, useEffect } from 'react';

/**
 * 값을 debounce하는 훅
 * @param value - debounce할 값
 * @param delay - 지연 시간 (ms)
 * @returns debounce된 값
 * 
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 300);
 * 
 * useEffect(() => {
 *   // debouncedSearch가 변경될 때만 API 호출
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
