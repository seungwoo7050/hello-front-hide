# Commit #15 — JWT 인증 및 토큰 리프레시

## Meta
| 항목 | 내용 |
|------|------|
| 커밋 해시 | `b7f95c910fd2eb1e8aadbeaa93b52a6caedaae31` |
| 부모 커밋 | `345ebed68c08606be8d6d06980c36c7354c09d83` |
| 난이도 | ⭐⭐⭐⭐⭐ (고급) |
| 관련 기술 | JWT, Token Refresh, Axios Interceptor, Error Handling, MSW |
| 커밋 메시지 | Stage 13: feat(auth): add JWT auth, token refresh & expiry handling |

## 학습 목표
1. JWT(JSON Web Token) 구조 및 디코딩 이해
2. Access Token / Refresh Token 이중 토큰 전략 구현
3. 토큰 만료 체크 및 자동 갱신 로직 구현
4. API 클라이언트에서 401 응답 시 재시도 로직
5. 글로벌 API 에러 이벤트 시스템 구축
6. ApiErrorListener 컴포넌트로 에러 토스트 표시

## TL;DR
> JWT 기반 인증 시스템을 완성한다. `jwt-decode` 라이브러리로 토큰을 파싱하고 만료 시간을 체크하며, 401 응답 시 Refresh Token으로 Access Token을 갱신한 후 요청을 재시도한다. 글로벌 API 에러 이벤트 시스템으로 모든 API 에러를 Toast로 표시하고, 인증 만료 시 자동 로그아웃 처리한다.

## 배경 / 컨텍스트
- **기존 인증의 한계**: Access Token만 사용하면 만료 시 사용자가 다시 로그인 필요
- **Refresh Token 도입**: Access Token 만료 시 Refresh Token으로 새 토큰 발급
- **UX 개선**: 사용자 모르게 토큰 갱신 → 끊김 없는 경험
- **보안**: Access Token은 짧은 수명, Refresh Token은 긴 수명으로 보안과 UX 균형
- **에러 핸들링**: 일관된 에러 처리 및 사용자 피드백

## 변경 파일 목록
| 파일 경로 | 변경 타입 | 설명 |
|-----------|-----------|------|
| `package.json` | ✏️ 수정 | jwt-decode 패키지 추가 |
| `src/features/auth/jwt.ts` | ✨ 추가 | JWT 유틸리티 (디코딩, 만료 체크) |
| `src/features/auth/tokenStorage.ts` | ✏️ 수정 | 유효성 검사 포함 토큰 getter |
| `src/api/client.ts` | ✏️ 수정 | 토큰 리프레시, 401 재시도 로직 |
| `src/api/events.ts` | ✨ 추가 | 글로벌 API 에러 이벤트 |
| `src/components/ApiErrorListener.tsx` | ✨ 추가 | 에러 Toast 표시 컴포넌트 |
| `src/mocks/handlers/auth.ts` | ✏️ 수정 | 토큰 검증 및 리프레시 핸들러 |
| `src/mocks/handlers/notes.ts` | ✏️ 수정 | 토큰 검증 추가 |
| `src/App.tsx` | ✏️ 수정 | MSW 초기화 조건 개선 |

## 코드 스니펫

### 1. JWT 유틸리티
```typescript
// path: src/features/auth/jwt.ts:1..50
import { jwtDecode } from 'jwt-decode'

interface JWTPayload {
  sub: string
  email: string
  name: string
  iat: number
  exp: number
}

/**
 * JWT 토큰 디코딩
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwtDecode<JWTPayload>(token)
  } catch {
    return null
  }
}

/**
 * 토큰 만료 여부 확인
 * @param token JWT 토큰
 * @param bufferSeconds 만료 전 여유 시간 (기본 30초)
 */
export function isTokenExpired(
  token: string,
  bufferSeconds: number = 30
): boolean {
  const payload = decodeToken(token)
  if (!payload) return true

  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now + bufferSeconds
}

/**
 * 토큰에서 사용자 정보 추출
 */
export function getUserFromToken(token: string): { id: string; email: string; name: string } | null {
  const payload = decodeToken(token)
  if (!payload) return null

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
  }
}
```

