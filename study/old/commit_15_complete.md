# Commit #15 — JWT 인증, 토큰 갱신 및 만료 처리

## Meta
- **난이도**: ⭐⭐⭐⭐⭐ 고급 (Expert)
- **권장 커밋 메시지**: `feat(auth): implement JWT token refresh and expiration handling`

## 학습 목표
1. JWT(JSON Web Token)의 구조와 동작 원리를 이해한다
2. Access Token과 Refresh Token 전략을 구현한다
3. 토큰 만료 시 자동 갱신 메커니즘을 구현한다
4. 인증 에러 처리 및 사용자 경험 최적화를 학습한다

## TL;DR
Access Token(짧은 수명)과 Refresh Token(긴 수명) 전략을 구현한다. API 요청 시 토큰 만료되면 자동으로 갱신하고, 갱신 실패 시 로그아웃 처리한다. 인터셉터 패턴으로 모든 API 요청에 토큰을 자동 첨부한다.

## 배경/맥락
JWT 기반 인증의 핵심 개념:
- **Access Token**: API 인증용 (짧은 수명, 15분~1시간)
- **Refresh Token**: Access Token 갱신용 (긴 수명, 7일~30일)
- **토큰 갱신**: Access Token 만료 시 Refresh Token으로 새 토큰 발급
- **무효화**: Refresh Token 탈취 시 서버에서 무효화 가능

```
클라이언트                      서버
    │                           │
    │───── 로그인 ─────────────▶│
    │◀── Access + Refresh ─────│
    │                           │
    │── API 요청 (Access) ─────▶│
    │◀──────── 응답 ───────────│
    │                           │
    │── API 요청 (만료됨) ─────▶│
    │◀──────── 401 ────────────│
    │                           │
    │── 갱신 (Refresh) ────────▶│
    │◀── 새 Access Token ──────│
    │                           │
    │── API 재요청 (새 Access) ─▶│
    │◀──────── 응답 ───────────│
```

## 변경 파일 목록
### 추가된 파일 (4개)
- `src/api/interceptors.ts` — API 인터셉터 (토큰 첨부, 갱신)
- `src/api/tokenService.ts` — 토큰 관리 서비스
- `src/api/authApi.ts` — 인증 API 함수
- `src/utils/jwt.ts` — JWT 유틸리티 (디코딩)

### 수정된 파일 (5개)
- `src/api/client.ts` — 인터셉터 통합
- `src/features/auth/AuthContext.tsx` — 토큰 갱신 로직 통합
- `src/mocks/handlers/auth.ts` — 토큰 갱신 API 핸들러 추가
- `src/features/auth/types.ts` — 토큰 관련 타입 추가

## 코드 스니펫

### 1. JWT 유틸리티
```typescript
/* src/utils/jwt.ts:1-50 */
export interface JWTPayload {
  sub: string        // subject (user id)
  email: string
  name: string
  iat: number        // issued at (발급 시간)
  exp: number        // expiration (만료 시간)
}

/**
 * JWT 토큰 디코딩 (검증 없이 페이로드만 추출)
 * 주의: 서명 검증은 서버에서만 수행해야 함
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Base64Url 디코딩
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

/**
 * 토큰 만료 여부 확인
 * @param token JWT 토큰
 * @param bufferSeconds 버퍼 시간 (기본 30초 전에 만료로 간주)
 */
export function isTokenExpired(token: string, bufferSeconds = 30): boolean {
  const payload = decodeJWT(token)
  if (!payload) {
    return true
  }

  const now = Math.floor(Date.now() / 1000)
  return payload.exp <= now + bufferSeconds
}

/**
 * 토큰 만료까지 남은 시간 (초)
 */
export function getTokenExpiresIn(token: string): number {
  const payload = decodeJWT(token)
  if (!payload) {
    return 0
  }

  const now = Math.floor(Date.now() / 1000)
  return Math.max(0, payload.exp - now)
}
```

**선정 이유**: JWT 클라이언트 측 처리 유틸리티

**로직/흐름 설명**:
- `decodeJWT`: Base64 디코딩으로 페이로드 추출 (서명 검증 X)
- `isTokenExpired`: 만료 30초 전에 미리 갱신하기 위한 버퍼
- `atob`: Base64 → 문자열 디코딩 (브라우저 내장)

