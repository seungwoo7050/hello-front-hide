import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Input } from './Input'

describe('Input 컴포넌트', () => {
  describe('렌더링', () => {
    it('기본 입력 필드가 렌더링되어야 한다', () => {
      render(<Input placeholder="입력하세요" />)
      expect(screen.getByPlaceholderText('입력하세요')).toBeInTheDocument()
    })

    it('라벨이 표시되어야 한다', () => {
      render(<Input label="이름" />)
      expect(screen.getByLabelText('이름')).toBeInTheDocument()
    })

    it('도움말 텍스트가 표시되어야 한다', () => {
      render(<Input helperText="이름을 입력해주세요" />)
      expect(screen.getByText('이름을 입력해주세요')).toBeInTheDocument()
    })
  })

  describe('에러 상태', () => {
    it('에러 메시지가 표시되어야 한다', () => {
      render(<Input error="필수 항목입니다" />)
      expect(screen.getByRole('alert')).toHaveTextContent('필수 항목입니다')
    })

    it('에러 상태에서 aria-invalid가 true여야 한다', () => {
      render(<Input error="에러" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('에러가 있으면 도움말 텍스트 대신 에러를 표시해야 한다', () => {
      render(<Input error="에러 메시지" helperText="도움말" />)
      expect(screen.getByText('에러 메시지')).toBeInTheDocument()
      expect(screen.queryByText('도움말')).not.toBeInTheDocument()
    })
  })

  describe('상호작용', () => {
    it('값을 입력할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<Input onChange={handleChange} />)
      const input = screen.getByRole('textbox')
      
      await user.type(input, '테스트')
      
      expect(handleChange).toHaveBeenCalled()
      expect(input).toHaveValue('테스트')
    })

    it('disabled 상태에서는 입력이 불가능해야 한다', async () => {
      const user = userEvent.setup()
      
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      
      await user.type(input, '테스트')
      
      expect(input).toHaveValue('')
    })
  })

  describe('접근성', () => {
    it('라벨과 입력 필드가 연결되어 있어야 한다', () => {
      render(<Input label="이메일" id="email" />)
      const input = screen.getByLabelText('이메일')
      expect(input).toHaveAttribute('id', 'email')
    })

    it('에러 메시지가 aria-describedby로 연결되어야 한다', () => {
      render(<Input id="test" error="에러입니다" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('error'))
    })

    it('키보드로 포커스할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      
      render(<Input label="테스트" />)
      
      await user.tab()
      
      expect(screen.getByRole('textbox')).toHaveFocus()
    })
  })
})
