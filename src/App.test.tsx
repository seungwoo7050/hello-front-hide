import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App 컴포넌트', () => {
  it('앱이 정상적으로 렌더링되어야 한다', () => {
    render(<App />)
    // 홈 페이지가 기본으로 렌더링됨 - h1 태그를 명시적으로 찾음
    expect(screen.getByRole('heading', { level: 1, name: /Hello Front/i })).toBeInTheDocument()
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