**학습 포인트**:
- JWT 구조: `header.payload.signature`
- Q: 클라이언트에서 서명을 검증하지 않는 이유?
- A: 서명 검증에는 비밀키가 필요하고, 비밀키는 서버에만 있어야 함

---

### 2. 토큰 관리 서비스
```typescript
/* src/api/tokenService.ts:1-80 */
import { isTokenExpired } from '../utils/jwt'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

class TokenService {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private refreshPromise: Promise<string> | null = null

  constructor() {
    // localStorage에서 복원
    this.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  getRefreshToken(): string | null {
    return this.refreshToken
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  clearTokens(): void {
    this.accessToken = null
    this.refreshToken = null
    this.refreshPromise = null
    
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  isAccessTokenExpired(): boolean {
    if (!this.accessToken) return true
    return isTokenExpired(this.accessToken)
  }

  isRefreshTokenExpired(): boolean {
    if (!this.refreshToken) return true
    return isTokenExpired(this.refreshToken, 0) // 버퍼 없이 정확히 만료 시점
  }

  /**
   * Access Token 갱신 (동시 요청 방지)
   */
  async refreshAccessToken(): Promise<string> {
    // 이미 갱신 중이면 기존 Promise 반환 (중복 요청 방지)
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    if (!this.refreshToken || this.isRefreshTokenExpired()) {
      this.clearTokens()
      throw new Error('Refresh token is invalid or expired')
    }

    this.refreshPromise = this.doRefresh()
    
    try {
      const newAccessToken = await this.refreshPromise
      return newAccessToken
    } finally {
      this.refreshPromise = null
    }
  }

  private async doRefresh(): Promise<string> {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: this.refreshToken,
      }),
    })

    if (!response.ok) {
      this.clearTokens()
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    
    this.setTokens(data.data.accessToken, data.data.refreshToken)
    
    return data.data.accessToken
  }
}

export const tokenService = new TokenService()
```

**선정 이유**: 토큰 관리 로직 중앙화

**로직/흐름 설명**:
- **싱글톤 패턴**: 앱 전체에서 하나의 인스턴스 사용
- **refreshPromise**: 동시에 여러 요청이 갱신 시도 시 중복 방지
- **doRefresh**: 실제 API 호출 (fetch 직접 사용)

**학습 포인트**:
- Q: 왜 refreshPromise를 저장하는가?
- A: 여러 API 요청이 동시에 401을 받으면 갱신 요청도 동시에 발생 → 중복 방지

---

### 3. API 인터셉터
```typescript
/* src/api/interceptors.ts:1-90 */
import { tokenService } from './tokenService'
import type { ApiError } from './client'

type RequestConfig = RequestInit & {
  _retry?: boolean
}

/**
 * 요청 인터셉터: Authorization 헤더 추가
 */
export function requestInterceptor(config: RequestConfig): RequestConfig {
  const token = tokenService.getAccessToken()
  
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }
  
  return config
}

/**
 * 응답 인터셉터: 401 에러 시 토큰 갱신 후 재시도
 */
export async function responseInterceptor(
  response: Response,
  url: string,
  config: RequestConfig
): Promise<Response> {
  // 401이 아니면 그대로 반환
  if (response.status !== 401) {
    return response
  }

  // 이미 재시도한 요청이면 에러 (무한 루프 방지)
  if (config._retry) {
    tokenService.clearTokens()
    throw createAuthError('인증이 만료되었습니다. 다시 로그인해주세요.')
  }

  // Refresh Token이 없으면 에러
  if (!tokenService.getRefreshToken()) {
    throw createAuthError('로그인이 필요합니다.')
  }

  try {
    // 토큰 갱신
    const newAccessToken = await tokenService.refreshAccessToken()
    
    // 새 토큰으로 요청 재시도
    const retryConfig: RequestConfig = {
      ...config,
      _retry: true,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${newAccessToken}`,
      },
    }
    
    return fetch(url, retryConfig)
  } catch (error) {
    tokenService.clearTokens()
    throw createAuthError('세션이 만료되었습니다. 다시 로그인해주세요.')
  }
}

