/**
 * tokenStorage 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  hasTokens,
} from './tokenStorage';

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('accessToken', () => {
    it('액세스 토큰을 저장하고 조회한다', () => {
      setAccessToken('test-access-token');
      expect(getAccessToken()).toBe('test-access-token');
    });

    it('토큰이 없으면 null을 반환한다', () => {
      expect(getAccessToken()).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('리프레시 토큰을 저장하고 조회한다', () => {
      setRefreshToken('test-refresh-token');
      expect(getRefreshToken()).toBe('test-refresh-token');
    });

    it('토큰이 없으면 null을 반환한다', () => {
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe('setTokens', () => {
    it('두 토큰을 한 번에 저장한다', () => {
      setTokens('access', 'refresh');
      expect(getAccessToken()).toBe('access');
      expect(getRefreshToken()).toBe('refresh');
    });
  });

  describe('clearTokens', () => {
    it('모든 토큰을 삭제한다', () => {
      setTokens('access', 'refresh');
      clearTokens();
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe('hasTokens', () => {
    it('토큰이 있으면 true를 반환한다', () => {
      setAccessToken('test');
      expect(hasTokens()).toBe(true);
    });

    it('토큰이 없으면 false를 반환한다', () => {
      expect(hasTokens()).toBe(false);
    });
  });
});
