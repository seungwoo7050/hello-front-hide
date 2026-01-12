import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Spinner } from './Spinner'

describe('Spinner 컴포넌트', () => {
  describe('렌더링', () => {
    it('기본 스피너가 렌더링되어야 한다', () => {
      render(<Spinner />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('커스텀 라벨이 적용되어야 한다', () => {
      render(<Spinner label="데이터를 불러오는 중" />)
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        '데이터를 불러오는 중'
      )
    })
  })

  describe('크기', () => {
    it('small 크기 스피너가 렌더링되어야 한다', () => {
      render(<Spinner size="small" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('medium 크기 스피너가 렌더링되어야 한다', () => {
      render(<Spinner size="medium" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('large 크기 스피너가 렌더링되어야 한다', () => {
      render(<Spinner size="large" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('색상', () => {
    it('primary 색상 스피너가 렌더링되어야 한다', () => {
      render(<Spinner color="primary" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('secondary 색상 스피너가 렌더링되어야 한다', () => {
      render(<Spinner color="secondary" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('white 색상 스피너가 렌더링되어야 한다', () => {
      render(<Spinner color="white" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('전체 페이지 모드', () => {
    it('fullPage 모드에서 컨테이너로 감싸져야 한다', () => {
      const { container } = render(<Spinner fullPage />)
      const spinner = screen.getByRole('status')
      // fullPage 클래스를 가진 부모가 있는지 확인
      expect(container.querySelector('[class*="fullPage"]')).toBeInTheDocument()
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('접근성', () => {
    it('status 역할을 가져야 한다', () => {
      render(<Spinner />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('기본 aria-label이 설정되어야 한다', () => {
      render(<Spinner />)
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        '로딩 중'
      )
    })
  })
})