function createAuthError(message: string): ApiError {
  return {
    message,
    code: 'UNAUTHORIZED',
    status: 401,
  }
}

/**
 * 인터셉터가 적용된 fetch 래퍼
 */
export async function fetchWithInterceptors(
  url: string,
  config: RequestInit = {}
): Promise<Response> {
  // 요청 인터셉터
  const interceptedConfig = requestInterceptor(config as RequestConfig)
  
  // 요청 실행
  const response = await fetch(url, interceptedConfig)
  
  // 응답 인터셉터
  return responseInterceptor(response, url, interceptedConfig)
}
```

**선정 이유**: 모든 API 요청에 자동으로 토큰 첨부 및 갱신

**로직/흐름 설명**:
- **requestInterceptor**: 모든 요청에 Authorization 헤더 추가
- **responseInterceptor**: 401 응답 시 자동 갱신 후 재시도
- **_retry 플래그**: 무한 재시도 방지

**런타임 영향**:
- API 호출 시 토큰 만료되어도 사용자 경험 중단 없음
- 갱신 실패 시에만 로그인 페이지로 이동

**학습 포인트**:
- Axios 인터셉터 패턴을 fetch로 구현
- Q: 왜 _retry 플래그가 필요한가?
- A: 갱신된 토큰도 401이면 무한 루프 발생 가능

---

### 4. MSW 토큰 갱신 핸들러
```typescript
/* src/mocks/handlers/auth.ts (추가 부분) */
import { http, HttpResponse, delay } from 'msw'

// 토큰 생성 헬퍼
function generateTokens(userId: string) {
  const now = Math.floor(Date.now() / 1000)
  
  // Access Token: 15분
  const accessPayload = {
    sub: userId,
    email: 'test@example.com',
    name: 'Test User',
    iat: now,
    exp: now + 15 * 60, // 15분
  }
  
  // Refresh Token: 7일
  const refreshPayload = {
    sub: userId,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7일
  }
  
  return {
    accessToken: `mock.${btoa(JSON.stringify(accessPayload))}.signature`,
    refreshToken: `mock.${btoa(JSON.stringify(refreshPayload))}.signature`,
  }
}

// 저장된 Refresh Token
const validRefreshTokens = new Set<string>()

export const authHandlers = [
  // POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    await delay(300)
    
    const { email, password } = (await request.json()) as LoginCredentials
    
    if (email !== 'test@example.com' || password !== 'password123') {
      return HttpResponse.json(
        { message: '이메일 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 }
      )
    }
    
    const tokens = generateTokens('user-1')
    validRefreshTokens.add(tokens.refreshToken)
    
    return HttpResponse.json({
      data: {
        user: { id: 'user-1', email, name: 'Test User' },
        ...tokens,
      },
    })
  }),

  // POST /api/auth/refresh
  http.post('/api/auth/refresh', async ({ request }) => {
    await delay(200)
    
    const { refreshToken } = (await request.json()) as { refreshToken: string }
    
    if (!validRefreshTokens.has(refreshToken)) {
      return HttpResponse.json(
        { message: 'Invalid refresh token', code: 'INVALID_TOKEN' },
        { status: 401 }
      )
    }
    
    // 기존 토큰 무효화 (Refresh Token Rotation)
    validRefreshTokens.delete(refreshToken)
    
    // 새 토큰 발급
    const tokens = generateTokens('user-1')
    validRefreshTokens.add(tokens.refreshToken)
    
    return HttpResponse.json({
      data: tokens,
    })
  }),

  // POST /api/auth/logout
  http.post('/api/auth/logout', async ({ request }) => {
    await delay(100)
    
    const authHeader = request.headers.get('Authorization')
    // Refresh Token도 무효화 (실제로는 body에서 받거나 쿠키에서)
    
    return HttpResponse.json({ data: { success: true } })
  }),
]
```

**선정 이유**: JWT 토큰 갱신 로직의 서버 측 시뮬레이션

**로직/흐름 설명**:
- `generateTokens`: JWT 구조의 모의 토큰 생성
- `validRefreshTokens`: 유효한 Refresh Token 저장 (Set)
- **Refresh Token Rotation**: 갱신 시 기존 토큰 무효화 → 보안 강화

**학습 포인트**:
- Refresh Token Rotation: 갱신할 때마다 새 Refresh Token 발급
- Q: 왜 Rotation이 필요한가?
- A: 탈취된 Refresh Token이 사용되면 감지 가능 (이미 무효화됨)

---

### 5. AuthContext 토큰 통합
```typescript
/* src/features/auth/AuthContext.tsx (수정 부분) */
import { tokenService } from '../../api/tokenService'
import { decodeJWT } from '../../utils/jwt'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const token = tokenService.getAccessToken()
    if (!token) return null
    
    const payload = decodeJWT(token)
    if (!payload) return null
    
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    }
  })

  const isAuthenticated = !!tokenService.getAccessToken()

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials)
    
    tokenService.setTokens(
      response.data.accessToken,
      response.data.refreshToken
    )
    
    setUser(response.data.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // 로그아웃 API 실패해도 로컬 토큰은 삭제
    }
    
    tokenService.clearTokens()
    setUser(null)
  }, [])

  // ...
}
```

**선정 이유**: AuthContext와 TokenService 통합

## 재현 단계 (CLI 우선)

### CLI 명령어
```bash
# 1. 개발 서버 실행
npm run dev