### 2. 유효성 검사 포함 토큰 스토리지
```typescript
// path: src/features/auth/tokenStorage.ts:1..60
import { isTokenExpired } from './jwt'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * 유효한 Access Token 반환 (만료되지 않은 경우만)
 */
export function getValidAccessToken(): string | null {
  const token = getAccessToken()
  if (!token) return null
  if (isTokenExpired(token)) return null
  return token
}

/**
 * 유효한 Refresh Token 반환
 */
export function getValidRefreshToken(): string | null {
  const token = getRefreshToken()
  if (!token) return null
  if (isTokenExpired(token, 0)) return null // refresh token은 버퍼 없이 체크
  return token
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}
```

### 3. API 클라이언트 - 토큰 리프레시 및 재시도
```typescript
// path: src/api/client.ts:1..170
import {
  clearTokens,
  getValidAccessToken,
  getValidRefreshToken,
  setTokens,
} from '../features/auth/tokenStorage'
import { emitApiError } from './events'

export interface ApiError {
  message: string
  code: string
  status: number
}

export const API_BASE_URL = '/api'

const AUTH_WHITELIST = ['/auth/login', '/auth/register', '/auth/refresh']

// 토큰 리프레시 중복 방지를 위한 Promise 캐싱
let refreshPromise: Promise<string | null> | null = null

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  allowRetry = true
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const skipAuth = AUTH_WHITELIST.some((path) => endpoint.startsWith(path))

  const headers = new Headers(options?.headers || {})
  headers.set('Content-Type', 'application/json')

  // 인증이 필요한 엔드포인트
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
    response = await fetch(url, { ...options, headers })
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
      response = await fetch(url, { ...options, headers })
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

/**
 * Access Token 확보 (필요시 리프레시)
 */
async function ensureAccessToken(): Promise<string | null> {
  const token = getValidAccessToken()
  if (token) return token

  return refreshAccessToken()
}

/**
 * Access Token 갱신
 */
async function refreshAccessToken(): Promise<string | null> {
  // 이미 리프레시 진행 중이면 해당 Promise 반환 (중복 요청 방지)
  if (refreshPromise) return refreshPromise

  const refreshToken = getValidRefreshToken()
  if (!refreshToken) return null

  refreshPromise = requestTokenRefresh(refreshToken)

  return refreshPromise
}

async function requestTokenRefresh(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      clearTokens()
      return null
    }

    const data = await response.json() as {
      tokens: { accessToken: string; refreshToken: string }
    }

    setTokens(data.tokens.accessToken, data.tokens.refreshToken)
    return data.tokens.accessToken
  } catch {
    clearTokens()
    return null
  } finally {
    refreshPromise = null
  }
}

function createApiError(message: string, code: string, status: number): ApiError {
  return { message, code, status }
}
```

### 4. 글로벌 API 에러 이벤트
```typescript
// path: src/api/events.ts:1..30
import type { ApiError } from './client'

type ApiErrorListener = (error: ApiError) => void

const listeners = new Set<ApiErrorListener>()

/**
 * API 에러 이벤트 발생
 */
export function emitApiError(error: ApiError): void {
  listeners.forEach((listener) => {
    try {
      listener(error)
    } catch {
      // 리스너 에러 무시
    }
  })
}

/**
 * API 에러 리스너 등록
 */
export function onApiError(listener: ApiErrorListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
```

### 5. ApiErrorListener 컴포넌트
```typescript
// path: src/components/ApiErrorListener.tsx:1..45
import { useEffect } from 'react'
import { onApiError } from '../api/events'
import { useToast } from './ui/Toast'
import { useAuth } from '../features/auth'

export function ApiErrorListener() {
  const { showToast } = useToast()
  const { logout } = useAuth()

  useEffect(() => {
    const unsubscribe = onApiError((error) => {
      // 401/403은 인증 만료 → 로그아웃 처리
      if (error.status === 401 || error.status === 403) {
        showToast({
          type: 'error',
          message: '인증이 만료되었습니다. 다시 로그인해주세요.',
        })
        logout()
        return
      }

      // 네트워크 에러
      if (error.status === 0) {
        showToast({
          type: 'error',
          message: '네트워크 오류가 발생했습니다.',
        })
        return
      }

      // 일반 에러
      showToast({
        type: 'error',
        message: error.message || 'API 오류가 발생했습니다.',
      })
    })

    return unsubscribe
  }, [showToast, logout])

  return null
}
```

