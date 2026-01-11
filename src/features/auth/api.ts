/**
 * 인증 API 함수
 */
import { api } from '../../api';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from './types';

const AUTH_BASE = '/auth';

/** 로그인 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>(`${AUTH_BASE}/login`, credentials);
}

/** 회원가입 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>(`${AUTH_BASE}/register`, data);
}

/** 로그아웃 */
export async function logout(): Promise<void> {
  await api.post(`${AUTH_BASE}/logout`, {});
}

/** 현재 사용자 정보 조회 */
export async function getCurrentUser(): Promise<User> {
  return api.get<User>(`${AUTH_BASE}/me`);
}

/** 토큰 갱신 */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  return api.post<AuthResponse>(`${AUTH_BASE}/refresh`, { refreshToken });
}

export const authApi = {
  login,
  register,
  logout,
  getCurrentUser,
  refreshToken,
};
