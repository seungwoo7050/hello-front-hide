# Commit #1 — Vite + React + TypeScript 프로젝트 초기화

## Meta

- **난이도**: ⭐ 초급 (Beginner)
- **권장 커밋 메시지**: `chore: scaffold vite react-ts app with eslint, prettier, vitest`

---

## 학습 목표

1. Vite CLI를 사용하여 React + TypeScript 프로젝트를 스캐폴딩할 수 있다
2. ESLint와 Prettier를 설정하고 연동하여 코드 품질 도구를 구성할 수 있다
3. Vitest와 Testing Library로 테스트 환경을 구축할 수 있다
4. CSS Modules와 CSS 변수를 활용한 스타일 시스템의 기초를 이해할 수 있다

---

## TL;DR

Vite CLI로 React 19 + TypeScript 프로젝트를 생성하고, ESLint 9 + Prettier + Vitest + Testing Library를 설정하여 품질 게이트(lint, test, build)가 모두 통과하는 기반 프로젝트를 구축한다. CSS Modules 구조와 CSS 변수 기반 디자인 토큰 시스템의 기초를 마련한다.

---

## 배경/컨텍스트

### 왜 이 변경이 필요한가?

모든 프론트엔드 프로젝트는 견고한 기반 위에 시작되어야 한다. 이 커밋은:

- **빌드 도구 선택**: Vite는 ES 모듈 기반 HMR로 빠른 개발 피드백을 제공
- **코드 품질**: ESLint + Prettier로 일관된 코드 스타일 유지
- **테스트 환경**: Vitest + Testing Library로 컴포넌트 테스트 가능
- **스타일 시스템**: CSS Modules로 스타일 캡슐화, CSS 변수로 디자인 토큰 관리

### 영향 범위

- 프로젝트의 모든 후속 개발에 영향을 미치는 기반 설정
- `npm run lint`, `npm test`, `npm run build` 품질 게이트 확립

---

## 변경 파일 목록

### 추가된 파일 (27개)

| 파일 | 설명 |
|------|------|
| `.gitignore` | Git 제외 파일 설정 |
| `.prettierrc` | Prettier 코드 포매팅 설정 |
| `.prettierignore` | Prettier 제외 파일 설정 |
| `package.json` | 프로젝트 설정 및 의존성 |
| `vite.config.ts` | Vite + Vitest 설정 |
| `tsconfig.json` | TypeScript 기본 설정 |
| `tsconfig.app.json` | 앱 TypeScript 설정 |
| `tsconfig.node.json` | Node.js TypeScript 설정 |
| `eslint.config.js` | ESLint Flat Config |
| `index.html` | HTML 진입점 |
| `src/main.tsx` | React 앱 진입점 |
| `src/App.tsx` | 루트 컴포넌트 |
| `src/App.module.css` | App 컴포넌트 스타일 |
| `src/App.test.tsx` | App 컴포넌트 테스트 |
| `src/index.css` | 글로벌 스타일 및 CSS 변수 |
| `src/test/setup.ts` | Vitest 설정 파일 |
| `scripts/verify.sh` | 품질 게이트 스크립트 |
| `scripts/run_stage.sh` | 스테이지 실행 스크립트 |
| `docs/stage-0.md` | 학습 문서 |
| `docs/changes/stage-0.md` | 변경 로그 |
| `docs/failures.md` | 실패 로그 |
| `README.md` | 프로젝트 설명 |
| `TODO.md` | 학습 로드맵 |

---

## 코드 스니펫

### 1. package.json — 프로젝트 설정

**선택 이유**: 프로젝트의 핵심 설정으로, 의존성 구조와 스크립트 명령어를 이해하는 것이 중요

```json
// package.json:1..40
{
  "name": "hello-front-opus",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
    "test": "vitest",
    "preview": "vite preview"
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
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "eslint": "^9.39.1",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "jsdom": "^27.0.1",
    "prettier": "^3.7.4",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4",
    "vitest": "^3.2.4"
  }
}
```

**로직 설명**:
- `"type": "module"`: ES 모듈 사용 선언
- `scripts.build`: TypeScript 컴파일 후 Vite 빌드 순차 실행
- `dependencies`: React 19 런타임 의존성
- `devDependencies`: 개발 도구 (ESLint, Prettier, Vitest, Testing Library)

**빌드/테스트 영향**: 모든 npm 스크립트의 기반이 되며, CI/CD 파이프라인에서 동일한 명령어 사용

**학습 노트**: `devDependencies`는 프로덕션 빌드에 포함되지 않음. 테스트/린트 도구는 반드시 여기에 배치

---

### 2. vite.config.ts — Vite + Vitest 통합 설정

