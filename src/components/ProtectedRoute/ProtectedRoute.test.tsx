/**
 * ProtectedRoute 테스트
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import { AuthProvider } from '../../features/auth'
import { tokenStorage } from '../../features/auth/tokenStorage'
import { ProtectedRoute } from './ProtectedRoute'
import { resetAuthState } from '../../mocks/handlers/auth'
import { createMockJwt } from '../../features/auth/jwt'

function renderWithAuth(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>보호된 콘텐츠</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>로그인 페이지</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
    resetAuthState()
  })

  it('인증되지 않은 사용자는 로그인 페이지로 리다이렉트된다', async () => {
    renderWithAuth('/protected')

    await waitFor(() => {
      expect(screen.getByText('로그인 페이지')).toBeInTheDocument()
    })
  })

  it('인증 확인 중에는 로딩이 표시된다', async () => {
    // 토큰이 있지만 아직 검증 전
    tokenStorage.setAccessToken(
      createMockJwt({ sub: 'user-1', email: 'test@example.com' })
    )

    renderWithAuth('/protected')

    // 초기에는 로딩 상태
    expect(screen.getByText('인증 확인 중...')).toBeInTheDocument()

    // 최종적으로 리다이렉트 (토큰이 유효하지 않으므로)
    await waitFor(() => {
      expect(screen.getByText('로그인 페이지')).toBeInTheDocument()
    })
  })

  it('사용자 정의 fallback을 렌더링할 수 있다', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    tokenStorage.setAccessToken(
      createMockJwt({ sub: 'user-1', email: 'test@example.com' })
    )

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute fallback={<div>로딩 중...</div>}>
                  <div>보호된 콘텐츠</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>로그인 페이지</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    // 커스텀 로딩 메시지
    expect(screen.getByText('로딩 중...')).toBeInTheDocument()

    consoleError.mockRestore()
  })
})
