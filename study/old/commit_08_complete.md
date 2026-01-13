# Commit #8 — 인증/권한 관리 구현

## Meta
- **난이도**: ⭐⭐⭐⭐ 고급 (Advanced)
- **권장 커밋 메시지**: `feat(auth): implement authentication with protected routes and login/register`

## 학습 목표
1. JWT 기반 인증 시스템의 클라이언트 측 구현을 이해한다
2. Protected Route와 Public Route 패턴을 구현한다
3. AuthContext를 사용한 전역 인증 상태 관리를 학습한다
4. 로그인/회원가입 폼과 인증 API 연동을 구현한다

## TL;DR
인증 컨텍스트(AuthProvider), 보호 라우트(ProtectedRoute/PublicRoute), 로그인/회원가입 페이지를 구현한다. MSW에 인증 API 핸들러를 추가하고, localStorage에 토큰을 저장한다. 모든 테스트 통과.

## 배경/맥락
웹 애플리케이션에서 인증은 필수이며, 클라이언트 측에서 다음을 처리해야 한다:
- **토큰 저장**: localStorage/sessionStorage에 JWT 저장
- **Protected Route**: 인증된 사용자만 접근 가능한 페이지
- **Public Route**: 인증된 사용자는 접근 불가 (로그인 페이지 등)
- **인증 상태 전역 관리**: Context API로 앱 전체에서 인증 상태 접근

## 변경 파일 목록
### 추가된 파일 (15개+)
- `src/features/auth/types.ts` — 인증 타입 정의
- `src/features/auth/AuthContext.tsx` — 인증 컨텍스트
- `src/features/auth/useAuth.ts` — 인증 훅
- `src/features/auth/useAuthQuery.ts` — TanStack Query 인증 훅
- `src/features/auth/index.ts` — 배럴
- `src/pages/Login/Login.tsx` — 로그인 페이지
- `src/pages/Login/Login.module.css` — 로그인 스타일
- `src/pages/Register/Register.tsx` — 회원가입 페이지
- `src/components/ProtectedRoute/ProtectedRoute.tsx` — 보호 라우트
- `src/components/PublicRoute/PublicRoute.tsx` — 공개 라우트
- `src/mocks/handlers/auth.ts` — MSW 인증 핸들러
- `src/api/auth.ts` — 인증 API 함수

### 수정된 파일 (5개+)
- `src/router/index.tsx` — 인증 관련 라우트 추가
- `src/App.tsx` — AuthProvider 래핑
- `src/mocks/handlers/index.ts` — 인증 핸들러 추가
- `src/components/layout/Header/Header.tsx` — 로그인/로그아웃 버튼

## 코드 스니펫

