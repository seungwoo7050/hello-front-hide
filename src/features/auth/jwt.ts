import { jwtDecode } from 'jwt-decode'

type BufferLike = typeof import('node:buffer').Buffer

export interface DecodedToken {
  exp?: number
  iat?: number
  sub?: string
  email?: string
  name?: string
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token)
  } catch {
    return null
  }
}

export function getTokenExpiration(token: string): number | null {
  const decoded = decodeToken(token)
  if (!decoded?.exp) return null
  return decoded.exp * 1000
}

export function isTokenExpired(token: string, skewSeconds = 30): boolean {
  const exp = getTokenExpiration(token)
  if (!exp) return true
  const nowWithSkew = Date.now() + skewSeconds * 1000
  return exp <= nowWithSkew
}

export function createMockJwt(
  payload: Record<string, unknown>,
  expiresInSeconds = 15 * 60
): string {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'HS256', typ: 'JWT' }
  const fullPayload = {
    iat: now,
    exp: now + expiresInSeconds,
    ...payload,
  }

  const encode = (data: object) => base64UrlEncode(JSON.stringify(data))

  return `${encode(header)}.${encode(fullPayload)}.signature`
}

function base64UrlEncode(value: string): string {
  const nodeBuffer = (globalThis as { Buffer?: BufferLike }).Buffer

  if (nodeBuffer) {
    return nodeBuffer
      .from(value, 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  if (typeof btoa === 'function') {
    // btoa는 기본적으로 ASCII만 지원하므로 UTF-8로 인코딩 후 처리
    const utf8Value = unescape(encodeURIComponent(value))
    return btoa(utf8Value)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  throw new Error('No base64 encoder available')
}
