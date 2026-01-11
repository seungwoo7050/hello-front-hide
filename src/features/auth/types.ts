/**
 * 인증(Auth) 관련 타입 정의
 */

/** 사용자 정보 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

/** 인증 토큰 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** 인증 응답 */
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

/** 로그인 요청 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 회원가입 요청 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/** 인증 상태 */
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

/** 인증 컨텍스트 상태 */
export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
}

/** 인증 컨텍스트 액션 */
export interface AuthActions {
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

/** 인증 컨텍스트 값 */
export type AuthContextValue = AuthState & AuthActions;
