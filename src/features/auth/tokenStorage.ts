/**
 * 토큰 저장소 유틸리티
 */
import { isTokenExpired } from './jwt'

const ACCESS_TOKEN_KEY = 'auth_access_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'

/** 액세스 토큰 저장 */
export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

/** 액세스 토큰 조회 (만료 여부는 검사하지 않음) */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/** 리프레시 토큰 저장 */
export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

/** 리프레시 토큰 조회 (만료 여부는 검사하지 않음) */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/** 만료를 고려한 액세스 토큰 조회 */
export function getValidAccessToken(): string | null {
  const token = getAccessToken()
  if (!token) return null

  if (isTokenExpired(token)) {
    clearAccessToken()
    return null
  }

  return token
}

/** 만료를 고려한 리프레시 토큰 조회 */
export function getValidRefreshToken(): string | null {
  const token = getRefreshToken()
  if (!token) return null

  if (isTokenExpired(token, 0)) {
    clearRefreshToken()
    return null
  }

  return token
}

function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

function clearRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/** 모든 토큰 저장 */
export function setTokens(accessToken: string, refreshToken: string): void {
  setAccessToken(accessToken)
  setRefreshToken(refreshToken)
}

/** 모든 토큰 삭제 */
export function clearTokens(): void {
  clearAccessToken()
  clearRefreshToken()
}

/** 토큰 존재 여부 확인 (만료 토큰 제외) */
export function hasTokens(): boolean {
  return !!getValidAccessToken() || !!getValidRefreshToken()
}

export const tokenStorage = {
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  getValidAccessToken,
  getValidRefreshToken,
  setTokens,
  clearTokens,
  hasTokens,
}