**선택 이유**: Vite와 Vitest의 통합 설정 방법을 이해하는 것이 테스트 환경 구축의 핵심

```typescript
// vite.config.ts:1..20
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
```

**로직 설명**:
- `plugins: [react()]`: React Fast Refresh 지원
- `test.globals: true`: `describe`, `it`, `expect` 전역 사용 (import 불필요)
- `test.environment: 'jsdom'`: 브라우저 환경 시뮬레이션
- `test.setupFiles`: 테스트 전 실행할 설정 파일

**빌드/테스트 영향**: 
- HMR(Hot Module Replacement) 활성화로 개발 시 즉각적인 피드백
- jsdom 환경에서 DOM 관련 테스트 가능

**학습 노트**: Vitest는 Vite와 설정을 공유하므로 별도 `vitest.config.ts` 없이 통합 가능

---

### 3. eslint.config.js — ESLint Flat Config

**선택 이유**: ESLint 9의 새로운 Flat Config 형식을 이해하고 Prettier와 연동하는 방법 학습

```javascript
// eslint.config.js:1..31
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  eslintConfigPrettier,
])
```

**로직 설명**:
- `globalIgnores(['dist'])`: 빌드 출력 폴더 제외
- `extends`: 권장 설정 상속 (JS, TS, React Hooks, React Refresh)
- `eslintConfigPrettier`: Prettier와 충돌하는 ESLint 규칙 비활성화 (마지막에 배치)
- `argsIgnorePattern: '^_'`: `_`로 시작하는 미사용 변수 허용

**빌드/테스트 영향**: `npm run lint` 실행 시 코드 품질 검사

**학습 노트**: ESLint 9의 Flat Config는 배열 기반으로 설정을 조합하며, 순서가 중요함 (뒤의 설정이 앞을 덮어씀)

---

### 4. src/App.test.tsx — 컴포넌트 테스트

**선택 이유**: Testing Library를 사용한 React 컴포넌트 테스트의 기본 패턴 학습

```tsx
// src/App.test.tsx:1..36
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText(/Vite \+ React/i)).toBeInTheDocument()
  })

  it('renders Vite and React logos', () => {
    render(<App />)
    const logos = screen.getAllByRole('img')
    expect(logos.length).toBeGreaterThanOrEqual(2)
  })

  it('renders counter button with initial count of 0', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /count is 0/i })).toBeInTheDocument()
  })

  it('increments counter on button click', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const button = screen.getByRole('button', { name: /count is 0/i })
    await user.click(button)
    
    expect(screen.getByRole('button', { name: /count is 1/i })).toBeInTheDocument()
  })

  it('has accessible link to documentation', () => {
    render(<App />)
    const links = screen.getAllByRole('link')
    expect(links.some(link => link.getAttribute('href')?.includes('vite'))).toBe(true)
  })
})
```

**로직 설명**:
- `render(<App />)`: 컴포넌트를 가상 DOM에 렌더링
- `screen.getByText()`: 텍스트로 요소 검색
- `userEvent.setup()`: 사용자 상호작용 시뮬레이션
- `toBeInTheDocument()`: jest-dom 확장 매처

**빌드/테스트 영향**: `npm test` 실행 시 5개 테스트 케이스 검증

**학습 노트**: 
- Testing Library는 "사용자가 보는 것"을 기준으로 테스트 (접근성 우선)
- `getByRole`은 `getByTestId`보다 접근성 친화적

---

### 5. src/index.css — CSS 변수 기반 디자인 토큰

**선택 이유**: CSS 변수를 활용한 디자인 시스템의 기초를 이해하고 다크 모드 지원 기반 마련

```css
/* src/index.css:1..50 */
:root {
  /* 색상 토큰 */
  --color-primary: #646cff;
  --color-primary-hover: #535bf2;
  --color-background: #242424;
  --color-text: rgba(255, 255, 255, 0.87);
  --color-text-secondary: #888;
  
  /* 스페이싱 토큰 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  
  /* 폰트 토큰 */
  --font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  --font-size-base: 16px;
  --line-height: 1.5;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  
  /* 포커스 스타일 */
  --focus-ring: 4px auto -webkit-focus-ring-color;

  font-family: var(--font-family);
  line-height: var(--line-height);
  font-weight: var(--font-weight-normal);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
}

a {
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  text-decoration: inherit;
}

a:hover {
  color: var(--color-primary-hover);
}
```

**로직 설명**:
- `:root`에 CSS 변수 정의: 전역에서 접근 가능
- `--color-*`, `--spacing-*`, `--font-*`: 토큰 카테고리별 네이밍 컨벤션
- `var(--변수명)`: CSS 변수 사용

