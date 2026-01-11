import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App 컴포넌트', () => {
  it('앱이 정상적으로 렌더링되어야 한다', () => {
    render(<App />)
    expect(screen.getByText(/Vite \+ React/i)).toBeInTheDocument()
  })

  it('Vite 로고가 표시되어야 한다', () => {
    render(<App />)
    expect(screen.getByAltText('Vite logo')).toBeInTheDocument()
  })

  it('React 로고가 표시되어야 한다', () => {
    render(<App />)
    expect(screen.getByAltText('React logo')).toBeInTheDocument()
  })

  it('카운터 버튼을 클릭하면 카운트가 증가해야 한다', async () => {
    const user = userEvent.setup()
    render(<App />)

    const button = screen.getByRole('button', { name: /count is 0/i })
    expect(button).toBeInTheDocument()

    await user.click(button)
    expect(screen.getByRole('button', { name: /count is 1/i })).toBeInTheDocument()

    await user.click(button)
    expect(screen.getByRole('button', { name: /count is 2/i })).toBeInTheDocument()
  })

  it('외부 링크들이 새 탭에서 열리도록 설정되어 있어야 한다', () => {
    render(<App />)
    
    const viteLink = screen.getByRole('link', { name: /vite logo/i })
    const reactLink = screen.getByRole('link', { name: /react logo/i })

    expect(viteLink).toHaveAttribute('target', '_blank')
    expect(reactLink).toHaveAttribute('target', '_blank')
  })
})
