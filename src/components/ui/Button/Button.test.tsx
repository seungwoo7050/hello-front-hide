import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button 컴포넌트', () => {
  describe('렌더링', () => {
    it('기본 버튼이 정상적으로 렌더링되어야 한다', () => {
      render(<Button>클릭</Button>)
      expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument()
    })

    it('secondary 변형 버튼이 렌더링되어야 한다', () => {
      render(<Button variant="secondary">버튼</Button>)
      expect(screen.getByRole('button', { name: '버튼' })).toBeInTheDocument()
    })

    it('ghost 변형 버튼이 렌더링되어야 한다', () => {
      render(<Button variant="ghost">버튼</Button>)
      expect(screen.getByRole('button', { name: '버튼' })).toBeInTheDocument()
    })
  })

  describe('크기', () => {
    it('small 크기 버튼이 렌더링되어야 한다', () => {
      render(<Button size="small">작은 버튼</Button>)
      expect(screen.getByRole('button', { name: '작은 버튼' })).toBeInTheDocument()
    })

    it('large 크기 버튼이 렌더링되어야 한다', () => {
      render(<Button size="large">큰 버튼</Button>)
      expect(screen.getByRole('button', { name: '큰 버튼' })).toBeInTheDocument()
    })
  })

  describe('상호작용', () => {
    it('클릭 이벤트가 발생해야 한다', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button onClick={handleClick}>클릭</Button>)
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('disabled 상태에서는 클릭이 불가능해야 한다', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button disabled onClick={handleClick}>비활성</Button>)
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('loading 상태에서는 클릭이 불가능해야 한다', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button loading onClick={handleClick}>로딩</Button>)
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('접근성', () => {
    it('loading 상태에서 aria-busy가 true여야 한다', () => {
      render(<Button loading>로딩 중</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    })

    it('키보드로 버튼을 활성화할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button onClick={handleClick}>키보드 테스트</Button>)
      const button = screen.getByRole('button')
      
      button.focus()
      await user.keyboard('{Enter}')
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('disabled 상태에서는 버튼이 비활성화되어야 한다', () => {
      render(<Button disabled>비활성</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('fullWidth', () => {
    it('fullWidth 버튼이 렌더링되어야 한다', () => {
      render(<Button fullWidth>전체 너비</Button>)
      expect(screen.getByRole('button', { name: '전체 너비' })).toBeInTheDocument()
    })
  })
})
