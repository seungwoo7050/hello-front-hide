# Stage 10: 프로덕션 준비

## 학습 목표

이 스테이지에서는 프로덕션 배포를 위한 최종 준비를 배웁니다:

- **에러 바운더리**: 렌더링 에러를 잡아 폴백 UI 표시
- **프로젝트 구조 정리**: 일관된 코드 구조 유지
- **테스트 커버리지**: 408개 이상의 테스트로 안정성 확보

## 주요 개념

### 1. ErrorBoundary 컴포넌트

```typescript
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRetry?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태 업데이트
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 에러 로깅 서비스에 에러 리포트
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorUI error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### 2. ErrorBoundary 사용법

```tsx
// 앱 최상위 레벨에서 전역 에러 처리
function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

// 특정 컴포넌트에 커스텀 폴백 제공
<ErrorBoundary 
  fallback={<div>이 섹션을 불러올 수 없습니다.</div>}
  onError={(error) => logErrorToService(error)}
>
  <DangerousComponent />
</ErrorBoundary>

// 재시도 버튼 숨기기
<ErrorBoundary showRetry={false}>
  <ChildComponent />
</ErrorBoundary>
```

## 파일 구조

```
src/
├── components/
│   └── ErrorBoundary/
│       ├── ErrorBoundary.tsx         # 에러 바운더리 컴포넌트
│       ├── ErrorBoundary.module.css  # 스타일
│       ├── ErrorBoundary.test.tsx    # 테스트
│       └── index.ts                  # 배럴 export
└── App.tsx                           # ErrorBoundary 적용
```

## 프로젝트 최종 구조

```
hello-front-opus/
├── docs/                      # 스테이지별 학습 문서
│   ├── stage-0-setup.md
│   ├── stage-1-basic-components.md
│   ├── stage-2-components.md
│   ├── stage-3-layout.md
│   ├── stage-4-routing-features.md
│   ├── stage-5-advanced-components.md
│   ├── stage-6-api-integration.md
│   ├── stage-7-authentication.md
│   ├── stage-8-global-state.md
│   ├── stage-9-performance.md
│   └── stage-10-production.md
├── src/
│   ├── api/                   # API 클라이언트
│   ├── components/
│   │   ├── ErrorBoundary/     # 에러 경계
│   │   ├── ProtectedRoute/    # 인증 라우트
│   │   ├── PublicRoute/       # 공개 라우트
│   │   ├── layout/            # 레이아웃 컴포넌트
│   │   └── ui/                # UI 컴포넌트 라이브러리
│   ├── features/
│   │   ├── auth/              # 인증 기능
│   │   └── notes/             # 노트 기능
│   ├── hooks/                 # 커스텀 훅
│   ├── mocks/                 # MSW 모킹
│   ├── pages/                 # 페이지 컴포넌트
│   ├── providers/             # Context 프로바이더
│   ├── router/                # 라우터 설정
│   ├── stores/                # Zustand 스토어
│   ├── styles/                # 전역 스타일
│   ├── test/                  # 테스트 설정
│   └── types/                 # 타입 정의
├── eslint.config.js
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 테스트 요약

| 스테이지 | 테스트 수 | 주요 테스트 대상 |
|----------|-----------|------------------|
| Stage 1-5 | ~200 | 기본 컴포넌트, 레이아웃, 폼 |
| Stage 6 | ~339 | API 클라이언트, MSW, TanStack Query |
| Stage 7 | ~370 | 인증, 토큰 관리, 라우트 보호 |
| Stage 8 | ~387 | Zustand 스토어, 테마 |
| Stage 9 | ~402 | 성능 훅 (debounce, throttle) |
| Stage 10 | ~408 | ErrorBoundary |

## 학습 완료 체크리스트

### React 핵심
- [x] JSX와 컴포넌트
- [x] Props와 상태 관리
- [x] 이벤트 핸들링
- [x] 조건부 렌더링
- [x] 리스트와 키
- [x] 폼 처리

### TypeScript
- [x] 타입 정의 및 인터페이스
- [x] 제네릭
- [x] 유니온 타입과 타입 가드
- [x] 컴포넌트 Props 타이핑

### 스타일링
- [x] CSS Modules
- [x] CSS 변수 (디자인 토큰)
- [x] 반응형 디자인
- [x] 다크 모드

### 라우팅
- [x] React Router 설정
- [x] 중첩 라우팅
- [x] 프로그래매틱 네비게이션
- [x] 라우트 보호

### 상태 관리
- [x] useState, useReducer
- [x] Context API
- [x] Zustand (전역 상태)
- [x] TanStack Query (서버 상태)

### 성능 최적화
- [x] 코드 스플리팅 (React.lazy)
- [x] 메모이제이션 (memo, useMemo, useCallback)
- [x] Debounce/Throttle

### 테스팅
- [x] Vitest 설정
- [x] React Testing Library
- [x] MSW로 API 모킹
- [x] 단위/통합 테스트

### 프로덕션
- [x] 에러 바운더리
- [x] 빌드 최적화
- [x] 타입 안전성

## 배포 준비

### 빌드 명령
```bash
npm run build
```

### 빌드 결과물
- `dist/` 폴더에 정적 파일 생성
- 코드 스플리팅으로 청크 분리
- CSS와 JS 최소화

### 환경별 설정
```bash
# 개발
npm run dev

# 테스트
npm run test

# 프로덕션 빌드
npm run build

# 프로덕션 미리보기
npm run preview
```

## 다음 단계 (학습 확장)

이 학습을 완료한 후 다음 주제를 탐구해보세요:

1. **서버 사이드 렌더링 (SSR)**: Next.js
2. **E2E 테스팅**: Playwright, Cypress
3. **CI/CD 파이프라인**: GitHub Actions
4. **모니터링**: Sentry, LogRocket
5. **애니메이션**: Framer Motion
6. **국제화 (i18n)**: react-i18next

---

🎉 **축하합니다!** React + TypeScript 학습 여정을 완료했습니다.
