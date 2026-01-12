/**
 * AuthContext 테스트
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'
import { tokenStorage } from './tokenStorage'
import { resetAuthState } from '../../mocks/handlers/auth'

// 테스트용 Consumer 컴포넌트
function TestConsumer() {
  const { user, status, error, login, logout, clearError } = useAuth()

  return (
    <div>
      <div data-testid="status">{status}</div>
      <div data-testid="user">{user?.name || 'null'}</div>
      <div data-testid="error">{error || 'null'}</div>
      <button
        onClick={() =>
          login({ email: 'test@example.com', password: 'password123' })
        }
      >
        로그인
      </button>
      <button
        onClick={() => login({ email: 'wrong@example.com', password: 'wrong' })}
      >
        잘못된 로그인
      </button>
      <button onClick={logout}>로그아웃</button>
      <button onClick={clearError}>에러 지우기</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    resetAuthState()
  })

  describe('초기 상태', () => {
    it('토큰이 없으면 unauthenticated 상태가 된다', async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent(
          'unauthenticated'
        )
      })
    })
  })

  describe('로그인', () => {
    it('올바른 자격 증명으로 로그인하면 authenticated 상태가 된다', async () => {
      const user = userEvent.setup()

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent(
          'unauthenticated'
        )
      })

      await user.click(screen.getByText('로그인'))

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
        expect(screen.getByTestId('user')).toHaveTextContent('테스트 사용자')
      })

      expect(tokenStorage.hasTokens()).toBe(true)
    })

    it('잘못된 자격 증명으로 로그인하면 에러가 표시된다', async () => {
      const user = userEvent.setup()

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent(
          'unauthenticated'
        )
      })

      await user.click(screen.getByText('잘못된 로그인'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).not.toHaveTextContent('null')
      })

      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    })
  })

  describe('로그아웃', () => {
    it('로그아웃하면 unauthenticated 상태가 된다', async () => {
      const user = userEvent.setup()

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent(
          'unauthenticated'
        )
      })

      // 먼저 로그인
      await user.click(screen.getByText('로그인'))

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
      })

      // 로그아웃
      await user.click(screen.getByText('로그아웃'))

      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
      expect(screen.getByTestId('user')).toHaveTextContent('null')
      expect(tokenStorage.hasTokens()).toBe(false)
    })
  })

  describe('에러 처리', () => {
    it('clearError로 에러를 지울 수 있다', async () => {
      const user = userEvent.setup()

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent(
          'unauthenticated'
        )
      })

      // 잘못된 로그인 시도
      await user.click(screen.getByText('잘못된 로그인'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).not.toHaveTextContent('null')
      })

      // 에러 지우기
      await user.click(screen.getByText('에러 지우기'))

      expect(screen.getByTestId('error')).toHaveTextContent('null')
    })
  })

  describe('useAuth 훅', () => {
    it('AuthProvider 없이 사용하면 에러가 발생한다', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => {
        render(<TestConsumer />)
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleError.mockRestore()
    })
  })
})
