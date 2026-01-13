# Commit #1 — Vite + React + TypeScript 프로젝트 초기화

## Meta
- **난이도**: ⭐ 초급 (Beginner)
- **권장 커밋 메시지**: `chore: scaffold vite react-ts app with testing and linting`

## 학습 목표
1. Vite CLI를 사용하여 React + TypeScript 프로젝트를 스캐폴딩하는 방법을 익힌다
2. ESLint와 Prettier를 설정하여 코드 품질 게이트를 구축한다
3. Vitest + Testing Library로 테스트 환경을 구성한다
4. CSS Modules 기반 스타일 시스템과 디자인 토큰을 적용한다

## TL;DR
Vite CLI로 React 19 + TypeScript 프로젝트를 생성하고, ESLint 9, Prettier, Vitest, Testing Library를 설정하여 완전한 개발 환경을 구축한다. CSS 변수 기반 디자인 토큰과 App 컴포넌트 스모크 테스트 5개를 포함한다.

## 배경/맥락
새로운 React 프로젝트를 시작할 때 가장 중요한 것은 견고한 기반을 다지는 것이다. 이 커밋은 프로젝트의 첫 번째 단계로서:
- **빌드 도구**: Vite는 빠른 HMR(Hot Module Replacement)과 간편한 설정을 제공
- **타입 안전성**: TypeScript로 개발 시 타입 오류를 사전에 방지
- **코드 품질**: ESLint + Prettier로 일관된 코드 스타일 유지
- **테스트 환경**: Vitest는 Vite와 네이티브 통합되어 빠른 테스트 실행 가능

## 변경 파일 목록
### 추가된 파일 (27개)
- `.gitignore` — Git 버전 관리 제외 파일
- `.prettierignore`, `.prettierrc` — Prettier 설정
- `README.md`, `TODO.md` — 프로젝트 문서
- `eslint.config.js` — ESLint 9 Flat Config
- `index.html` — Vite 진입점
- `package.json`, `package-lock.json` — 의존성 관리
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — TypeScript 설정
- `vite.config.ts` — Vite 빌드 설정
- `src/App.tsx`, `src/App.module.css`, `src/App.test.tsx` — App 컴포넌트
- `src/main.tsx`, `src/index.css` — 앱 진입점 및 전역 스타일
- `src/test/setup.ts` — 테스트 설정
- `scripts/run_stage.sh`, `scripts/verify.sh` — 오케스트레이션 스크립트
- `state/stage-0.json` — 스테이지 체크포인트
- `docs/stage-0.md`, `docs/changes/stage-0.md`, `docs/failures.md` — 학습 문서

## 코드 스니펫

### 1. package.json — 의존성 및 스크립트 설정
```json
// package.json:1-35
{
  "name": "hello-front-opus",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.1",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.6.0",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.2.0",
    "jsdom": "^26.1.0",
    "prettier": "^3.5.3",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4",
    "vitest": "^3.2.4"
  }
}
```

**선정 이유**: 프로젝트의 핵심 의존성과 npm 스크립트 구조를 보여주는 가장 중요한 파일

**로직/흐름 설명**:
- `scripts`: 개발(`dev`), 빌드(`build`), 린트(`lint`), 테스트(`test`) 명령 정의
- `dependencies`: 런타임에 필요한 React 19 패키지
- `devDependencies`: 개발 시에만 필요한 도구들 (ESLint, Vitest, TypeScript 등)

**런타임/빌드 영향**: 
- `npm run dev`로 Vite 개발 서버 시작 (HMR 지원)
- `npm run build`로 프로덕션 빌드 생성
- 품질 게이트: `lint`, `test`, `build` 모두 통과해야 커밋 가능

**학습 포인트**: 
- Q: `"type": "module"`의 의미는 무엇인가?
- A: ES 모듈 시스템 사용을 선언하여 `import/export` 구문 사용 가능

---

### 2. vite.config.ts — Vite 빌드 설정
```typescript
// vite.config.ts:1-15
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
```

**선정 이유**: Vite와 Vitest 통합 설정의 핵심

**로직/흐름 설명**:
- `plugins: [react()]`: React Fast Refresh 활성화
- `test.environment: 'jsdom'`: DOM API 시뮬레이션으로 컴포넌트 테스트 가능
- `test.setupFiles`: 테스트 실행 전 공통 설정 로드

**런타임/빌드 영향**:
- Vite 개발 서버에서 React 컴포넌트의 HMR 지원
- Vitest가 동일한 설정 파일을 공유하여 일관된 환경 제공

**학습 포인트**:
- Vite는 ESBuild를 사용하여 개발 시 빠른 빌드 속도 제공
- `globals: true`로 `describe`, `it`, `expect`를 전역으로 사용 가능

---

