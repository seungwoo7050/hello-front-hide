/**
 * 로그인 페이지 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router'
import { AuthProvider } from '../../features/auth'
import { Login } from './Login'
import { resetAuthState } from '../../mocks/handlers/auth'

function renderLogin(initialPath = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/notes" element={<div>노트 페이지</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('Login 페이지', () => {
  beforeEach(() => {
    localStorage.clear()
    resetAuthState()
  })

  describe('렌더링', () => {
    it('로그인 폼이 표시된다', async () => {
      renderLogin()

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: '로그인' })
        ).toBeInTheDocument()
      })

      expect(screen.getByLabelText('이메일')).toBeInTheDocument()
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
    })

    it('회원가입 링크가 표시된다', async () => {
      renderLogin()

      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: '회원가입' })
        ).toBeInTheDocument()
      })
    })
  })

  describe('폼 유효성 검증', () => {
    it('빈 이메일로 제출하면 에러가 표시된다', async () => {
      const user = userEvent.setup()
      renderLogin()

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: '로그인' })
        ).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: '로그인' }))

      expect(screen.getByText('이메일을 입력해주세요.')).toBeInTheDocument()
    })

    it('잘못된 이메일 형식이면 에러가 표시된다', async () => {
      const user = userEvent.setup()
      renderLogin()

      await waitFor(() => {
        expect(screen.getByLabelText('이메일')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText('이메일'), 'invalid-email')
      await user.click(screen.getByRole('button', { name: '로그인' }))

      expect(
        screen.getByText('올바른 이메일 형식이 아닙니다.')
      ).toBeInTheDocument()
    })

    it('짧은 비밀번호면 에러가 표시된다', async () => {
      const user = userEvent.setup()
      renderLogin()

      await waitFor(() => {
        expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText('이메일'), 'test@example.com')
      await user.type(screen.getByLabelText('비밀번호'), '12345')
      await user.click(screen.getByRole('button', { name: '로그인' }))

      expect(
        screen.getByText('비밀번호는 6자 이상이어야 합니다.')
      ).toBeInTheDocument()
    })
  })

  describe('로그인 기능', () => {
    it('올바른 자격 증명으로 로그인하면 노트 페이지로 이동한다', async () => {
      const user = userEvent.setup()
      renderLogin()

      await waitFor(() => {
        expect(screen.getByLabelText('이메일')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText('이메일'), 'test@example.com')
      await user.type(screen.getByLabelText('비밀번호'), 'password123')
      await user.click(screen.getByRole('button', { name: '로그인' }))

      await waitFor(() => {
        expect(screen.getByText('노트 페이지')).toBeInTheDocument()
      })
    })

    it('잘못된 자격 증명으로 로그인하면 에러가 표시된다', async () => {
      const user = userEvent.setup()
      renderLogin()

      await waitFor(() => {
        expect(screen.getByLabelText('이메일')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText('이메일'), 'wrong@example.com')
      await user.type(screen.getByLabelText('비밀번호'), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: '로그인' }))

      await waitFor(() => {
        expect(
          screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')
        ).toBeInTheDocument()
      })
    })
  })
})
