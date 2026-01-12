import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Card, CardHeader, CardBody, CardFooter } from './Card'

describe('Card 컴포넌트', () => {
  describe('렌더링', () => {
    it('기본 카드가 렌더링되어야 한다', () => {
      render(<Card>카드 내용</Card>)
      expect(screen.getByText('카드 내용')).toBeInTheDocument()
    })

    it('elevated 변형 카드가 렌더링되어야 한다', () => {
      render(<Card variant="elevated">내용</Card>)
      expect(screen.getByText('내용')).toBeInTheDocument()
    })

    it('outlined 변형 카드가 렌더링되어야 한다', () => {
      render(<Card variant="outlined">내용</Card>)
      expect(screen.getByText('내용')).toBeInTheDocument()
    })
  })

  describe('패딩', () => {
    it('small 패딩 카드가 렌더링되어야 한다', () => {
      render(<Card padding="small">내용</Card>)
      expect(screen.getByText('내용')).toBeInTheDocument()
    })

    it('large 패딩 카드가 렌더링되어야 한다', () => {
      render(<Card padding="large">내용</Card>)
      expect(screen.getByText('내용')).toBeInTheDocument()
    })

    it('none 패딩 카드가 렌더링되어야 한다', () => {
      render(<Card padding="none">내용</Card>)
      expect(screen.getByText('내용')).toBeInTheDocument()
    })
  })

  describe('인터랙티브', () => {
    it('interactive 카드는 버튼 역할을 가져야 한다', () => {
      render(<Card interactive>클릭 가능</Card>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('interactive 카드는 클릭 이벤트를 받아야 한다', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(
        <Card interactive onClick={handleClick}>
          클릭
        </Card>
      )
      await user.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('interactive 카드는 키보드로 접근 가능해야 한다', async () => {
      const user = userEvent.setup()

      render(<Card interactive>포커스 가능</Card>)

      await user.tab()

      expect(screen.getByRole('button')).toHaveFocus()
    })
  })
})

describe('CardHeader 컴포넌트', () => {
  it('제목이 렌더링되어야 한다', () => {
    render(<CardHeader title="카드 제목" />)
    expect(
      screen.getByRole('heading', { name: '카드 제목' })
    ).toBeInTheDocument()
  })

  it('부제목이 렌더링되어야 한다', () => {
    render(<CardHeader title="제목" subtitle="부제목입니다" />)
    expect(screen.getByText('부제목입니다')).toBeInTheDocument()
  })
})

describe('CardBody 컴포넌트', () => {
  it('내용이 렌더링되어야 한다', () => {
    render(<CardBody>본문 내용</CardBody>)
    expect(screen.getByText('본문 내용')).toBeInTheDocument()
  })
})

describe('CardFooter 컴포넌트', () => {
  it('푸터 내용이 렌더링되어야 한다', () => {
    render(<CardFooter>푸터 내용</CardFooter>)
    expect(screen.getByText('푸터 내용')).toBeInTheDocument()
  })
})
