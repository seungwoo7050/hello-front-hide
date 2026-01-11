# Stage 7: 인증/권한 관리

## 학습 목표

- React Context를 활용한 전역 인증 상태 관리
- JWT 토큰 기반 인증 플로우 구현
- Protected Route 패턴으로 라우트 보호
- 폼 유효성 검증과 에러 처리

## 구현 개요

### 1. 인증 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                         App                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   AuthProvider                       │   │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────────────┐    │   │
│  │  │  user   │  │ status  │  │  login/logout    │    │   │
│  │  │  state  │  │  state  │  │  register/clear  │    │   │
│  │  └────┬────┘  └────┬────┘  └────────┬─────────┘    │   │
│  │       │            │                │               │   │
│  │       └────────────┴────────────────┘               │   │
│  │                     │                               │   │
│  │        ┌────────────┴────────────┐                 │   │
│  │        ▼                         ▼                 │   │
│  │  ProtectedRoute             PublicRoute            │   │
│  │  (인증 필요)                (비인증만 접근)          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2. 인증 플로우

```
로그인:
1. 사용자 입력 → 폼 유효성 검증
2. login(credentials) 호출
3. API 요청 → 성공 시 토큰 저장
4. status: authenticated, user 설정
5. 목적지 페이지로 리다이렉트

로그아웃:
1. logout() 호출
2. 토큰 삭제 (localStorage)
3. status: unauthenticated, user: null
4. 로그인 페이지로 리다이렉트

앱 시작:
1. AuthProvider 초기화
2. 토큰 존재 확인
3. 있으면 → /auth/me API 호출 → 사용자 정보 복원
4. 없으면 → unauthenticated 상태
```

## 핵심 컴포넌트

### AuthContext (전역 상태)

```typescript
interface AuthContextValue {
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}
```

### Token Storage

```typescript
// localStorage 기반 토큰 관리
tokenStorage.setTokens(accessToken, refreshToken);
tokenStorage.getAccessToken();
tokenStorage.clearTokens();
tokenStorage.hasTokens();
```

### Protected Route

```tsx
<ProtectedRoute>
  <Notes />  {/* 인증된 사용자만 접근 */}
</ProtectedRoute>
```

### Public Route

```tsx
<PublicRoute redirectTo="/notes">
  <Login />  {/* 이미 로그인한 사용자는 /notes로 리다이렉트 */}
</PublicRoute>
```

## 인증 훅

```typescript
// 기본 훅 - 전체 컨텍스트 접근
const { user, status, login, logout } = useAuth();

// 편의 훅들
const user = useCurrentUser();        // 인증된 사용자만 (null이면 에러)
const status = useAuthStatus();       // 상태만
const isAuth = useIsAuthenticated();  // boolean
```

## MSW 인증 핸들러

```typescript
// POST /api/auth/login - 로그인
// POST /api/auth/register - 회원가입
// POST /api/auth/logout - 로그아웃
// GET /api/auth/me - 현재 사용자 정보
// POST /api/auth/refresh - 토큰 갱신

// 테스트 계정
email: 'test@example.com'
password: 'password123'
```

## 폼 유효성 검증

```typescript
function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};
  
  // 이메일 검증
  if (!data.email) {
    errors.email = '이메일을 입력해주세요.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.';
  }
  
  // 비밀번호 검증
  if (!data.password) {
    errors.password = '비밀번호를 입력해주세요.';
  } else if (data.password.length < 6) {
    errors.password = '비밀번호는 6자 이상이어야 합니다.';
  }
  
  return errors;
}
```

## API 클라이언트 업데이트

```typescript
// Authorization 헤더 자동 추가
const token = getAccessToken();
const response = await fetch(url, {
  headers: {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});
```

## 라우터 설정

```typescript
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: 'notes', element: <ProtectedRoute><Notes /></ProtectedRoute> },
      // ...
    ],
  },
  {
    path: '/login',
    element: <PublicRoute><Login /></PublicRoute>,
  },
  {
    path: '/register',
    element: <PublicRoute><Register /></PublicRoute>,
  },
]);
```

## 학습 포인트

### 1. Context 분리 패턴

- Provider와 Hook을 별도 파일로 분리하여 Fast Refresh 호환
- 관심사 분리: AuthContext.tsx (Provider), useAuth.ts (Hooks)

### 2. 인증 상태 머신

```
idle → loading → authenticated
                ↓
            unauthenticated
```

### 3. 낙관적 UI 패턴

- 로그인 성공 시 즉시 리다이렉트
- 에러 발생 시 롤백 (상태 복원)

### 4. 폼 검증 패턴

- 블러(onBlur) 시 필드별 검증
- 제출(submit) 시 전체 검증
- 실시간 검증 (touched 필드만)

## 테스트 전략

1. **단위 테스트**: tokenStorage 함수
2. **통합 테스트**: AuthContext + MSW
3. **컴포넌트 테스트**: Login, Register 페이지
4. **라우트 테스트**: ProtectedRoute 리다이렉트

## 파일 구조

```
src/
├── features/auth/
│   ├── index.ts           # barrel export
│   ├── types.ts           # 타입 정의
│   ├── api.ts             # 인증 API
│   ├── tokenStorage.ts    # 토큰 저장소
│   ├── AuthContext.tsx    # Provider
│   ├── useAuth.ts         # Hooks
│   └── *.test.tsx         # 테스트
├── components/
│   ├── ProtectedRoute/
│   └── PublicRoute/
├── pages/
│   ├── Login/
│   └── Register/
└── mocks/handlers/
    └── auth.ts            # MSW 핸들러
```

## 다음 단계 (Stage 8)

- 전역 상태 관리 (Zustand 또는 Context)
- 테마 관리 (다크 모드)
- 사용자 설정 영속화
