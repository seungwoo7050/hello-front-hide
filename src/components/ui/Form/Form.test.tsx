import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form, FormGroup, FormActions } from './Form'
import { Button } from '../Button'
import { Input } from '../Input'

describe('Form', () => {
  it('폼 요소를 렌더링한다', () => {
    render(
      <Form aria-label="테스트 폼">
        <div>폼 내용</div>
      </Form>
    )

    expect(screen.getByRole('form', { name: '테스트 폼' })).toBeInTheDocument()
  })

  it('onSubmit 핸들러가 호출된다', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn((e) => e.preventDefault())

    render(
      <Form onSubmit={handleSubmit}>
        <button type="submit">제출</button>
      </Form>
    )

    await user.click(screen.getByRole('button', { name: '제출' }))

    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('추가 className을 적용할 수 있다', () => {
    render(
      <Form className="custom-form" aria-label="커스텀 폼">
        <div>내용</div>
      </Form>
    )

    const form = screen.getByRole('form', { name: '커스텀 폼' })
    expect(form).toHaveClass('custom-form')
  })
})

describe('FormGroup', () => {
  it('자식 요소를 렌더링한다', () => {
    render(
      <FormGroup>
        <Input label="테스트" />
      </FormGroup>
    )

    expect(screen.getByLabelText('테스트')).toBeInTheDocument()
  })

  it('row 속성으로 가로 레이아웃을 적용할 수 있다', () => {
    const { container } = render(
      <FormGroup row>
        <div>항목1</div>
        <div>항목2</div>
      </FormGroup>
    )

    const formGroup = container.firstChild as HTMLElement
    // CSS Modules는 클래스명에 해시를 붙이므로 부분 매칭 확인
    expect(formGroup?.className).toMatch(/formGroupRow/)
  })

  it('추가 className을 적용할 수 있다', () => {
    const { container } = render(
      <FormGroup className="custom-group">
        <div>내용</div>
      </FormGroup>
    )

    expect(container.firstChild).toHaveClass('custom-group')
  })
})

describe('FormActions', () => {
  it('버튼들을 렌더링한다', () => {
    render(
      <FormActions>
        <Button>취소</Button>
        <Button>확인</Button>
      </FormActions>
    )

    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument()
  })

  it('align="start"로 왼쪽 정렬할 수 있다', () => {
    const { container } = render(
      <FormActions align="start">
        <Button>버튼</Button>
      </FormActions>
    )

    // start는 기본값이므로 추가 클래스가 없음
    const element = container.firstChild as HTMLElement
    expect(element?.className).toMatch(/formActions/)
  })

  it('align="center"로 가운데 정렬할 수 있다', () => {
    const { container } = render(
      <FormActions align="center">
        <Button>버튼</Button>
      </FormActions>
    )

    expect((container.firstChild as HTMLElement)?.className).toMatch(
      /formActionsCenter/
    )
  })

  it('align="end"로 오른쪽 정렬할 수 있다', () => {
    const { container } = render(
      <FormActions align="end">
        <Button>버튼</Button>
      </FormActions>
    )

    expect((container.firstChild as HTMLElement)?.className).toMatch(
      /formActionsEnd/
    )
  })

  it('추가 className을 적용할 수 있다', () => {
    const { container } = render(
      <FormActions className="custom-actions">
        <Button>버튼</Button>
      </FormActions>
    )

    expect(container.firstChild).toHaveClass('custom-actions')
  })
})
