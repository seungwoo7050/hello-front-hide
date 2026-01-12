import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('체크박스를 렌더링한다', () => {
    render(<Checkbox label="동의합니다" />)

    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByLabelText('동의합니다')).toBeInTheDocument()
  })

  it('label 없이도 렌더링된다', () => {
    render(<Checkbox label="" aria-label="선택" />)

    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('클릭 시 onChange가 호출된다', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Checkbox label="동의" onChange={handleChange} />)

    await user.click(screen.getByLabelText('동의'))

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('checked 상태를 제어할 수 있다', () => {
    render(<Checkbox label="선택됨" checked onChange={() => {}} />)

    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('defaultChecked로 초기 상태를 설정할 수 있다', () => {
    render(<Checkbox label="기본 선택" defaultChecked />)

    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('disabled 상태에서는 클릭이 불가능하다', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Checkbox label="비활성화" disabled onChange={handleChange} />)

    await user.click(screen.getByLabelText('비활성화'))

    expect(handleChange).not.toHaveBeenCalled()
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('에러 상태를 표시할 수 있다', () => {
    render(<Checkbox label="필수 동의" error="에러입니다" />)

    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('도움말 텍스트를 표시할 수 있다', () => {
    render(<Checkbox label="동의" helperText="필수 항목입니다" />)

    expect(screen.getByText('필수 항목입니다')).toBeInTheDocument()
  })

  it('레이블 클릭 시 체크박스가 토글된다', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Checkbox label="클릭 테스트" onChange={handleChange} />)

    await user.click(screen.getByText('클릭 테스트'))

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('추가 className을 적용할 수 있다', () => {
    const { container } = render(
      <Checkbox label="스타일" className="custom-checkbox" />
    )

    expect(container.firstChild).toHaveClass('custom-checkbox')
  })
})
