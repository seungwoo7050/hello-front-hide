/**
 * ErrorBoundary 컴포넌트 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

// 콘솔 에러 억제 (ErrorBoundary 테스트 시 예상되는 에러)
const originalError = console.error

beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalError
})

// 에러를 발생시키는 테스트 컴포넌트
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('테스트 에러')
  }
  return <div>정상 렌더링</div>
}

describe('ErrorBoundary', () => {
  it('자식 컴포넌트가 정상 렌더링된다', () => {
    render(
      <ErrorBoundary>
        <div>정상 콘텐츠</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('정상 콘텐츠')).toBeInTheDocument()
  })

  it('에러 발생 시 기본 폴백 UI가 표시된다', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument()
    expect(screen.getByText('테스트 에러')).toBeInTheDocument()
  })

  it('커스텀 폴백이 제공되면 해당 폴백이 표시된다', () => {
    render(
      <ErrorBoundary fallback={<div>커스텀 에러 메시지</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('커스텀 에러 메시지')).toBeInTheDocument()
  })

  it('onError 콜백이 에러와 함께 호출된다', () => {
    const onError = vi.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
    expect(onError.mock.calls[0][0].message).toBe('테스트 에러')
  })

  it('다시 시도 버튼이 표시된다', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '다시 시도' })
    ).toBeInTheDocument()
  })

  it('showRetry가 false면 다시 시도 버튼이 표시되지 않는다', () => {
    render(
      <ErrorBoundary showRetry={false}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '다시 시도' })
    ).not.toBeInTheDocument()
  })
})