### 6. MSW Auth 핸들러 - 토큰 검증
```typescript
// path: src/mocks/handlers/auth.ts:50..100
import { http, HttpResponse, delay } from 'msw'
import { decodeToken, isTokenExpired } from '../../features/auth/jwt'

// 토큰 검증 헬퍼
function validateToken(request: Request): { valid: boolean; userId?: string } {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false }
  }

  const token = authHeader.slice(7)
  if (isTokenExpired(token, 0)) {
    return { valid: false }
  }

  const payload = decodeToken(token)
  if (!payload) {
    return { valid: false }
  }

  return { valid: true, userId: payload.sub }
}

// GET /auth/me - 현재 사용자 조회
http.get('/api/auth/me', async ({ request }) => {
  await delay(API_DELAY)

  const { valid, userId } = validateToken(request)
  if (!valid) {
    return HttpResponse.json(
      { message: '인증이 필요합니다.', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  const user = findUserById(userId!)
  if (!user) {
    return HttpResponse.json(
      { message: '사용자를 찾을 수 없습니다.', code: 'NOT_FOUND' },
      { status: 404 }
    )
  }

  return HttpResponse.json(user)
})

// POST /auth/refresh - 토큰 갱신
http.post('/api/auth/refresh', async ({ request }) => {
  await delay(API_DELAY)

  const body = await request.json() as { refreshToken: string }

  if (!body.refreshToken || isTokenExpired(body.refreshToken, 0)) {
    return HttpResponse.json(
      { message: '유효하지 않은 리프레시 토큰입니다.', code: 'INVALID_TOKEN' },
      { status: 401 }
    )
  }

  const payload = decodeToken(body.refreshToken)
  const user = findUserById(payload!.sub)

  // 새 토큰 발급
  const tokens = generateTokens(user!)

  return HttpResponse.json({ tokens })
})
```

### 7. App.tsx - MSW 초기화 조건
```typescript
// path: src/App.tsx:1..25
import { useEffect } from 'react'
import { AppRouter } from './router'
import { ToastProvider } from './components/ui'
import { QueryProvider } from './providers'
import { AuthProvider } from './features/auth'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  useEffect(() => {
    // 브라우저 환경에서만 MSW 시작
    const canUseServiceWorker =
      typeof window !== 'undefined' && 'serviceWorker' in navigator

    if (!canUseServiceWorker) return

    import('./mocks/browser')
      .then(({ worker }) => {
        worker.start({
          onUnhandledRequest: 'bypass',
        })
      })
      .catch((err) => console.error('MSW setup failed:', err))
  }, [])

  // ...
}
```

## 재현 단계 (CLI 우선)

### Step 1: jwt-decode 패키지 설치
```bash
npm install jwt-decode@^4.0.0
```

### Step 2: JWT 유틸리티 생성
```bash
cat > src/features/auth/jwt.ts << 'EOF'
import { jwtDecode } from 'jwt-decode'

interface JWTPayload {
  sub: string
  email: string
  name: string
  iat: number
  exp: number
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwtDecode<JWTPayload>(token)
  } catch {
    return null
  }
}

export function isTokenExpired(token: string, bufferSeconds = 30): boolean {
  const payload = decodeToken(token)
  if (!payload) return true
  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now + bufferSeconds
}
EOF
```

### Step 3: API 이벤트 시스템 생성
```bash
cat > src/api/events.ts << 'EOF'
import type { ApiError } from './client'

type ApiErrorListener = (error: ApiError) => void
const listeners = new Set<ApiErrorListener>()

export function emitApiError(error: ApiError): void {
  listeners.forEach((listener) => listener(error))
}

export function onApiError(listener: ApiErrorListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
EOF
```

### Step 4: ApiErrorListener 컴포넌트 생성
```bash
cat > src/components/ApiErrorListener.tsx << 'EOF'
import { useEffect } from 'react'
import { onApiError } from '../api/events'
import { useToast } from './ui/Toast'
import { useAuth } from '../features/auth'

export function ApiErrorListener() {
  const { showToast } = useToast()
  const { logout } = useAuth()

  useEffect(() => {
    return onApiError((error) => {
      if (error.status === 401 || error.status === 403) {
        showToast({ type: 'error', message: '인증이 만료되었습니다.' })
        logout()
        return
      }
      showToast({ type: 'error', message: error.message })
    })
  }, [showToast, logout])

  return null
}
EOF
```

### Step 5: tokenStorage 업데이트
```bash
# src/features/auth/tokenStorage.ts에 getValidAccessToken, getValidRefreshToken 추가
# isTokenExpired를 사용한 유효성 검사 포함
```

### Step 6: API 클라이언트 업데이트
```bash
# src/api/client.ts 수정:
# - ensureAccessToken(): 유효한 토큰 확보
# - refreshAccessToken(): 토큰 갱신
# - 401 응답 시 재시도 로직
# - emitApiError() 호출
```

