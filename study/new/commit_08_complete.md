# Commit #8 — 인증/인가 구현 (Authentication & Authorization)

## Meta

- **난이도**: ⭐⭐⭐⭐ 중상급 (Upper Intermediate)
- **권장 커밋 메시지**: `feat: add authentication with login, register, and protected routes`

---

## 학습 목표

1. JWT 기반 인증 흐름을 이해하고 구현할 수 있다
2. React Context로 전역 인증 상태를 관리할 수 있다
3. Protected/Public Route로 페이지 접근을 제어할 수 있다
4. 토큰 저장 및 관리 전략을 수립할 수 있다

---

## TL;DR

AuthContext로 전역 인증 상태를 관리하고, tokenStorage 유틸리티로 accessToken/refreshToken을 localStorage에 저장한다. Login/Register 페이지를 구현하고, ProtectedRoute/PublicRoute 컴포넌트로 라우트 가드를 설정한다. MSW로 인증 API를 모킹한다.

---

## 배경/컨텍스트

### 왜 이 변경이 필요한가?

- **사용자 식별**: 인증으로 사용자별 데이터 분리
- **보안**: 민감한 페이지 접근 제어
- **UX**: 로그인 상태 유지, 자동 리다이렉트
- **확장성**: 역할 기반 권한 관리 기반 마련

### 영향 범위

- 새로운 페이지: Login, Register
- 인증 컴포넌트: ProtectedRoute, PublicRoute
- Context: AuthContext, AuthProvider
- 토큰 관리: tokenStorage
- MSW 핸들러 확장
- 테스트 수 339개 → 370개로 증가 (+31)

---

## 변경 파일 목록

### 추가된 파일 (18개)

| 카테고리 | 파일 | 설명 |
|----------|------|------|
| Context | `src/features/auth/AuthContext.tsx` | 인증 Context |
| Context | `src/features/auth/AuthProvider.tsx` | Auth Provider |
| Storage | `src/features/auth/tokenStorage.ts` | 토큰 저장소 |
| Hook | `src/features/auth/useAuth.ts` | 인증 훅 |
| Hook | `src/features/auth/useAuth.test.tsx` | 훅 테스트 |
| Page | `src/pages/Login/Login.tsx` | 로그인 페이지 |
| Page | `src/pages/Login/Login.test.tsx` | 페이지 테스트 |
| Page | `src/pages/Register/Register.tsx` | 회원가입 페이지 |
| Page | `src/pages/Register/Register.test.tsx` | 페이지 테스트 |
| Guard | `src/components/ProtectedRoute/` | 인증 필수 라우트 |
| Guard | `src/components/PublicRoute/` | 비인증 전용 라우트 |
| API | `src/api/auth.ts` | 인증 API 함수 |
| MSW | `src/mocks/handlers/auth.ts` | 인증 핸들러 |

### 수정된 파일 (5개)

| 파일 | 변경 내용 |
|------|------|
| `src/router/index.tsx` | Protected/Public 라우트 적용 |
| `src/App.tsx` | AuthProvider 래핑 |
| `src/components/layout/AppLayout.tsx` | 로그아웃 버튼 추가 |
| `src/mocks/handlers/index.ts` | authHandlers 추가 |

---

## 코드 스니펫

### 1. tokenStorage.ts — 토큰 관리

```typescript
/* src/features/auth/tokenStorage.ts */
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  },

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  hasTokens(): boolean {
    return !!this.getAccessToken();
  },
};
```

---

### 2. AuthContext — 전역 인증 상태

```typescript
/* src/features/auth/AuthContext.tsx */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { tokenStorage } from './tokenStorage';
import { authApi } from '../../api/auth';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // 초기 로드 시 토큰 확인
  useEffect(() => {
    const initAuth = async () => {
      if (tokenStorage.hasTokens()) {
        try {
          const user = await authApi.getMe();
          setState({ user, isAuthenticated: true, isLoading: false });
        } catch {
          tokenStorage.clearTokens();
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user, accessToken, refreshToken } = await authApi.login(email, password);
    tokenStorage.setTokens(accessToken, refreshToken);
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { user, accessToken, refreshToken } = await authApi.register(name, email, password);
    tokenStorage.setTokens(accessToken, refreshToken);
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clearTokens();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

### 3. ProtectedRoute — 인증 필수 라우트 가드

```typescript
/* src/components/ProtectedRoute/ProtectedRoute.tsx */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { Spinner } from '../ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="protected-route-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // 로그인 후 원래 페이지로 돌아오기 위해 현재 위치 저장
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

---

### 4. PublicRoute — 비인증 전용 (로그인 시 리다이렉트)

```typescript
/* src/components/PublicRoute/PublicRoute.tsx */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { Spinner } from '../ui';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ 
  children, 
  redirectTo = '/' 
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="public-route-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    // 로그인 전 가려던 페이지가 있으면 그곳으로
    const from = (location.state as { from?: Location })?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
```

---

### 5. Login 페이지

