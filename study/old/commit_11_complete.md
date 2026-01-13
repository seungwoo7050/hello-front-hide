# Commit #11 — 프로덕션 준비

## Meta
- **난이도**: ⭐⭐⭐ 중급 (Intermediate)
- **권장 커밋 메시지**: `chore(config): production-ready configuration and optimizations`

## 학습 목표
1. Vite의 프로덕션 빌드 최적화 설정을 이해한다
2. 환경 변수(.env)를 사용한 환경별 설정을 학습한다
3. 에러 경계(Error Boundary)로 런타임 에러를 처리한다
4. 프로덕션 빌드 분석 및 최적화 기법을 익힌다

## TL;DR
프로덕션 배포를 위한 설정을 추가한다: 환경 변수 분리, Error Boundary, 빌드 최적화 설정. Vite 빌드 설정 조정으로 번들 크기 최적화.

## 배경/맥락
프로덕션 배포 전 필수 작업:
- **환경 변수**: 개발/스테이징/프로덕션 설정 분리
- **Error Boundary**: 런타임 에러 시 앱 전체 크래시 방지
- **빌드 최적화**: 코드 스플리팅, 트리 쉐이킹, 압축
- **소스맵**: 디버깅용 (프로덕션에서는 선택적)

## 변경 파일 목록
### 추가된 파일 (6개)
- `.env.example` — 환경 변수 예시
- `.env.development` — 개발 환경 변수
- `.env.production` — 프로덕션 환경 변수
- `src/components/ErrorBoundary/ErrorBoundary.tsx` — 에러 경계
- `src/components/ErrorBoundary/ErrorBoundary.module.css` — 스타일
- `src/components/ErrorBoundary/index.ts` — 배럴

### 수정된 파일 (3개)
- `vite.config.ts` — 빌드 최적화 설정
- `src/App.tsx` — ErrorBoundary 래핑
- `.gitignore` — .env 파일 제외

## 코드 스니펫

### 1. 환경 변수 설정
```bash
# .env.example
# API 설정
VITE_API_BASE_URL=/api
VITE_API_TIMEOUT=30000

# 기능 플래그
VITE_ENABLE_MSW=true
VITE_ENABLE_DEVTOOLS=true

# 분석
VITE_GA_ID=

# .env.development
VITE_API_BASE_URL=/api
VITE_ENABLE_MSW=true
VITE_ENABLE_DEVTOOLS=true

# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_MSW=false
VITE_ENABLE_DEVTOOLS=false
```

**선정 이유**: Vite의 환경 변수 패턴

**로직/흐름 설명**:
- `VITE_` 접두사: Vite가 클라이언트에 노출할 변수
- `.env.development`: `npm run dev` 시 로드
- `.env.production`: `npm run build` 시 로드
- `.env.example`: 필요한 변수 문서화 (커밋됨)

**학습 포인트**:
- Q: 왜 VITE_ 접두사가 필요한가?
- A: 보안상 모든 환경 변수가 클라이언트에 노출되면 안 됨
- `import.meta.env.VITE_API_BASE_URL`로 접근

---

