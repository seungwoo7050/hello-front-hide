import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Breadcrumb } from './Breadcrumb'

const renderWithRouter = (
  ui: React.ReactElement,
  initialEntries: string[] = ['/']
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
  )
}

describe('Breadcrumb', () => {
  it('홈 페이지에서는 렌더링하지 않는다', () => {
    const { container } = renderWithRouter(<Breadcrumb />)
    expect(container.querySelector('nav')).not.toBeInTheDocument()
  })

  it('하위 페이지에서 breadcrumb를 렌더링한다', () => {
    renderWithRouter(<Breadcrumb />, ['/playground'])
    expect(
      screen.getByRole('navigation', { name: '현재 위치' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link')).toBeInTheDocument()
    expect(screen.getByText('Playground')).toBeInTheDocument()
  })

  it('현재 페이지에 aria-current를 설정한다', () => {
    renderWithRouter(<Breadcrumb />, ['/about'])
    const currentItem = screen.getByText('About')
    expect(currentItem).toHaveAttribute('aria-current', 'page')
  })

  it('커스텀 항목을 렌더링할 수 있다', () => {
    const customItems = [
      { label: '시작', path: '/' },
      { label: '중간', path: '/middle' },
      { label: '현재' },
    ]
    renderWithRouter(<Breadcrumb items={customItems} showHomeIcon={false} />, [
      '/current',
    ])

    expect(screen.getByRole('link', { name: '시작' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '중간' })).toBeInTheDocument()
    expect(screen.getByText('현재')).toHaveAttribute('aria-current', 'page')
  })

  it('커스텀 pathLabels를 사용할 수 있다', () => {
    const customLabels = { '': '메인', custom: '커스텀 페이지' }
    renderWithRouter(<Breadcrumb pathLabels={customLabels} />, ['/custom'])

    expect(screen.getByText('커스텀 페이지')).toBeInTheDocument()
  })
})
