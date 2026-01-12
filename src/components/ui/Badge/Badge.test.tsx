import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from './Badge'

describe('Badge 컴포넌트', () => {
  describe('렌더링', () => {
    it('기본 배지가 렌더링되어야 한다', () => {
      render(<Badge>새로운</Badge>)
      expect(screen.getByText('새로운')).toBeInTheDocument()
    })

    it('텍스트 콘텐츠가 올바르게 표시되어야 한다', () => {
      render(<Badge variant="primary">프라이머리</Badge>)
      expect(screen.getByText('프라이머리')).toBeInTheDocument()
    })
  })

  describe('색상 변형', () => {
    it.each([
      ['primary', '프라이머리'],
      ['success', '성공'],
      ['warning', '경고'],
      ['error', '에러'],
      ['info', '정보'],
    ])('%s 변형이 렌더링되어야 한다', (variant, text) => {
      render(
        <Badge
          variant={
            variant as 'primary' | 'success' | 'warning' | 'error' | 'info'
          }
        >
          {text}
        </Badge>
      )
      expect(screen.getByText(text)).toBeInTheDocument()
    })
  })

  describe('크기', () => {
    it('small 크기 배지가 렌더링되어야 한다', () => {
      render(<Badge size="small">작은</Badge>)
      expect(screen.getByText('작은')).toBeInTheDocument()
    })

    it('large 크기 배지가 렌더링되어야 한다', () => {
      render(<Badge size="large">큰</Badge>)
      expect(screen.getByText('큰')).toBeInTheDocument()
    })
  })

  describe('도트', () => {
    it('dot 속성이 있으면 도트가 표시되어야 한다', () => {
      const { container } = render(<Badge dot>활성</Badge>)
      expect(screen.getByText('활성')).toBeInTheDocument()
      // CSS Module이 적용된 dot 요소 확인 (클래스명에 'dot' 포함)
      const dotElement = container.querySelector('[class*="dot"]')
      expect(dotElement).toBeInTheDocument()
    })
  })

  describe('커스텀 className', () => {
    it('추가 className이 적용되어야 한다', () => {
      render(<Badge className="custom-class">커스텀</Badge>)
      expect(screen.getByText('커스텀')).toHaveClass('custom-class')
    })
  })
})
