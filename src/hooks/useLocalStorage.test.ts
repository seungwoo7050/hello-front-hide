import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  describe('초기화', () => {
    it('localStorage에 값이 없으면 초기값을 반환한다', () => {
      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'initial')
      )
      expect(result.current[0]).toBe('initial')
    })

    it('localStorage에 저장된 값이 있으면 그 값을 반환한다', () => {
      window.localStorage.setItem('test-key', JSON.stringify('stored-value'))
      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'initial')
      )
      expect(result.current[0]).toBe('stored-value')
    })

    it('객체도 저장하고 읽을 수 있다', () => {
      const storedObject = { name: '테스트', count: 42 }
      window.localStorage.setItem('test-object', JSON.stringify(storedObject))

      const { result } = renderHook(() =>
        useLocalStorage('test-object', { name: '', count: 0 })
      )

      expect(result.current[0]).toEqual(storedObject)
    })

    it('배열도 저장하고 읽을 수 있다', () => {
      const storedArray = [1, 2, 3, 4, 5]
      window.localStorage.setItem('test-array', JSON.stringify(storedArray))

      const { result } = renderHook(() =>
        useLocalStorage<number[]>('test-array', [])
      )

      expect(result.current[0]).toEqual(storedArray)
    })
  })

  describe('값 저장', () => {
    it('값을 저장하면 localStorage에 저장된다', () => {
      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'initial')
      )

      act(() => {
        result.current[1]('new-value')
      })

      expect(result.current[0]).toBe('new-value')
      expect(JSON.parse(window.localStorage.getItem('test-key') || '')).toBe(
        'new-value'
      )
    })

    it('함수형 업데이트를 지원한다', () => {
      const { result } = renderHook(() => useLocalStorage('counter', 0))

      act(() => {
        result.current[1]((prev) => prev + 1)
      })

      expect(result.current[0]).toBe(1)

      act(() => {
        result.current[1]((prev) => prev + 5)
      })

      expect(result.current[0]).toBe(6)
    })

    it('객체를 저장할 수 있다', () => {
      const { result } = renderHook(() =>
        useLocalStorage('user', { name: '', age: 0 })
      )

      act(() => {
        result.current[1]({ name: '홍길동', age: 30 })
      })

      expect(result.current[0]).toEqual({ name: '홍길동', age: 30 })
    })
  })

  describe('값 삭제', () => {
    it('값을 삭제하면 초기값으로 돌아간다', () => {
      const { result } = renderHook(() =>
        useLocalStorage('test-key', 'initial')
      )

      act(() => {
        result.current[1]('new-value')
      })

      expect(result.current[0]).toBe('new-value')

      act(() => {
        result.current[2]()
      })

      expect(result.current[0]).toBe('initial')
      expect(window.localStorage.getItem('test-key')).toBeNull()
    })
  })

  describe('에러 핸들링', () => {
    it('잘못된 JSON이 저장되어 있으면 초기값을 반환한다', () => {
      window.localStorage.setItem('invalid-json', 'not-valid-json')

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { result } = renderHook(() =>
        useLocalStorage('invalid-json', 'default')
      )

      expect(result.current[0]).toBe('default')
      consoleSpy.mockRestore()
    })
  })

  describe('타입 안전성', () => {
    it('boolean 타입을 지원한다', () => {
      const { result } = renderHook(() => useLocalStorage('bool-key', false))

      act(() => {
        result.current[1](true)
      })

      expect(result.current[0]).toBe(true)
    })

    it('null을 값으로 저장할 수 있다', () => {
      const { result } = renderHook(() =>
        useLocalStorage<string | null>('nullable', 'initial')
      )

      act(() => {
        result.current[1](null)
      })

      expect(result.current[0]).toBeNull()
    })
  })

  describe('cross-tab 동기화', () => {
    it('storage 이벤트 리스너가 등록된다', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      renderHook(() => useLocalStorage('test-key', 'initial'))

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'storage',
        expect.any(Function)
      )
      addEventListenerSpy.mockRestore()
    })

    it('언마운트 시 이벤트 리스너가 제거된다', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() =>
        useLocalStorage('test-key', 'initial')
      )
      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'storage',
        expect.any(Function)
      )
      removeEventListenerSpy.mockRestore()
    })
  })
})
