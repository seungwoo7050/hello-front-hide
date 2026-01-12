import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Header } from './Header'

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('Header', () => {
  it('로고를 렌더링한다', () => {
    renderWithRouter(<Header />)
    expect(screen.getByText('Hello Front')).toBeInTheDocument()
  })

  it('기본 앱 이름을 표시한다', () => {
    renderWithRouter(<Header appName="Custom App" />)
    expect(screen.getByText('Custom App')).toBeInTheDocument()
  })

  it('데스크탑 네비게이션 링크를 렌더링한다', () => {
    renderWithRouter(<Header />)
    expect(
      screen.getByRole('navigation', { name: '메인 네비게이션' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '홈' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Playground' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument()
  })

  it('모바일 메뉴 버튼을 렌더링한다', () => {
    renderWithRouter(<Header />)
    const menuButton = screen.getByRole('button', { name: '메뉴 열기' })
    expect(menuButton).toBeInTheDocument()
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('메뉴 버튼 클릭 시 onToggleSidebar를 호출한다', async () => {
    const user = userEvent.setup()
    const handleToggle = vi.fn()
    renderWithRouter(<Header onToggleSidebar={handleToggle} />)

    const menuButton = screen.getByRole('button', { name: '메뉴 열기' })
    await user.click(menuButton)

    expect(handleToggle).toHaveBeenCalledTimes(1)
  })

  it('사이드바가 열린 상태일 때 aria-expanded가 true이다', () => {
    renderWithRouter(<Header isSidebarOpen={true} />)
    const menuButton = screen.getByRole('button', { name: '메뉴 닫기' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('banner 역할을 가진다', () => {
    renderWithRouter(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})
