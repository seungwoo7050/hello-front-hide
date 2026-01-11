import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App 컴포넌트', () => {
  it('앱이 정상적으로 렌더링되어야 한다', async () => {
    render(<App />)
    // lazy loading으로 인해 waitFor 사용
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Hello Front/i })).toBeInTheDocument()
    })
  })

  it('헤더가 표시되어야 한다', () => {
    render(<App />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('메인 네비게이션이 표시되어야 한다', () => {
    render(<App />)
    expect(screen.getByRole('navigation', { name: '메인 네비게이션' })).toBeInTheDocument()
  })

  it('사이드바가 표시되어야 한다', () => {
    render(<App />)
    expect(screen.getByRole('complementary', { name: '사이드바 네비게이션' })).toBeInTheDocument()
  })

  it('푸터가 표시되어야 한다', () => {
    render(<App />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