### 3. App.test.tsx — 스모크 테스트 예시
```tsx
// src/App.test.tsx:1-45
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App 컴포넌트', () => {
  it('앱이 정상적으로 렌더링되어야 한다', () => {
    render(<App />)
    expect(screen.getByText(/Vite \+ React/i)).toBeInTheDocument()
  })

  it('Vite 로고가 표시되어야 한다', () => {
    render(<App />)
    expect(screen.getByAltText('Vite logo')).toBeInTheDocument()
  })

  it('React 로고가 표시되어야 한다', () => {
    render(<App />)
    expect(screen.getByAltText('React logo')).toBeInTheDocument()
  })

  it('카운터 버튼을 클릭하면 카운트가 증가해야 한다', async () => {
    const user = userEvent.setup()
    render(<App />)

    const button = screen.getByRole('button', { name: /count is 0/i })
    expect(button).toBeInTheDocument()

    await user.click(button)
    expect(screen.getByRole('button', { name: /count is 1/i })).toBeInTheDocument()

    await user.click(button)
    expect(screen.getByRole('button', { name: /count is 2/i })).toBeInTheDocument()
  })

  it('외부 링크들이 새 탭에서 열리도록 설정되어 있어야 한다', () => {
    render(<App />)
    
    const viteLink = screen.getByRole('link', { name: /vite logo/i })
    const reactLink = screen.getByRole('link', { name: /react logo/i })

    expect(viteLink).toHaveAttribute('target', '_blank')
    expect(reactLink).toHaveAttribute('target', '_blank')
  })
})
```

**선정 이유**: Testing Library의 사용자 중심 테스트 패턴을 보여주는 대표 예시

**로직/흐름 설명**:
- `render(<App />)`: 컴포넌트를 가상 DOM에 렌더링
- `screen.getByText()`, `screen.getByRole()`: 사용자 관점의 요소 쿼리
- `userEvent.click()`: 실제 사용자 상호작용 시뮬레이션

**테스트 전략 영향**:
- 스모크 테스트: 앱이 크래시 없이 렌더링되는지 확인
- 상호작용 테스트: 버튼 클릭으로 상태 변경 검증
- 접근성: `getByRole`은 접근성 트리 기반 쿼리

**학습 포인트**:
- `userEvent`가 `fireEvent`보다 실제 사용자 행동에 가까움
- `async/await`로 비동기 상호작용 처리

---

### 4. Prettier 설정
```json
// .prettierrc:1-7
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

**선정 이유**: 코드 포맷팅 규칙의 핵심 설정

**로직/흐름 설명**:
- `semi: false`: 세미콜론 자동 제거
- `singleQuote: true`: 작은따옴표 사용
- `trailingComma: "es5"`: ES5 호환 후행 콤마

**빌드 영향**: 코드 일관성 유지로 Git diff 최소화

## 재현 단계 (CLI 우선)

### 사전 준비
- Node.js 18+ 설치
- npm 또는 yarn 설치

### CLI 명령어
```bash
# 1. 프로젝트 생성 (Vite CLI)
npm create vite@latest hello-front-opus -- --template react-ts

# 2. 디렉토리 이동
cd hello-front-opus

# 3. 추가 의존성 설치
npm install

# 4. 테스트 라이브러리 설치
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# 5. Prettier 설치
npm install -D prettier

# 6. 개발 서버 시작
npm run dev

# 7. 테스트 실행
npm test

# 8. 린트 검사
npm run lint

# 9. 프로덕션 빌드
npm run build
```

### 구현 단계 (코드 작성 순서)
1. **프로젝트 스캐폴딩**: `npm create vite@latest` 실행
2. **Prettier 설정**: `.prettierrc`, `.prettierignore` 파일 생성
3. **Vitest 설정**: `vite.config.ts`에 test 설정 추가
4. **테스트 설정 파일**: `src/test/setup.ts` 생성하여 jest-dom 확장
5. **App 테스트 작성**: `src/App.test.tsx` 스모크 테스트 작성
6. **스크립트 폴더**: `scripts/verify.sh` 품질 게이트 스크립트 생성
7. **문서화**: `README.md`, `docs/` 폴더 구성

## 설명

### 설계 결정
1. **Vite 선택 이유**: Create React App 대비 10배 이상 빠른 개발 서버 시작, ESBuild 기반 번들링
2. **ESLint 9 Flat Config**: 새로운 ESLint 설정 형식으로 더 명확한 설정 구조
3. **CSS Modules**: 클래스명 해싱으로 스타일 충돌 방지, 별도 CSS-in-JS 라이브러리 불필요

### 트레이드오프
- **Vite vs Webpack**: Vite는 개발 속도가 빠르지만, 레거시 브라우저 지원이 제한적
- **Vitest vs Jest**: Vitest는 Vite와 네이티브 통합되나, Jest 생태계만큼 성숙하지 않음
- **CSS Modules vs CSS-in-JS**: 런타임 오버헤드 없음, 하지만 동적 스타일링은 제한적

### 잠재적 리스크
- React 19가 아직 안정화 초기 단계일 수 있음
- ESLint 9 Flat Config는 일부 플러그인과 호환성 이슈 가능

## 검증 체크리스트

### 자동 검증
```bash
# 린트 검사 — 오류 0개 예상
npm run lint

# 테스트 실행 — 5개 테스트 통과 예상
npm test -- --run

# 빌드 — 성공 예상
npm run build
```

### 예상 결과
- `npm run lint`: ESLint 오류/경고 없음
- `npm test`: 5 tests passed
- `npm run build`: `dist/` 폴더에 번들 생성

### 수동 검증
- [ ] `npm run dev` 실행 후 `http://localhost:5173` 접속
- [ ] "Vite + React" 텍스트가 화면에 표시되는지 확인
- [ ] 카운터 버튼 클릭 시 숫자가 증가하는지 확인
- [ ] 브라우저 개발자 도구에서 콘솔 오류가 없는지 확인

## 누락 정보
- 없음 (commit-summary에 필요한 모든 정보가 포함되어 있음)
