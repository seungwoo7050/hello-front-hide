/**
 * tokenStorage 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  hasTokens,
  getValidAccessToken,
  getValidRefreshToken,
} from './tokenStorage'
import { createMockJwt } from './jwt'

function createTestToken(expiresInSeconds = 300) {
  return createMockJwt({ sub: 'user-1', type: 'test' }, expiresInSeconds)
}

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('accessToken', () => {
    it('액세스 토큰을 저장하고 조회한다', () => {
      const token = createTestToken()
      setAccessToken(token)
      expect(getAccessToken()).toBe(token)
    })

    it('토큰이 없으면 null을 반환한다', () => {
      expect(getAccessToken()).toBeNull()
    })
  })

  describe('refreshToken', () => {
    it('리프레시 토큰을 저장하고 조회한다', () => {
      const token = createTestToken()
      setRefreshToken(token)
      expect(getRefreshToken()).toBe(token)
    })

    it('토큰이 없으면 null을 반환한다', () => {
      expect(getRefreshToken()).toBeNull()
    })
  })

  describe('setTokens', () => {
    it('두 토큰을 한 번에 저장한다', () => {
      const access = createTestToken()
      const refresh = createTestToken(600)
      setTokens(access, refresh)
      expect(getAccessToken()).toBe(access)
      expect(getRefreshToken()).toBe(refresh)
    })
  })

  describe('clearTokens', () => {
    it('모든 토큰을 삭제한다', () => {
      setTokens(createTestToken(), createTestToken())
      clearTokens()
      expect(getAccessToken()).toBeNull()
      expect(getRefreshToken()).toBeNull()
    })
  })

  describe('hasTokens', () => {
    it('토큰이 있으면 true를 반환한다', () => {
      setAccessToken(createTestToken())
      expect(hasTokens()).toBe(true)
    })

    it('토큰이 없으면 false를 반환한다', () => {
      expect(hasTokens()).toBe(false)
    })

    it('만료된 토큰만 있으면 false를 반환한다', () => {
      const expired = createTestToken(-60)
      setTokens(expired, expired)
      expect(getValidAccessToken()).toBeNull()
      expect(getValidRefreshToken()).toBeNull()
      expect(hasTokens()).toBe(false)
    })
  })
})