### 1. 인증 타입 정의
```typescript
/* src/features/auth/types.ts:1-30 */
export interface User {
  id: string
  email: string
  name: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

**선정 이유**: 인증 시스템의 타입 기반 설계

**로직/흐름 설명**:
- `User`: 사용자 정보 (id, email, name)
- `AuthResponse`: 로그인/회원가입 API 응답
- `AuthState`: 전역 인증 상태

---

### 2. AuthContext 구현
```typescript
/* src/features/auth/AuthContext.tsx:1-120 */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { User, LoginCredentials, RegisterCredentials, AuthState } from './types'
import { authApi } from '../../api'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY)
    return saved ? JSON.parse(saved) : null
  })
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY)
  })
  
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!token && !!user

  // 초기 로드 시 토큰 검증
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await authApi.getMe()
        setUser(response.data)
      } catch {
        // 토큰 무효 시 로그아웃
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    validateToken()
  }, [token])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials)
    
    localStorage.setItem(TOKEN_KEY, response.data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user))
    
    setToken(response.data.token)
    setUser(response.data.user)
  }, [])

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const response = await authApi.register(credentials)
    
    localStorage.setItem(TOKEN_KEY, response.data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user))
    
    setToken(response.data.token)
    setUser(response.data.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isAuthenticated, isLoading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
```

**선정 이유**: Context API를 사용한 전역 인증 상태 관리의 완전한 구현

**로직/흐름 설명**:
- **초기 상태**: localStorage에서 토큰/사용자 복원
- **useEffect**: 페이지 로드 시 토큰 유효성 검증 (API 호출)
- **login/register**: API 호출 후 localStorage와 상태 업데이트
- **logout**: localStorage와 상태 초기화
- **useMemo**: 불필요한 리렌더링 방지

**런타임 영향**:
- 새로고침 시 localStorage에서 인증 상태 복원
- 토큰 만료 시 자동 로그아웃

**학습 포인트**:
- `useState` 초기화 함수: `() => localStorage.getItem(...)` 형태로 지연 초기화
- Q: 왜 user와 token을 둘 다 저장하는가?
- A: token은 API 요청용, user는 UI 표시용으로 분리

---

### 3. Protected Route 구현
```typescript
/* src/components/ProtectedRoute/ProtectedRoute.tsx:1-30 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>인증 확인 중...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    // 현재 위치를 state로 전달하여 로그인 후 돌아올 수 있게
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
```

**선정 이유**: React Router와 인증 상태를 연동한 라우트 보호 패턴

**로직/흐름 설명**:
- `isLoading`: 토큰 검증 중에는 로딩 표시
- `!isAuthenticated`: 미인증 시 로그인 페이지로 리다이렉트
- `state={{ from: location }}`: 로그인 후 원래 페이지로 복귀하기 위해 위치 저장

**학습 포인트**:
- `Navigate` 컴포넌트: 선언적 리다이렉트 (vs `useNavigate` 명령형)
- `replace`: 브라우저 히스토리에 남기지 않음

---

### 4. Public Route 구현
```typescript
/* src/components/PublicRoute/PublicRoute.tsx:1-25 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth'

interface PublicRouteProps {
  children: React.ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    )
  }

  if (isAuthenticated) {
    // 이전 위치가 있으면 그곳으로, 없으면 홈으로
    const from = (location.state as { from?: Location })?.from?.pathname || '/'
    return <Navigate to={from} replace />
  }

  return <>{children}</>
}
```

**선정 이유**: 인증된 사용자가 로그인 페이지에 접근하지 못하게 하는 패턴

**로직/흐름 설명**:
- 이미 인증된 사용자가 `/login`, `/register`에 접근하면 홈으로 리다이렉트
- `location.state.from`: 이전에 접근하려던 페이지로 복귀

---

### 5. MSW 인증 핸들러
```typescript
/* src/mocks/handlers/auth.ts:1-100 */
import { http, HttpResponse, delay } from 'msw'
import type { LoginCredentials, RegisterCredentials, User } from '../../features/auth/types'

const API_DELAY = 300

// 인메모리 사용자 저장소
const users: Map<string, { user: User; password: string }> = new Map([
  [
    'test@example.com',
    {
      user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
      password: 'password123',
    },
  ],
])

let nextUserId = 2

// 간단한 JWT 생성 (실제로는 서버에서 생성)
function generateToken(userId: string): string {
  return `mock-jwt-token-${userId}-${Date.now()}`
}

export const authHandlers = [
  // POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    await delay(API_DELAY)
    
    const { email, password } = (await request.json()) as LoginCredentials
    
    const userData = users.get(email)
    
    if (!userData || userData.password !== password) {
      return HttpResponse.json(
        { message: '이메일 또는 비밀번호가 올바르지 않습니다', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      )
    }
    
    const token = generateToken(userData.user.id)
    
    return HttpResponse.json({
      data: {
        user: userData.user,
        token,
      },
    })
  }),

  // POST /api/auth/register
  http.post('/api/auth/register', async ({ request }) => {
    await delay(API_DELAY)
    
    const { email, password, name } = (await request.json()) as RegisterCredentials
    
    if (users.has(email)) {
      return HttpResponse.json(
        { message: '이미 사용 중인 이메일입니다', code: 'EMAIL_EXISTS' },
        { status: 409 }
      )
    }
    
    const newUser: User = {
      id: `user-${nextUserId++}`,
      email,
      name,
    }
    
    users.set(email, { user: newUser, password })
    
    const token = generateToken(newUser.id)
    
    return HttpResponse.json({
      data: {
        user: newUser,
        token,
      },
    }, { status: 201 })
  }),

  // GET /api/auth/me - 현재 사용자 정보
  http.get('/api/auth/me', async ({ request }) => {
    await delay(API_DELAY)
    
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: '인증이 필요합니다', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    // 실제로는 토큰 검증 필요
    // 여기서는 간단히 첫 번째 사용자 반환
    const firstUser = Array.from(users.values())[0]
    
    return HttpResponse.json({ data: firstUser.user })
  }),

  // POST /api/auth/logout
  http.post('/api/auth/logout', async () => {
    await delay(API_DELAY)
    return HttpResponse.json({ data: { success: true } })
  }),
]
```

**선정 이유**: 인증 API의 전체 흐름을 보여주는 MSW 핸들러

**로직/흐름 설명**:
- `login`: 이메일/비밀번호 검증 후 토큰 발급
- `register`: 중복 이메일 체크 후 사용자 생성
- `me`: Authorization 헤더에서 토큰 추출 및 검증
- Map 자료구조: 이메일을 키로 사용자 저장

---

### 6. 로그인 페이지
```typescript
/* src/pages/Login/Login.tsx:1-100 */
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth'
import { Button, Input } from '../../components/ui'
import { useForm } from '../../hooks'
import styles from './Login.module.css'

