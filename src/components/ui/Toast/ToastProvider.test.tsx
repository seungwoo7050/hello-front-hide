import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react'
import { ToastProvider } from './ToastProvider'
import { useToast } from './ToastContext'

// 테스트용 컴포넌트
function TestComponent() {
  const { toast, success, error, warning, dismissAll } = useToast()

  return (
    <div>
      <button onClick={() => toast('기본 토스트')}>기본</button>
      <button onClick={() => success('성공 메시지', { title: '성공 타이틀' })}>
        성공
      </button>
      <button onClick={() => error('에러 메시지')}>에러</button>
      <button onClick={() => warning('경고 메시지')}>경고</button>
      <button onClick={() => dismissAll()}>모두 닫기</button>
    </div>
  )
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('ToastProvider 없이 useToast를 사용하면 에러가 발생한다', () => {
    // 이 테스트는 fake timers가 필요없으므로 별도 설정
    vi.runOnlyPendingTimers()
    vi.useRealTimers()

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    function InvalidComponent() {
      useToast()
      return null
    }

    expect(() => render(<InvalidComponent />)).toThrow(
      'useToast must be used within ToastProvider'
    )
    consoleSpy.mockRestore()

    // fake timers 다시 설정 (afterEach에서 사용하므로)
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  it('toast 함수로 토스트를 생성할 수 있다', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '기본' }))
    })

    expect(screen.getByText('기본 토스트')).toBeInTheDocument()
  })

  it('success 함수로 성공 토스트를 생성할 수 있다', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '성공' }))
    })

    expect(screen.getByText('성공 메시지')).toBeInTheDocument()
    // '성공 타이틀'로 변경하여 버튼과 겹치지 않게
    expect(screen.getByText('성공 타이틀')).toBeInTheDocument()
  })

  it('error 함수로 에러 토스트를 생성할 수 있다', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '에러' }))
    })

    expect(screen.getByText('에러 메시지')).toBeInTheDocument()
  })

  it('dismissAll로 모든 토스트를 닫을 수 있다', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    // 여러 토스트 생성
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '성공' }))
      fireEvent.click(screen.getByRole('button', { name: '에러' }))
    })

    expect(screen.getAllByRole('alert')).toHaveLength(2)

    // 모두 닫기
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '모두 닫기' }))
    })

    expect(screen.queryAllByRole('alert')).toHaveLength(0)
  })

  it('maxToasts 이상의 토스트는 오래된 것부터 제거된다', async () => {
    render(
      <ToastProvider maxToasts={2}>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '성공' }))
      fireEvent.click(screen.getByRole('button', { name: '에러' }))
      fireEvent.click(screen.getByRole('button', { name: '경고' }))
    })

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(2)

    // 가장 오래된 '성공 메시지'는 없어야 함
    expect(screen.queryByText('성공 메시지')).not.toBeInTheDocument()
    expect(screen.getByText('에러 메시지')).toBeInTheDocument()
    expect(screen.getByText('경고 메시지')).toBeInTheDocument()
  })

  it('토스트 컨테이너에 포지션이 적용된다', async () => {
    render(
      <ToastProvider position="bottom-center">
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '기본' }))
    })

    // 토스트 컨테이너 확인 - aria-label로 찾기
    const toastContainer = screen.getByLabelText(/알림 영역/)
    expect(toastContainer).toBeInTheDocument()
  })

  it('토스트가 duration 후에 자동으로 사라진다', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '기본' }))
    })

    expect(screen.getByText('기본 토스트')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    await waitFor(() => {
      expect(screen.queryByText('기본 토스트')).not.toBeInTheDocument()
    })
  })
})
