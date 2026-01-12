import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from './Select'

const options = [
  { value: 'apple', label: '사과' },
  { value: 'banana', label: '바나나' },
  { value: 'orange', label: '오렌지' },
]

describe('Select', () => {
  it('select 요소를 렌더링한다', () => {
    render(<Select options={options} />)

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('레이블을 렌더링한다', () => {
    render(<Select label="과일 선택" options={options} />)

    expect(screen.getByLabelText('과일 선택')).toBeInTheDocument()
  })

  it('필수 필드 표시를 렌더링한다', () => {
    const { container } = render(
      <Select label="과일" options={options} required />
    )

    const label = container.querySelector('label')
    expect(label?.className).toMatch(/required/)
  })

  it('플레이스홀더를 표시한다', () => {
    render(<Select options={options} placeholder="선택하세요" />)

    expect(
      screen.getByRole('option', { name: '선택하세요' })
    ).toBeInTheDocument()
  })

  it('옵션들을 렌더링한다', () => {
    render(<Select options={options} />)

    expect(screen.getByRole('option', { name: '사과' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '바나나' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '오렌지' })).toBeInTheDocument()
  })

  it('disabled 옵션을 렌더링한다', () => {
    const optionsWithDisabled = [
      ...options,
      { value: 'grape', label: '포도', disabled: true },
    ]

    render(<Select options={optionsWithDisabled} />)

    expect(screen.getByRole('option', { name: '포도' })).toBeDisabled()
  })

  it('에러 메시지를 표시한다', () => {
    render(<Select label="과일" options={options} error="선택이 필요합니다" />)

    expect(screen.getByText('선택이 필요합니다')).toBeInTheDocument()
    expect(screen.getByLabelText('과일')).toHaveAttribute(
      'aria-invalid',
      'true'
    )
  })

  it('도움말 텍스트를 표시한다', () => {
    render(
      <Select
        label="과일"
        options={options}
        helperText="원하는 과일을 선택하세요"
      />
    )

    expect(screen.getByText('원하는 과일을 선택하세요')).toBeInTheDocument()
  })

  it('선택 시 onChange가 호출된다', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Select options={options} onChange={handleChange} />)

    await user.selectOptions(screen.getByRole('combobox'), 'banana')

    expect(handleChange).toHaveBeenCalled()
  })

  it('value로 선택된 값을 제어할 수 있다', () => {
    render(<Select options={options} value="orange" onChange={() => {}} />)

    expect(screen.getByRole('combobox')).toHaveValue('orange')
  })

  it('disabled 상태에서는 선택이 불가능하다', () => {
    render(<Select options={options} disabled />)

    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('추가 className을 적용할 수 있다', () => {
    const { container } = render(
      <Select options={options} className="custom-select" />
    )

    expect(container.firstChild).toHaveClass('custom-select')
  })
})
