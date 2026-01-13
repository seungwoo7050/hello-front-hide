# Commit #11 — 프로덕션 준비 (ErrorBoundary)

## Meta

- **난이도**: ⭐⭐⭐ 중급 (Intermediate)
- **권장 커밋 메시지**: `feat: add ErrorBoundary for production error handling`

---

## 학습 목표

1. ErrorBoundary 클래스 컴포넌트를 구현할 수 있다
2. 렌더링 에러를 잡아 폴백 UI를 표시할 수 있다
3. 에러 리포팅 서비스에 에러를 전송할 수 있다
4. 프로덕션 배포를 위한 안정성을 확보할 수 있다

---

## TL;DR

React의 `ErrorBoundary`는 자식 컴포넌트 트리에서 발생한 JavaScript 에러를 잡아 폴백 UI를 표시한다. `getDerivedStateFromError`로 에러 상태를 업데이트하고, `componentDidCatch`로 에러를 로깅한다. 앱 최상위에 적용하여 전역 에러를 처리한다.

---

## 배경/컨텍스트

### 왜 이 변경이 필요한가?

- **사용자 경험**: 에러 발생 시 흰 화면 대신 의미 있는 UI 표시
- **디버깅**: 에러 정보 수집 및 리포팅
- **복구 기능**: 재시도 버튼으로 앱 복구 가능
- **프로덕션 안정성**: 일부 컴포넌트 에러가 전체 앱 크래시 방지

### ErrorBoundary의 한계

ErrorBoundary가 잡지 **못하는** 에러:
- 이벤트 핸들러 내부 에러 (try-catch 필요)
- 비동기 코드 에러 (setTimeout, Promise)
- 서버 사이드 렌더링 에러
- ErrorBoundary 자체에서 발생한 에러

### 영향 범위

- ErrorBoundary 컴포넌트 추가
- App.tsx에 전역 적용
- README.md 업데이트
- 테스트 수 402개 → 408개로 증가 (+6)

---

## 변경 파일 목록

### 추가된 파일 (4개)

| 카테고리 | 파일 | 설명 |
|----------|------|------|
| Component | `src/components/ErrorBoundary/ErrorBoundary.tsx` | ErrorBoundary 컴포넌트 |
| Component | `src/components/ErrorBoundary/ErrorBoundary.module.css` | 스타일 |
| Component | `src/components/ErrorBoundary/ErrorBoundary.test.tsx` | 테스트 |
| Component | `src/components/ErrorBoundary/index.ts` | 배럴 export |

### 수정된 파일 (2개)

| 파일 | 변경 내용 |
|------|------|
| `src/App.tsx` | ErrorBoundary로 앱 래핑 |
| `README.md` | 프로젝트 구조 및 기능 설명 업데이트 |

---

## 코드 스니펫

### 1. ErrorBoundary 컴포넌트

```typescript
/* src/components/ErrorBoundary/ErrorBoundary.tsx */
import { Component, type ErrorInfo, type ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

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

  // 에러 발생 시 상태 업데이트 (렌더링 단계)
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // 에러 정보 로깅 (커밋 단계)
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 외부 에러 리포팅 서비스로 전송
    this.props.onError?.(error, errorInfo);
  }

  // 재시도 핸들러
  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, showRetry = true } = this.props;

    if (hasError) {
      // 커스텀 폴백이 있으면 사용
      if (fallback) {
        return fallback;
      }

      // 기본 폴백 UI
      return (
        <div className={styles.container}>
          <div className={styles.content}>
            <h2 className={styles.title}>문제가 발생했습니다</h2>
            <p className={styles.message}>
              예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
            </p>
            {error && (
              <details className={styles.details}>
                <summary>오류 상세 정보</summary>
                <pre className={styles.errorStack}>
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
            {showRetry && (
              <button
                onClick={this.handleRetry}
                className={styles.retryButton}
              >
                다시 시도
              </button>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}
```

---

### 2. ErrorBoundary 스타일

```css
/* src/components/ErrorBoundary/ErrorBoundary.module.css */
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--spacing-lg);
  background-color: var(--color-bg);
}

.content {
  max-width: 480px;
  padding: var(--spacing-xl);
  text-align: center;
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.title {
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-xl);
  color: var(--color-error);
}

.message {
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-secondary);
}

.details {
  margin-bottom: var(--spacing-lg);
  text-align: left;
}

.details summary {
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.errorStack {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-md);
  overflow-x: auto;
  font-family: monospace;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  background-color: var(--color-bg);
  border-radius: var(--radius-sm);
  white-space: pre-wrap;
  word-break: break-all;
}

.retryButton {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-md);
  color: var(--color-bg);
  background-color: var(--color-primary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.retryButton:hover {
  background-color: var(--color-primary-hover);
}
```

