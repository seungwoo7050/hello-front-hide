/**
 * 테마 스토어 테스트
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { act } from '@testing-library/react'

// 테마 스토어 테스트 전 모킹 설정
const mockMatchMedia = vi.fn()

describe('테마 스토어', () => {
  beforeEach(() => {
    // localStorage 초기화
    localStorage.clear()

    // matchMedia 모킹
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    })

    // document.documentElement 모킹
    vi.spyOn(document.documentElement, 'setAttribute')

    // 모듈 캐시 초기화
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('초기 상태는 system 모드여야 한다', async () => {
    const { useThemeStore } = await import('./store')
    const state = useThemeStore.getState()

    expect(state.mode).toBe('system')
  })

  it('setMode로 테마를 light로 변경할 수 있다', async () => {
    const { useThemeStore } = await import('./store')

    act(() => {
      useThemeStore.getState().setMode('light')
    })

    const state = useThemeStore.getState()
    expect(state.mode).toBe('light')
    expect(state.resolvedTheme).toBe('light')
  })

  it('setMode로 테마를 dark로 변경할 수 있다', async () => {
    const { useThemeStore } = await import('./store')

    act(() => {
      useThemeStore.getState().setMode('dark')
    })

    const state = useThemeStore.getState()
    expect(state.mode).toBe('dark')
    expect(state.resolvedTheme).toBe('dark')
  })

  it('toggleTheme으로 테마를 순환할 수 있다 (system → light → dark → system)', async () => {
    const { useThemeStore } = await import('./store')

    // 초기: system
    expect(useThemeStore.getState().mode).toBe('system')

    // system → light
    act(() => {
      useThemeStore.getState().toggleTheme()
    })
    expect(useThemeStore.getState().mode).toBe('light')

    // light → dark
    act(() => {
      useThemeStore.getState().toggleTheme()
    })
    expect(useThemeStore.getState().mode).toBe('dark')

    // dark → system
    act(() => {
      useThemeStore.getState().toggleTheme()
    })
    expect(useThemeStore.getState().mode).toBe('system')
  })

  it('system 모드일 때 시스템 다크 테마가 감지되면 dark로 resolve된다', async () => {
    // 시스템 다크 모드 설정
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { useThemeStore } = await import('./store')

    act(() => {
      useThemeStore.getState().setMode('system')
    })

    expect(useThemeStore.getState().resolvedTheme).toBe('dark')
  })

  it('테마 변경 시 data-theme 속성이 업데이트된다', async () => {
    const { useThemeStore } = await import('./store')

    act(() => {
      useThemeStore.getState().setMode('dark')
    })

    expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
      'data-theme',
      'dark'
    )
  })
})
