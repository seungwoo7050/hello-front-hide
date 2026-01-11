/**
 * 인증 관련 커스텀 훅들
 * AuthContext에서 분리하여 Fast Refresh 호환
 */
import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextValue, AuthStatus, User } from './types';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/** 인증된 사용자 정보만 반환 (null이면 예외) */
export function useCurrentUser(): User {
  const { user } = useAuth();
  if (!user) {
    throw new Error('User is not authenticated');
  }
  return user;
}

/** 인증 상태만 반환 */
export function useAuthStatus(): AuthStatus {
  const { status } = useAuth();
  return status;
}

/** 인증 여부 불리언 */
export function useIsAuthenticated(): boolean {
  const { status } = useAuth();
  return status === 'authenticated';
}
