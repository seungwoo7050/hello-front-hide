import { useState, useCallback, useEffect } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>, () => void] {
  // 초기 값 읽기
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 값 저장
  const setValue: SetValue<T> = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          // 다른 탭/창에서 변경 감지를 위한 커스텀 이벤트
          window.dispatchEvent(new CustomEvent('local-storage', { detail: { key } }));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // 값 삭제
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
        window.dispatchEvent(new CustomEvent('local-storage', { detail: { key } }));
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // 다른 탭/창에서의 변경 감지
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch {
          setStoredValue(initialValue);
        }
      }
    };

    // 같은 탭 내 커스텀 이벤트 핸들링
    const handleLocalStorageChange = (event: CustomEvent<{ key: string }>) => {
      if (event.detail.key === key) {
        setStoredValue(readValue());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleLocalStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleLocalStorageChange as EventListener);
    };
  }, [key, initialValue, readValue]);

  return [storedValue, setValue, removeValue];
}
