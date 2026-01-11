import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App 컴포넌트', () => {
  it('앱이 정상적으로 렌더링되어야 한다', () => {
    render(<App />)
    expect(screen.getByText(/UI 컴포넌트 Playground/i)).toBeInTheDocument()
  })

  it('Button 섹션이 표시되어야 한다', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /Button/i })).toBeInTheDocument()
  })

  it('Input 섹션이 표시되어야 한다', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /Input/i })).toBeInTheDocument()
  })

  it('Card 섹션이 표시되어야 한다', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /^Card$/i })).toBeInTheDocument()
  })

  it('Badge 섹션이 표시되어야 한다', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /Badge/i })).toBeInTheDocument()
  })
})