```typescript
/* src/pages/Login/Login.tsx */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { useForm } from '../../hooks/useForm';
import { Button, Input, Card } from '../../components/ui';
import styles from './Login.module.css';

interface LoginFormValues {
  email: string;
  password: string;
}

export function Login() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { values, errors, handleChange, handleSubmit, touched } = useForm<LoginFormValues>({
    initialValues: { email: '', password: '' },
    validators: {
      email: (v) => (!v ? '이메일을 입력하세요' : !/\S+@\S+\.\S+/.test(v) ? '유효한 이메일 형식이 아닙니다' : ''),
      password: (v) => (!v ? '비밀번호를 입력하세요' : ''),
    },
    onSubmit: async (vals) => {
      setIsSubmitting(true);
      setError(null);
      try {
        await login(vals.email, vals.password);
      } catch (e) {
        setError(e instanceof Error ? e.message : '로그인에 실패했습니다');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <h1 className={styles.title}>로그인</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <Input
            label="이메일"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            error={touched.email ? errors.email : ''}
            placeholder="email@example.com"
          />
          
          <Input
            label="비밀번호"
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            error={touched.password ? errors.password : ''}
            placeholder="비밀번호"
          />
          
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            로그인
          </Button>
        </form>
        
        <p className={styles.footer}>
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      </Card>
    </div>
  );
}
```

---

### 6. MSW 인증 핸들러

```typescript
/* src/mocks/handlers/auth.ts */
import { http, HttpResponse, delay } from 'msw';

const users = new Map<string, { id: string; email: string; name: string; password: string }>();

export const authHandlers = [
  // 로그인
  http.post('/api/auth/login', async ({ request }) => {
    await delay(300);
    const { email, password } = await request.json() as { email: string; password: string };

    const user = Array.from(users.values()).find(u => u.email === email);
    
    if (!user || user.password !== password) {
      return HttpResponse.json(
        { message: '이메일 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken: `access_${user.id}_${Date.now()}`,
      refreshToken: `refresh_${user.id}_${Date.now()}`,
    });
  }),

  // 회원가입
  http.post('/api/auth/register', async ({ request }) => {
    await delay(300);
    const { name, email, password } = await request.json() as { name: string; email: string; password: string };

    if (Array.from(users.values()).some(u => u.email === email)) {
      return HttpResponse.json(
        { message: '이미 등록된 이메일입니다' },
        { status: 400 }
      );
    }

    const newUser = { id: `user_${Date.now()}`, email, name, password };
    users.set(newUser.id, newUser);

    return HttpResponse.json({
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      accessToken: `access_${newUser.id}_${Date.now()}`,
      refreshToken: `refresh_${newUser.id}_${Date.now()}`,
    }, { status: 201 });
  }),

  // 현재 사용자 정보
  http.get('/api/auth/me', async ({ request }) => {
    await delay(100);
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 토큰에서 userId 추출 (간단한 구현)
    const token = authHeader.replace('Bearer ', '');
    const userId = token.split('_')[1];
    const user = users.get(userId);

    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 401 });
    }

    return HttpResponse.json({ id: user.id, email: user.email, name: user.name });
  }),
];
```

---

## 재현 단계 (CLI 우선)

### 1. 디렉토리 구조

```bash
mkdir -p src/features/auth
mkdir -p src/pages/Login
mkdir -p src/pages/Register
mkdir -p src/components/ProtectedRoute
mkdir -p src/components/PublicRoute
```

### 2. 구현 단계

1. **src/features/auth/tokenStorage.ts**: 토큰 저장 유틸리티
2. **src/features/auth/AuthContext.tsx**: Context + Provider
3. **src/features/auth/useAuth.ts**: 편의 훅 (re-export)
4. **src/api/auth.ts**: 인증 API 함수
5. **src/mocks/handlers/auth.ts**: MSW 핸들러
6. **src/components/ProtectedRoute/**: 가드 컴포넌트
7. **src/components/PublicRoute/**: 가드 컴포넌트
8. **src/pages/Login/**: 로그인 페이지
9. **src/pages/Register/**: 회원가입 페이지
10. **src/router/index.tsx**: 라우트에 가드 적용
11. **src/App.tsx**: AuthProvider로 앱 래핑

### 3. 라우터 설정

```typescript
// src/router/index.tsx
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Public routes (비로그인 전용)
      {
        path: '/login',
        element: <PublicRoute><Login /></PublicRoute>,
      },
      {
        path: '/register',
        element: <PublicRoute><Register /></PublicRoute>,
      },
      // Protected routes (로그인 필수)
      {
        path: '/notes',
        element: <ProtectedRoute><Notes /></ProtectedRoute>,
      },
      // 공개 페이지
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
    ],
  },
]);
```

---

## 검증 체크리스트

- [ ] `npm test -- --run` 실행 시 370개 테스트 통과
- [ ] 비로그인 상태에서 `/notes` 접근 시 `/login`으로 리다이렉트
- [ ] 로그인 상태에서 `/login` 접근 시 홈으로 리다이렉트
- [ ] 로그인 후 새로고침해도 상태 유지 (토큰 확인)
- [ ] 로그아웃 시 토큰 삭제 및 리다이렉트
- [ ] 잘못된 로그인 정보 시 에러 메시지 표시

---

## 누락 정보

- ✅ 커밋 해시: `ec712ee740fbbdd07d22b26caa8c5b0fcde19be5`
- ✅ 테스트 결과: 370개 통과 (+31)

**핵심 학습 포인트**:
- JWT 토큰 저장: localStorage (or sessionStorage, httpOnly cookie)
- 초기 로딩: `isLoading` 상태로 깜빡임 방지
- location.state로 "로그인 후 원래 페이지로" 구현
- Context + Custom Hook 패턴으로 전역 상태 캡슐화