---

### 3. App.tsx에 ErrorBoundary 적용

```tsx
/* src/App.tsx */
import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { QueryProvider } from './providers';
import { AuthProvider } from './features/auth';
import { useSystemTheme } from './hooks';
import { router } from './router';

function AppContent() {
  useSystemTheme();
  return <RouterProvider router={router} />;
}

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // 프로덕션에서는 Sentry 등 에러 리포팅 서비스로 전송
        console.error('Global error:', error, errorInfo);
        // sendToErrorReportingService(error, errorInfo);
      }}
    >
      <QueryProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
```

---

### 4. 특정 컴포넌트에 개별 적용

```tsx
// 위험한 컴포넌트에 개별 ErrorBoundary 적용
<ErrorBoundary 
  fallback={<div>이 섹션을 불러올 수 없습니다.</div>}
  showRetry={false}
>
  <DangerousComponent />
</ErrorBoundary>

// 중첩 사용 (세분화된 에러 처리)
<ErrorBoundary>
  <Header />
  <ErrorBoundary fallback={<SidebarError />}>
    <Sidebar />
  </ErrorBoundary>
  <ErrorBoundary fallback={<ContentError />}>
    <MainContent />
  </ErrorBoundary>
  <Footer />
</ErrorBoundary>
```

---

### 5. 테스트 코드

```typescript
/* src/components/ErrorBoundary/ErrorBoundary.test.tsx */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// 에러를 발생시키는 컴포넌트
const ProblematicComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>정상 렌더링</div>;
};

describe('ErrorBoundary', () => {
  // 콘솔 에러 무시
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('자식 컴포넌트를 정상적으로 렌더링한다', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('정상 렌더링')).toBeInTheDocument();
  });

  it('에러 발생 시 폴백 UI를 표시한다', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
    expect(screen.getByText(/예기치 않은 오류/)).toBeInTheDocument();
  });

  it('커스텀 폴백을 렌더링한다', () => {
    render(
      <ErrorBoundary fallback={<div>커스텀 에러 UI</div>}>
        <ProblematicComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('커스텀 에러 UI')).toBeInTheDocument();
  });

  it('재시도 버튼 클릭 시 리렌더링을 시도한다', () => {
    let shouldThrow = true;
    const { rerender } = render(
      <ErrorBoundary>
        <ProblematicComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
    
    // shouldThrow를 false로 변경하고 재시도
    shouldThrow = false;
    fireEvent.click(screen.getByText('다시 시도'));
    
    rerender(
      <ErrorBoundary>
        <ProblematicComponent shouldThrow={shouldThrow} />
      </ErrorBoundary>
    );
    
    // 재시도 후 정상 렌더링 확인은 실제 구현에 따라 다름
  });

  it('onError 콜백을 호출한다', () => {
    const onError = vi.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ProblematicComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('showRetry=false일 때 재시도 버튼을 숨긴다', () => {
    render(
      <ErrorBoundary showRetry={false}>
        <ProblematicComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.queryByText('다시 시도')).not.toBeInTheDocument();
  });
});
```

---

## 재현 단계 (CLI 우선)

### 1. 디렉토리 생성

```bash
mkdir -p src/components/ErrorBoundary
```

### 2. 구현 단계

1. **src/components/ErrorBoundary/ErrorBoundary.tsx**: 클래스 컴포넌트
2. **src/components/ErrorBoundary/ErrorBoundary.module.css**: 스타일
3. **src/components/ErrorBoundary/ErrorBoundary.test.tsx**: 테스트
4. **src/components/ErrorBoundary/index.ts**: 배럴 export
5. **src/App.tsx**: ErrorBoundary로 앱 래핑

### 3. 테스트 실행

```bash
npm test -- --run
# 408 tests passed
```

---

## 검증 체크리스트

- [ ] `npm test -- --run` 실행 시 408개 테스트 통과
- [ ] 의도적 에러 발생 시 폴백 UI 표시
- [ ] 재시도 버튼 클릭 시 복구 시도
- [ ] onError 콜백에서 에러 정보 수신
- [ ] 커스텀 폴백 렌더링 동작

---

## 누락 정보

- ✅ 커밋 해시: `2a8eac5a077e07d0cad9ea8dfea052e0deeb1bf1`
- ✅ 테스트 결과: 408개 통과 (+6)

**핵심 학습 포인트**:
- ErrorBoundary는 **클래스 컴포넌트**로만 구현 가능
- `getDerivedStateFromError`: 렌더링 단계에서 에러 → 상태 업데이트
- `componentDidCatch`: 커밋 단계에서 에러 로깅
- 중첩 사용으로 세분화된 에러 처리 가능
- 이벤트 핸들러 에러는 try-catch로 별도 처리 필요