interface LoginFormValues {
  email: string
  password: string
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = (location.state as { from?: Location })?.from?.pathname || '/'

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: (values) => {
      const errors: Partial<Record<keyof LoginFormValues, string>> = {}
      
      if (!values.email) {
        errors.email = '이메일을 입력해주세요'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = '올바른 이메일 형식이 아닙니다'
      }
      
      if (!values.password) {
        errors.password = '비밀번호를 입력해주세요'
      }
      
      return errors
    },
    onSubmit: async (values) => {
      setError(null)
      setIsSubmitting(true)
      
      try {
        await login(values)
        navigate(from, { replace: true })
      } catch (err) {
        setError((err as { message?: string }).message || '로그인에 실패했습니다')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>로그인</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <Input
              type="email"
              name="email"
              placeholder="이메일"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email ? errors.email : undefined}
            />
          </div>
          
          <div className={styles.field}>
            <Input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password ? errors.password : undefined}
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting} fullWidth>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </Button>
        </form>
        
        <p className={styles.link}>
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      </div>
    </div>
  )
}
```

**선정 이유**: useForm 훅과 인증 연동의 실제 사용 예시

**로직/흐름 설명**:
- `useForm`: 이전 커밋에서 만든 폼 훅 재사용
- `location.state.from`: 로그인 후 이전 페이지로 복귀
- 에러 상태 분리: 폼 검증 에러(errors) vs API 에러(error)

## 재현 단계 (CLI 우선)

### CLI 명령어
```bash
# 1. 개발 서버 실행
npm run dev

# 2. 테스트 실행
npm test -- --run

# 3. 빌드 확인
npm run build
```

### 구현 단계 (코드 작성 순서)
1. **인증 타입 정의**: `src/features/auth/types.ts`
2. **인증 API 함수**: `src/api/auth.ts`
3. **MSW 인증 핸들러**: `src/mocks/handlers/auth.ts`
4. **핸들러 배럴 업데이트**: `src/mocks/handlers/index.ts`
5. **AuthContext 구현**: `src/features/auth/AuthContext.tsx`
6. **useAuth 훅**: `src/features/auth/useAuth.ts`
7. **ProtectedRoute 구현**: `src/components/ProtectedRoute/`
8. **PublicRoute 구현**: `src/components/PublicRoute/`
9. **로그인 페이지**: `src/pages/Login/`
10. **회원가입 페이지**: `src/pages/Register/`
11. **라우터 업데이트**: Protected/Public Route 적용
12. **App.tsx 수정**: AuthProvider 래핑
13. **Header 업데이트**: 로그인/로그아웃 버튼

## 설명

### 설계 결정
1. **Context API vs Zustand**: 인증 상태는 Context API로 충분 (간단한 CRUD)
2. **localStorage**: 브라우저 종료 후에도 세션 유지
3. **토큰 검증**: 페이지 로드 시 `/api/auth/me` 호출로 토큰 유효성 확인

### 트레이드오프
- **localStorage vs sessionStorage**: localStorage는 브라우저 종료 후에도 유지
- **Context vs Redux/Zustand**: 인증처럼 단순한 상태는 Context로 충분

### 보안 고려사항
- XSS 공격 시 localStorage 토큰 탈취 가능 (httpOnly 쿠키가 더 안전)
- 실제 환경에서는 refresh token 패턴 권장

## 검증 체크리스트

### 자동 검증
```bash
npm run lint      # PASS
npm test -- --run # 모든 테스트 통과
npm run build     # 성공
```

### 수동 검증
- [ ] `/login` 페이지 접근 가능
- [ ] 잘못된 자격증명으로 로그인 시 에러 메시지 표시
- [ ] 올바른 자격증명으로 로그인 성공 (test@example.com / password123)
- [ ] 로그인 후 보호된 페이지 접근 가능
- [ ] 새로고침 후에도 로그인 상태 유지
- [ ] 로그아웃 후 보호된 페이지 접근 시 로그인 페이지로 리다이렉트
- [ ] 인증된 상태에서 `/login` 접근 시 홈으로 리다이렉트

## 누락 정보
- 없음
