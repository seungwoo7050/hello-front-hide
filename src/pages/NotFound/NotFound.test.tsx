import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotFound } from './NotFound'

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('NotFound', () => {
  it('404 에러 코드를 표시한다', () => {
    renderWithRouter(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('에러 메시지를 표시한다', () => {
    renderWithRouter(<NotFound />)
    expect(screen.getByText('페이지를 찾을 수 없습니다')).toBeInTheDocument()
  })

  it('안내 문구를 표시한다', () => {
    renderWithRouter(<NotFound />)
    expect(
      screen.getByText(/요청하신 페이지가 존재하지 않거나/i)
    ).toBeInTheDocument()
  })

  it('뒤로 가기 버튼을 렌더링한다', () => {
    renderWithRouter(<NotFound />)
    expect(
      screen.getByRole('button', { name: '뒤로 가기' })
    ).toBeInTheDocument()
  })

  it('홈으로 이동 링크를 렌더링한다', () => {
    renderWithRouter(<NotFound />)
    const homeLink = screen.getByRole('link', { name: /홈으로 이동/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })
})
