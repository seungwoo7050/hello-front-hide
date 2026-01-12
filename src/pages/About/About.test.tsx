import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { About } from './About'

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('About', () => {
  it('페이지 제목을 렌더링한다', () => {
    renderWithRouter(<About />)
    expect(
      screen.getByRole('heading', { name: '프로젝트 소개' })
    ).toBeInTheDocument()
  })

  it('기술 스택 섹션을 표시한다', () => {
    renderWithRouter(<About />)
    expect(
      screen.getByRole('heading', { name: /기술 스택/i })
    ).toBeInTheDocument()
    expect(screen.getByText('React 19')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Vite')).toBeInTheDocument()
  })

  it('학습 단계 섹션을 표시한다', () => {
    renderWithRouter(<About />)
    expect(
      screen.getByRole('heading', { name: /학습 단계/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/Stage 0: 프로젝트 초기화/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Stage 1: UI Kit \+ Playground/i)
    ).toBeInTheDocument()
  })

  it('학습 목표 섹션을 표시한다', () => {
    renderWithRouter(<About />)
    expect(
      screen.getByRole('heading', { name: /학습 목표/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/현대적인 프론트엔드 개발의 핵심 개념/i)
    ).toBeInTheDocument()
  })

  it('완료된 단계에 체크 표시가 있다', () => {
    renderWithRouter(<About />)
    // 완료된 단계들의 체크마크를 찾음
    const checkmarks = screen.getAllByText('✓')
    expect(checkmarks.length).toBeGreaterThan(0)
  })
})
