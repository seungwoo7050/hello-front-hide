import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Footer } from './Footer'

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('Footer', () => {
  it('contentinfo 역할을 가진다', () => {
    renderWithRouter(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('앱 이름을 표시한다', () => {
    renderWithRouter(<Footer />)
    expect(screen.getByText('Hello Front')).toBeInTheDocument()
  })

  it('네비게이션 링크를 렌더링한다', () => {
    renderWithRouter(<Footer />)
    expect(screen.getByRole('link', { name: '홈' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Playground' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument()
  })

  it('저작권 정보를 표시한다', () => {
    renderWithRouter(<Footer />)
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument()
  })
})
