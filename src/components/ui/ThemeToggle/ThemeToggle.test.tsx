/**
 * ThemeToggle 컴포넌트 테스트
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle'

// 테마 스토어 모킹
const mockToggleTheme = vi.fn()
const mockSetMode = vi.fn()

vi.mock('../../../stores/theme', () => ({
  useThemeStore: vi.fn(() => ({
    mode: 'system',
    resolvedTheme: 'light',
    toggleTheme: mockToggleTheme,
    setMode: mockSetMode,
  })),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('테마 토글 버튼이 렌더링된다', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /테마 변경/i })
    expect(button).toBeInTheDocument()
  })

  it('클릭 시 toggleTheme이 호출된다', async () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /테마 변경/i })
    fireEvent.click(button)

    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('size prop으로 버튼 크기를 변경할 수 있다', () => {
    const { container } = render(<ThemeToggle size="lg" />)

    const button = container.querySelector('button')
    // CSS Module은 클래스명이 변환되므로 부분 일치 확인
    expect(button?.className).toContain('lg')
  })
})
