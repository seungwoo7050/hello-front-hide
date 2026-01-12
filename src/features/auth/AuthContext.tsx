/**
 * 인증 컨텍스트
 * 애플리케이션 전역 인증 상태 관리
 */
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { authApi } from './api'
import { tokenStorage } from './tokenStorage'
import type {
  AuthContextValue,
  AuthStatus,
  LoginRequest,
  RegisterRequest,
  User,
} from './types'

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  // 앱 시작 시 토큰 확인 및 사용자 정보 복원
  useEffect(() => {
    const initAuth = async () => {
      if (!tokenStorage.hasTokens()) {
        setStatus('unauthenticated')
        return
      }

      setStatus('loading')
      try {
        const currentUser = await authApi.getCurrentUser()
        setUser(currentUser)
        setStatus('authenticated')
      } catch {
        // 토큰 만료 또는 유효하지 않음
        tokenStorage.clearTokens()
        setStatus('unauthenticated')
      }
    }

    initAuth()
  }, [])

  const login = useCallback(
    async (credentials: LoginRequest): Promise<boolean> => {
      setStatus('loading')
      setError(null)

      try {
        const response = await authApi.login(credentials)
        tokenStorage.setTokens(
          response.tokens.accessToken,
          response.tokens.refreshToken
        )
        setUser(response.user)
        setStatus('authenticated')
        return true
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : (err as { message?: string })?.message || '로그인에 실패했습니다.'
        setError(message)
        setStatus('unauthenticated')
        return false
      }
    },
    []
  )

  const register = useCallback(
    async (data: RegisterRequest): Promise<boolean> => {
      setStatus('loading')
      setError(null)

      try {
        const response = await authApi.register(data)
        tokenStorage.setTokens(
          response.tokens.accessToken,
          response.tokens.refreshToken
        )
        setUser(response.user)
        setStatus('authenticated')
        return true
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : (err as { message?: string })?.message ||
              '회원가입에 실패했습니다.'
        setError(message)
        setStatus('unauthenticated')
        return false
      }
    },
    []
  )

  const logout = useCallback(() => {
    authApi.logout().catch(() => {
      // 로그아웃 API 실패해도 로컬에서는 로그아웃 처리
    })
    tokenStorage.clearTokens()
    setUser(null)
    setStatus('unauthenticated')
    setError(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      error,
      login,
      register,
      logout,
      clearError,
    }),
    [user, status, error, login, register, logout, clearError]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