**빌드/테스트 영향**: 모든 컴포넌트에서 일관된 디자인 토큰 사용 가능

**학습 노트**: 
- CSS 변수는 런타임에 변경 가능 → 다크 모드 전환에 활용
- `rem` 단위 사용으로 사용자 폰트 크기 설정 존중

---

## 재현 단계 (CLI 우선)

### 사전 요구사항
- Node.js 18+ 설치
- npm 또는 pnpm 설치

### 1. 프로젝트 스캐폴딩

```bash
# 새 디렉토리 생성 및 Vite 프로젝트 초기화
npm create vite@latest hello-front-opus -- --template react-ts

# 프로젝트 디렉토리로 이동
cd hello-front-opus

# 의존성 설치
npm install
```

### 2. 개발 도구 설치

```bash
# 테스트 도구 설치
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# ESLint + Prettier 설치
npm install -D eslint-config-prettier prettier
```

### 3. 설정 파일 생성

```bash
# Prettier 설정 생성
cat > .prettierrc << 'EOF'
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
EOF

# Prettier 제외 파일
cat > .prettierignore << 'EOF'
node_modules
dist
coverage
*.log
EOF
```

### 4. 구현 단계 (코드 작성 순서)

1. **vite.config.ts 수정**: Vitest 설정 추가
2. **src/test/setup.ts 생성**: Testing Library 설정
3. **tsconfig.app.json 수정**: `vitest/globals` 타입 추가
4. **eslint.config.js 수정**: Prettier 연동
5. **src/index.css 수정**: CSS 변수 디자인 토큰 정의
6. **src/App.css → src/App.module.css**: CSS Modules로 변환
7. **src/App.tsx 수정**: CSS Modules import 적용
8. **src/App.test.tsx 생성**: 스모크 테스트 작성
9. **scripts/verify.sh 생성**: 품질 게이트 스크립트

### 5. 품질 게이트 검증

```bash
# 린트 검사
npm run lint

# 테스트 실행
npm test -- --run

# 빌드 검증
npm run build

# 개발 서버 실행
npm run dev
```

---

## 설명

### 설계 고려사항

1. **Vite vs CRA**: Vite는 ES 모듈 기반으로 Cold Start가 빠르고, HMR이 즉각적임
2. **CSS Modules vs CSS-in-JS**: 런타임 오버헤드 없이 스타일 캡슐화 가능
3. **Flat Config**: ESLint 9의 새로운 설정 형식으로, 더 직관적인 설정 조합 가능

### 트레이드오프

| 선택 | 장점 | 단점 |
|------|------|------|
| CSS Modules | 제로 런타임, 타입 안전성 가능 | 동적 스타일링 제한적 |
| Vitest globals | Jest와 유사한 API | import 명시성 감소 |
| ESLint Flat Config | 직관적인 설정 | 기존 플러그인 호환성 이슈 가능 |

### 잠재적 위험

- **패키지 버전 충돌**: `rm -rf node_modules package-lock.json && npm install`로 클린 설치
- **ESLint 플러그인 호환성**: Flat Config 지원 여부 확인 필요
- **jsdom 제한**: 일부 Web API가 완전히 구현되지 않음

---

## 검증 체크리스트

- [ ] `npm run lint` 실행 시 에러 없음
- [ ] `npm test -- --run` 실행 시 5개 테스트 통과
- [ ] `npm run build` 실행 시 `dist/` 폴더 생성
- [ ] `npm run dev` 실행 후 브라우저에서 Vite + React 로고 표시
- [ ] 카운터 버튼 클릭 시 숫자 증가
- [ ] CSS 변수가 적용되어 일관된 색상 표시

### 예상 결과

```bash
# npm test -- --run 출력 예시
 ✓ src/App.test.tsx (5 tests) 
   ✓ App > renders without crashing
   ✓ App > renders Vite and React logos
   ✓ App > renders counter button with initial count of 0
   ✓ App > increments counter on button click
   ✓ App > has accessible link to documentation

Test Files  1 passed (1)
Tests       5 passed (5)
```

---

## 누락 정보

이 가이드는 `study/commit-summary/commit_1_summary.txt`를 기반으로 작성되었으며, 다음 정보는 커밋 요약에서 직접 확인되었습니다:

- ✅ 커밋 해시: `0bab02255ed044a7292e1bcf687cf07a0a691506`
- ✅ 변경 파일 목록: 27개 파일
- ✅ 테스트 결과: 5개 테스트 통과

**참고 파일**:
- [vite.config.ts](../vite.config.ts)
- [src/App.test.tsx](../src/App.test.tsx)
- [src/index.css](../src/index.css)
- [eslint.config.js](../eslint.config.js)
