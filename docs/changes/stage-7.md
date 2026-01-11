# Stage 7 변경 사항

## 신규 파일

### 인증 Feature (`src/features/auth/`)
- `types.ts` - 인증 관련 타입 정의 (User, AuthTokens, AuthResponse, LoginRequest, RegisterRequest, AuthStatus, AuthState, AuthActions, AuthContextValue)
- `api.ts` - 인증 API 함수 (login, register, logout, getCurrentUser, refreshToken)
- `tokenStorage.ts` - localStorage 기반 토큰 관리
- `AuthContext.tsx` - 인증 Provider 컴포넌트
- `useAuth.ts` - 인증 관련 훅 (useAuth, useCurrentUser, useAuthStatus, useIsAuthenticated)
- `index.ts` - barrel export
- `tokenStorage.test.ts` - 토큰 저장소 테스트 (8개)
- `AuthContext.test.tsx` - 인증 컨텍스트 테스트 (6개)

### 라우트 보호 컴포넌트 (`src/components/`)
- `ProtectedRoute/ProtectedRoute.tsx` - 인증 필요 라우트 보호
- `ProtectedRoute/index.ts` - barrel export
- `ProtectedRoute/ProtectedRoute.test.tsx` - 테스트 (3개)
- `PublicRoute/PublicRoute.tsx` - 공개 라우트 (인증 시 리다이렉트)
- `PublicRoute/index.ts` - barrel export

### 인증 페이지 (`src/pages/`)
- `Login/Login.tsx` - 로그인 페이지
- `Login/Login.module.css` - 로그인 스타일
- `Login/index.ts` - barrel export
- `Login/Login.test.tsx` - 로그인 테스트 (7개)
- `Register/Register.tsx` - 회원가입 페이지
- `Register/Register.module.css` - 회원가입 스타일
- `Register/Register.test.tsx` - 회원가입 테스트 (7개)

### MSW 핸들러
- `src/mocks/handlers/auth.ts` - 인증 API 핸들러 (login, register, logout, me, refresh)

## 수정된 파일

### API 클라이언트
- `src/api/client.ts` - Authorization 헤더 자동 추가, 반환 타입 수정 (ApiResponse<T> → T)
- `src/api/notes.ts` - 반환 타입 수정

### MSW 핸들러
- `src/mocks/handlers/index.ts` - authHandlers 추가
- `src/mocks/handlers/notes.ts` - 응답 형식 변경 (data 래퍼 제거)

### React Query 훅
- `src/features/notes/useNotesQuery.ts` - API 응답 처리 방식 수정
- `src/features/notes/useNotesQuery.test.tsx` - 타입 지정 추가

### 앱 구조
- `src/App.tsx` - AuthProvider 추가
- `src/router/index.tsx` - 인증 라우트 추가, ProtectedRoute/PublicRoute 적용

## 테스트 현황

- 신규 테스트: 31개
  - tokenStorage: 8개
  - AuthContext: 6개
  - ProtectedRoute: 3개
  - Login: 7개
  - Register: 7개
- 전체 테스트: 370개 (이전 339개 + 31개)
- 모든 테스트 통과

## 빌드 결과

- 번들 크기: 381.47 kB (gzip: 119.71 kB)
- CSS: 51.91 kB (gzip: 8.77 kB)

## 주요 학습 포인트

1. **Context + Hook 분리**: Fast Refresh 호환을 위해 Provider와 Hook을 별도 파일로 분리
2. **인증 상태 머신**: idle → loading → authenticated/unauthenticated
3. **토큰 기반 인증**: localStorage에 JWT 저장, API 요청 시 자동 첨부
4. **라우트 보호**: ProtectedRoute (인증 필요), PublicRoute (비인증 전용)
5. **폼 유효성 검증**: 실시간 검증, 블러 검증, 제출 검증 조합
