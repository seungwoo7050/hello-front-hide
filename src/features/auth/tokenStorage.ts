/**
 * 토큰 저장소 유틸리티
 */
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

/** 액세스 토큰 저장 */
export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/** 액세스 토큰 조회 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/** 리프레시 토큰 저장 */
export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

/** 리프레시 토큰 조회 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/** 모든 토큰 저장 */
export function setTokens(accessToken: string, refreshToken: string): void {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
}

/** 모든 토큰 삭제 */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/** 토큰 존재 여부 확인 */
export function hasTokens(): boolean {
  return !!getAccessToken();
}

export const tokenStorage = {
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  hasTokens,
};