### Step 7: MSW 핸들러 업데이트
```bash
# src/mocks/handlers/auth.ts 수정:
# - validateToken() 헬퍼 추가
# - /auth/refresh 핸들러 추가
# - 모든 보호된 엔드포인트에 토큰 검증 추가
```

### Step 8: 테스트 실행
```bash
npm run test -- --run
npm run lint
```

### Step 9: 커밋
```bash
git add .
git commit -m "feat(auth): add JWT auth, token refresh & expiry handling"
```

## 상세 설명

### JWT 토큰 구조
```
Header.Payload.Signature

Payload 예시:
{
  "sub": "user-123",      // Subject (사용자 ID)
  "email": "user@email.com",
  "name": "User Name",
  "iat": 1704067200,      // Issued At (발급 시간)
  "exp": 1704070800       // Expiration (만료 시간)
}
```

### 토큰 리프레시 플로우
```
┌─────────────┐      API 요청      ┌─────────────┐
│   Client    │ ─────────────────► │   Server    │
└─────────────┘                    └─────────────┘
       │                                  │
       │  Access Token 만료?              │
       ├──────────────────────────────────┤
       │                                  │
       │  ┌─────────────────────────────┐ │
       │  │ 1. Access Token 만료 확인   │ │
       │  │ 2. Refresh Token으로 갱신   │ │
       │  │ 3. 새 Access Token 저장     │ │
       │  │ 4. 원래 요청 재시도         │ │
       │  └─────────────────────────────┘ │
       │                                  │
       │  401 응답 + allowRetry?          │
       ├──────────────────────────────────┤
       │                                  │
       │  ┌─────────────────────────────┐ │
       │  │ 1. Refresh API 호출         │ │
       │  │ 2. 새 토큰 저장             │ │
       │  │ 3. 원래 요청 재시도         │ │
       │  └─────────────────────────────┘ │
       │                                  │
```

### 중복 리프레시 요청 방지
```typescript
// 여러 API 호출이 동시에 401을 받으면
// 모두 같은 refresh Promise를 공유
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise  // 진행 중이면 기다림

  refreshPromise = requestTokenRefresh(token)
  return refreshPromise
}
```

### 에러 이벤트 시스템
```
┌──────────────┐   emitApiError()   ┌─────────────────┐
│  API Client  │ ────────────────► │  Event System   │
└──────────────┘                   └────────┬────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
            ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
            │ Toast Alert  │      │  Logout      │      │  Analytics   │
            └──────────────┘      └──────────────┘      └──────────────┘
```

### 보안 고려사항

| 항목 | Access Token | Refresh Token |
|------|--------------|---------------|
| 수명 | 15분 ~ 1시간 | 7일 ~ 30일 |
| 저장소 | 메모리 권장 (localStorage 사용 시 XSS 주의) | httpOnly 쿠키 권장 |
| 탈취 시 | 짧은 시간만 유효 | 서버에서 무효화 가능 |

## 검증 체크리스트
- [ ] `jwt-decode` 패키지가 설치되었는가?
- [ ] `isTokenExpired()`가 만료된 토큰을 올바르게 감지하는가?
- [ ] 401 응답 시 토큰 갱신 후 재시도가 동작하는가?
- [ ] 중복 리프레시 요청이 방지되는가?
- [ ] API 에러가 Toast로 표시되는가?
- [ ] 인증 만료 시 자동 로그아웃이 동작하는가?
- [ ] MSW 핸들러가 토큰을 검증하는가?

## 누락 정보
| 항목 | 설명 | 대안 |
|------|------|------|
| 테스트 수 | 변경 후 정확한 테스트 수 미기재 | 이전 커밋 기준 약 408개 이상 |
| Refresh Token 저장 위치 | httpOnly 쿠키 vs localStorage | 이 예제는 localStorage 사용 |
| 토큰 수명 설정 | MSW에서 발급하는 토큰의 정확한 만료 시간 | 코드에서 확인 필요 |

---

## 학습 포인트 요약

1. **JWT 구조**: Header.Payload.Signature, Base64 인코딩
2. **토큰 이중 전략**: 짧은 Access Token + 긴 Refresh Token
3. **자동 갱신**: 만료 전/401 응답 시 자동으로 토큰 갱신
4. **중복 방지**: Promise 캐싱으로 동시 리프레시 요청 방지
5. **에러 처리**: 글로벌 이벤트 시스템으로 일관된 에러 핸들링
