import {
  clearTokens,
  getValidAccessToken,
  getValidRefreshToken,
  setTokens,
} from '../features/auth/tokenStorage'
import { emitApiError } from './events'

// API 응답 타입
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  code: string
  status: number
}

// API 설정
export const API_BASE_URL = '/api'
export const API_DELAY = 500 // 개발 환경에서 네트워크 지연 시뮬레이션

const AUTH_WHITELIST = ['/auth/login', '/auth/register', '/auth/refresh']

let refreshPromise: Promise<string | null> | null = null

// HTTP 클라이언트
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  allowRetry = true
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const skipAuth = AUTH_WHITELIST.some((path) => endpoint.startsWith(path))

  const headers = new Headers(options?.headers || {})
  headers.set('Content-Type', 'application/json')

  if (!skipAuth) {
    const token = await ensureAccessToken()

    if (!token) {
      const error = createApiError('인증이 필요합니다.', 'AUTH_REQUIRED', 401)
      emitApiError(error)
      throw error
    }

    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response

  try {
    response = await fetch(url, {
      ...options,
      headers,
    })
  } catch (err) {
    const error = createApiError(
      err instanceof Error ? err.message : '네트워크 오류가 발생했습니다.',
      'NETWORK_ERROR',
      0
    )
    emitApiError(error)
    throw error
  }

  // 401 → 리프레시 후 한 번 재시도
  if (response.status === 401 && allowRetry && !skipAuth) {
    const refreshedToken = await refreshAccessToken()

    if (refreshedToken) {
      headers.set('Authorization', `Bearer ${refreshedToken}`)
      response = await fetch(url, {
        ...options,
        headers,
      })
    }
  }

  if (!response.ok) {
    const error = await toApiError(response)

    // 인증 관련 에러는 토큰 정리
    if (response.status === 401 || response.status === 403) {
      clearTokens()
    }

    emitApiError(error)
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

async function ensureAccessToken(): Promise<string | null> {
  const token = getValidAccessToken()
  if (token) return token

  return refreshAccessToken()
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  const refreshToken = getValidRefreshToken()
  if (!refreshToken) return null

  refreshPromise = requestTokenRefresh(refreshToken)

  return refreshPromise
}

async function requestTokenRefresh(
  refreshToken: string
): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      const error = await toApiError(response)
      emitApiError(error)
      clearTokens()
      return null
    }

    const data = (await response.json()) as {
      tokens: { accessToken: string; refreshToken: string }
    }

    setTokens(data.tokens.accessToken, data.tokens.refreshToken)
    return data.tokens.accessToken
  } catch (err) {
    const error = createApiError(
      err instanceof Error ? err.message : '토큰 갱신에 실패했습니다.',
      'REFRESH_FAILED',
      0
    )
    emitApiError(error)
    clearTokens()
    return null
  } finally {
    refreshPromise = null
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  const fallback = createApiError(
    'API 요청에 실패했습니다.',
    'UNKNOWN_ERROR',
    response.status
  )

  try {
    const errorData = await response.json()
    return {
      ...fallback,
      ...(errorData?.message && { message: errorData.message }),
      ...(errorData?.code && { code: errorData.code }),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : fallback.message
    return { ...fallback, message }
  }
}

function createApiError(
  message: string,
  code: string,
  status: number
): ApiError {
  return { message, code, status }
}

// HTTP 메서드 헬퍼
export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'DELETE' }),
}