# 2. 테스트 실행
npm test -- --run

# 3. 토큰 만료 테스트 (DevTools Console)
# localStorage에서 토큰 만료 시간 확인
const token = localStorage.getItem('access_token')
const payload = JSON.parse(atob(token.split('.')[1]))
console.log('Expires:', new Date(payload.exp * 1000))

# 4. 빌드 확인
npm run build
```

### 구현 단계 (코드 작성 순서)
1. **JWT 유틸리티 구현**: `src/utils/jwt.ts`
2. **TokenService 구현**: `src/api/tokenService.ts`
3. **인터셉터 구현**: `src/api/interceptors.ts`
4. **API 클라이언트 수정**: 인터셉터 통합
5. **MSW 핸들러 수정**: 토큰 갱신 API 추가
6. **AuthContext 수정**: TokenService 통합
7. **타입 수정**: accessToken, refreshToken 추가
8. **검증**: 토큰 만료 시 자동 갱신 테스트

## 설명

### 설계 결정
1. **Access + Refresh Token**: 보안과 UX의 균형
2. **Refresh Token Rotation**: 탈취 감지 가능
3. **인터셉터 패턴**: 모든 API 요청에 자동 적용

### 트레이드오프
- **짧은 Access Token (15분)**: 탈취 시 피해 최소화 vs 갱신 빈도 증가
- **localStorage vs httpOnly 쿠키**: 구현 단순 vs XSS 보안

### 보안 고려사항
| 위협 | 대응 |
|-----|------|
| XSS | httpOnly 쿠키 사용 권장 (백엔드 지원 필요) |
| CSRF | SameSite 쿠키 속성 |
| 토큰 탈취 | 짧은 만료 시간 + Refresh Token Rotation |
| Refresh 탈취 | 서버에서 무효화 가능 |

### 토큰 흐름도
```
1. 로그인 성공 → Access Token + Refresh Token 저장
2. API 요청 → Authorization: Bearer {accessToken}
3. 401 응답 → Refresh Token으로 갱신 시도
4. 갱신 성공 → 새 Access Token으로 재요청
5. 갱신 실패 → 로그아웃 처리
```

## 검증 체크리스트

### 자동 검증
```bash
npm run lint      # PASS
npm test -- --run # 모든 테스트 통과
npm run build     # 성공
```

### 수동 검증
- [ ] 로그인 후 localStorage에 access_token, refresh_token 저장 확인
- [ ] API 요청 시 Authorization 헤더 첨부 확인 (Network 탭)
- [ ] 토큰 만료 시 자동 갱신 확인 (DevTools에서 토큰 수동 만료)
- [ ] 갱신 후 새 토큰으로 재요청 확인
- [ ] Refresh Token 만료 시 로그인 페이지로 이동

## 누락 정보
- 없음