### 2. Error Boundary
```typescript
/* src/components/ErrorBoundary/ErrorBoundary.tsx:1-80 */
import { Component, type ReactNode, type ErrorInfo } from 'react'
import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 다음 렌더링에서 fallback UI를 보여주도록 상태 업데이트
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 에러 로깅 서비스에 전송
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({ errorInfo })
    
    // TODO: 프로덕션에서는 Sentry 등으로 전송
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(error, { extra: { errorInfo } })
    // }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={styles.container}>
          <div className={styles.content}>
            <h1 className={styles.title}>문제가 발생했습니다</h1>
            <p className={styles.message}>
              예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <details className={styles.details}>
                <summary>오류 상세 정보</summary>
                <pre className={styles.stack}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className={styles.actions}>
              <button onClick={this.handleReset} className={styles.button}>
                다시 시도
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className={styles.buttonSecondary}
              >
                페이지 새로고침
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

**선정 이유**: React의 Error Boundary 패턴 (클래스 컴포넌트 필수)

**로직/흐름 설명**:
- `getDerivedStateFromError`: 에러 발생 시 상태 업데이트 (static)
- `componentDidCatch`: 에러 로깅 (인스턴스 메서드)
- `import.meta.env.DEV`: 개발 환경에서만 상세 에러 표시
- `handleReset`: 에러 상태 초기화 (재시도)

**런타임 영향**:
- 자식 컴포넌트에서 에러 발생 시 앱 전체 크래시 방지
- 사용자에게 친화적인 에러 메시지 표시

**학습 포인트**:
- Q: 왜 함수 컴포넌트로 못 만드는가?
- A: `getDerivedStateFromError`, `componentDidCatch`는 클래스 메서드만 가능
- 향후 React에서 훅 기반 Error Boundary 지원 예정

---

### 3. Vite 빌드 최적화 설정
```typescript
/* vite.config.ts:1-60 */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    
    // 개발 서버 설정
    server: {
      port: 3000,
      open: true,
    },
    
    // 빌드 설정
    build: {
      // 최소 지원 브라우저
      target: 'es2020',
      
      // 출력 디렉토리
      outDir: 'dist',
      
      // 소스맵 (프로덕션에서는 'hidden' 또는 false)
      sourcemap: mode === 'development',
      
      // 청크 크기 경고 임계값 (KB)
      chunkSizeWarningLimit: 500,
      
      // Rollup 옵션
      rollupOptions: {
        output: {
          // 수동 청크 분리
          manualChunks: {
            // React 관련
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // TanStack Query
            'vendor-query': ['@tanstack/react-query'],
            // 상태 관리
            'vendor-state': ['zustand'],
          },
          
          // 에셋 파일명 패턴
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || []
            const ext = info[info.length - 1]
            
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          },
          
          // JS 청크 파일명 패턴
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },
      
      // CSS 코드 스플리팅
      cssCodeSplit: true,
      
      // minify 설정
      minify: 'esbuild',
    },
    
    // 미리보기 서버 (빌드 결과물 테스트)
    preview: {
      port: 4173,
    },
  }
})
```

**선정 이유**: Vite의 프로덕션 빌드 최적화

**로직/흐름 설명**:
- `manualChunks`: 벤더 라이브러리를 별도 청크로 분리 (캐싱 효율)
- `assetFileNames`: 에셋 유형별 디렉토리 분리
- `sourcemap`: 개발에서만 소스맵 생성
- `target: 'es2020'`: 모던 브라우저 대상 (번들 크기 감소)

**런타임 영향**:
- 청크 분리로 변경된 코드만 다시 다운로드
- 에셋 해시로 브라우저 캐싱 최적화

**학습 포인트**:
- Q: 왜 vendor를 분리하는가?
- A: 앱 코드 변경 시 vendor 청크는 캐시 유지 가능
- Q: es2020 타겟의 장점은?
- A: 폴리필 감소로 번들 크기 감소 (IE 미지원)

---

### 4. App.tsx에 ErrorBoundary 적용
```typescript
/* src/App.tsx (변경 부분) */
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}
```

**선정 이유**: 앱 전체를 감싸는 최상위 Error Boundary

**로직/흐름 설명**:
- 가장 바깥에 위치하여 모든 에러 캐치
- 필요시 특정 컴포넌트에 추가 ErrorBoundary 중첩 가능

---

### 5. .gitignore 업데이트
```bash
# .gitignore (추가 부분)
# 환경 변수 (민감 정보)
.env
.env.local
.env.*.local

# .env.example은 커밋 (필요한 변수 문서화)
!.env.example
```

**선정 이유**: 환경 변수 보안

**학습 포인트**:
- 실제 환경 변수 파일은 커밋하지 않음
- `.env.example`만 커밋하여 필요한 변수 문서화

## 재현 단계 (CLI 우선)

### CLI 명령어
```bash
# 1. 환경 변수 설정
cp .env.example .env.local

# 2. 개발 서버 실행
npm run dev

# 3. 프로덕션 빌드
npm run build

# 4. 빌드 결과물 미리보기
npm run preview

# 5. 빌드 분석 (선택)
npx vite-bundle-analyzer

# 6. 테스트 실행
npm test -- --run

# 7. 빌드 크기 확인
du -sh dist/
ls -la dist/assets/js/
```

### 구현 단계 (코드 작성 순서)
1. **환경 변수 파일 생성**: `.env.example`, `.env.development`, `.env.production`
2. **.gitignore 업데이트**: .env 파일 제외
3. **ErrorBoundary 구현**: `src/components/ErrorBoundary/`
4. **App.tsx 수정**: ErrorBoundary 래핑
5. **vite.config.ts 수정**: 빌드 최적화 설정
6. **검증**: `npm run build && npm run preview`

## 설명

### 설계 결정
1. **manualChunks**: 벤더 분리로 캐싱 효율화
2. **es2020 타겟**: 모던 브라우저만 지원 (번들 최소화)
3. **ErrorBoundary 최상위 배치**: 모든 에러 캐치

### 트레이드오프
- **소스맵**: 디버깅 용이 vs 번들 크기 증가
- **ES 타겟**: 최신 문법 vs 호환성

### 빌드 결과물 구조
```
dist/
├── index.html
└── assets/
    ├── js/
    │   ├── index-[hash].js          # 앱 코드
    │   ├── vendor-react-[hash].js   # React
    │   ├── vendor-query-[hash].js   # TanStack Query
    │   └── vendor-state-[hash].js   # Zustand
    ├── css/
    │   └── index-[hash].css
    └── images/
```

## 검증 체크리스트

### 자동 검증
```bash
npm run lint      # PASS
npm test -- --run # 모든 테스트 통과
npm run build     # 성공 (경고 없음)
```

### 수동 검증
- [ ] `npm run build` 성공
- [ ] `npm run preview`로 빌드 결과물 확인
- [ ] dist/assets/js/ 에서 청크 분리 확인
- [ ] 의도적 에러 발생 시 ErrorBoundary UI 표시
- [ ] 개발 환경에서만 에러 스택 표시
- [ ] Network 탭에서 청크 로딩 확인

## 누락 정보
- 없음
