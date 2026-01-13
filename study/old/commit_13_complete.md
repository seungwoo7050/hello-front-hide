# Commit #13 — CI/CD 설정 및 E2E 테스트 셀렉터 수정

## Meta
- **난이도**: ⭐⭐⭐ 중급 (Intermediate)
- **권장 커밋 메시지**: `ci: add GitHub Actions workflow and fix E2E test selectors`

## 학습 목표
1. GitHub Actions를 사용한 CI/CD 파이프라인을 구성한다
2. PR 및 푸시 이벤트에 자동 테스트를 실행한다
3. 테스트 셀렉터를 견고하게 수정하는 방법을 학습한다
4. CI 환경에서의 E2E 테스트 실행을 최적화한다

## TL;DR
GitHub Actions 워크플로우를 추가하여 PR/푸시 시 자동으로 린트, 단위 테스트, E2E 테스트를 실행한다. E2E 테스트의 불안정한 셀렉터를 data-testid 기반으로 수정한다.

## 배경/맥락
CI/CD의 중요성:
- **자동화된 품질 관리**: 매 커밋마다 테스트 실행
- **빠른 피드백**: 문제를 조기에 발견
- **일관된 환경**: 로컬과 CI 환경의 일관성

GitHub Actions 특징:
- **무료 티어**: 퍼블릭 저장소 무제한, 프라이빗 2000분/월
- **매트릭스 빌드**: 여러 환경에서 병렬 실행
- **캐싱**: node_modules, Playwright 브라우저 캐싱

## 변경 파일 목록
### 추가된 파일 (2개)
- `.github/workflows/ci.yml` — CI 워크플로우
- `.github/workflows/e2e.yml` — E2E 테스트 워크플로우 (선택)

### 수정된 파일 (5개)
- `tests/e2e/pages/LoginPage.ts` — 셀렉터 수정
- `tests/e2e/pages/NotesPage.ts` — 셀렉터 수정
- `src/pages/Login/Login.tsx` — data-testid 추가
- `src/features/notes/NotesList.tsx` — data-testid 추가
- `playwright.config.ts` — CI 환경 설정 추가

## 코드 스니펫

### 1. GitHub Actions CI 워크플로우
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

# 동시 실행 제한 (같은 PR에서 새 커밋 시 이전 실행 취소)
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check TypeScript
        run: npm run type-check

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --run --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          fail_ci_if_error: false

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e -- --project=chromium

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7
```

**선정 이유**: 완전한 CI 파이프라인 구성

**로직/흐름 설명**:
- **on**: 트리거 이벤트 (push, pull_request)
- **concurrency**: 중복 실행 방지
- **jobs**: lint → test → e2e → build 순서
- **needs**: 의존성 (이전 job 성공 시 실행)
- **cache**: npm 의존성 캐싱으로 속도 향상

**학습 포인트**:
- `npm ci` vs `npm install`: ci는 lockfile 기반으로 더 빠르고 일관성 있음
- `--with-deps`: 시스템 의존성 함께 설치 (CI 환경)

---

### 2. E2E 테스트 셀렉터 수정 (data-testid)
```typescript
/* tests/e2e/pages/LoginPage.ts (수정 후) */
import { type Page, type Locator, expect } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    // data-testid 기반 셀렉터로 변경
    this.emailInput = page.getByTestId('login-email')
    this.passwordInput = page.getByTestId('login-password')
    this.submitButton = page.getByTestId('login-submit')
    this.errorMessage = page.getByTestId('login-error')
  }

  // ... 나머지 메서드 동일
}
```

**선정 이유**: 테스트 안정성을 위한 셀렉터 전략

**로직/흐름 설명**:
- `getByTestId`: data-testid 속성 기반 선택
- UI 변경에 영향받지 않음 (텍스트, 구조 변경 등)

---

### 3. 컴포넌트에 data-testid 추가
```typescript
/* src/pages/Login/Login.tsx (수정 부분) */
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
      data-testid="login-email"
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
      data-testid="login-password"
    />
  </div>
  
  {error && (
    <div className={styles.error} data-testid="login-error">
      {error}
    </div>
  )}
  
  <Button type="submit" disabled={isSubmitting} fullWidth data-testid="login-submit">
    {isSubmitting ? '로그인 중...' : '로그인'}
  </Button>
</form>
```

**선정 이유**: E2E 테스트를 위한 안정적인 셀렉터 제공

**학습 포인트**:
- `data-testid`는 프로덕션 빌드에서 제거 가능 (babel-plugin)
- 테스트 목적으로만 사용되어야 함

---

### 4. Playwright CI 설정 추가
```typescript
/* playwright.config.ts (CI 관련 설정) */
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // ... 기존 설정
  
  // CI 환경 감지
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // CI에서 headless 모드
  use: {
    // ... 기존 설정
    headless: !!process.env.CI,
  },
  
  // CI에서는 빌드된 앱 사용
  webServer: {
    command: process.env.CI ? 'npm run preview' : 'npm run dev',
    url: process.env.CI ? 'http://localhost:4173' : 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  
  // CI에서는 Chromium만 실행 (속도)
  projects: process.env.CI
    ? [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ],
})
```

**선정 이유**: CI 환경에 최적화된 설정

**로직/흐름 설명**:
- `process.env.CI`: GitHub Actions에서 자동 설정됨
- CI에서는 빌드된 앱(preview)으로 테스트 (더 현실적)
- CI에서는 Chromium만 (속도 vs 커버리지 트레이드오프)

---

### 5. package.json 스크립트
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

**선정 이유**: CI에서 사용할 스크립트 정리

## 재현 단계 (CLI 우선)

### CLI 명령어
```bash
# 1. GitHub Actions 워크플로우 파일 생성
mkdir -p .github/workflows
touch .github/workflows/ci.yml

# 2. 로컬에서 CI 시뮬레이션
npm run lint
npm run type-check
npm test -- --run
npm run build
npm run test:e2e -- --project=chromium

# 3. GitHub에 푸시 후 Actions 탭에서 실행 확인
git add .
git commit -m "ci: add GitHub Actions workflow"
git push

# 4. act로 로컬 테스트 (선택)
# brew install act
# act -j lint
```

### 구현 단계 (코드 작성 순서)
1. **워크플로우 파일 생성**: `.github/workflows/ci.yml`
2. **package.json 스크립트 추가**: type-check 등
3. **컴포넌트에 data-testid 추가**: Login, Notes 등
4. **페이지 객체 셀렉터 수정**: getByTestId 사용
5. **playwright.config.ts 수정**: CI 환경 설정
6. **푸시 및 검증**: GitHub Actions 실행 확인

## 설명

### 설계 결정
1. **Job 분리**: lint, test, e2e, build를 별도 job으로 분리
2. **순차 실행**: lint 실패 시 test 실행 안 함 (빠른 피드백)
3. **Chromium only in CI**: 속도 우선 (로컬에서 멀티 브라우저 테스트)

### 트레이드오프
- **Job 분리 vs 단일 Job**: 분리 시 병렬화 가능하지만 초기화 오버헤드
- **data-testid vs 접근성 셀렉터**: 안정성 vs 접근성 검증

### CI 파이프라인 흐름
```
push/PR
    ↓
[lint] ─→ 실패 시 중단
    ↓
[test] ─→ 실패 시 중단
    ↓
[e2e] ─→ 실패 시 리포트 업로드
    ↓
[build] ─→ 아티팩트 업로드
```

### 셀렉터 전략
| 우선순위 | 방법 | 장점 | 단점 |
|---------|-----|------|-----|
| 1 | data-testid | 안정적, 명시적 | 프로덕션 번들 크기 |
| 2 | getByRole | 접근성 검증 | UI 변경에 취약 |
| 3 | getByLabel | 접근성 검증 | 레이블 텍스트 변경에 취약 |
| 4 | getByText | 직관적 | 텍스트 변경에 취약 |

## 검증 체크리스트

### 자동 검증
```bash
npm run lint        # PASS
npm run type-check  # PASS
npm test -- --run   # 모든 테스트 통과
npm run test:e2e    # E2E 테스트 통과
npm run build       # 성공
```

### CI 검증
- [ ] GitHub에 푸시 후 Actions 탭에서 워크플로우 실행 확인
- [ ] 모든 job (lint, test, e2e, build) 성공
- [ ] PR 생성 시 체크 상태 표시 확인
- [ ] 실패 시 아티팩트(playwright-report) 업로드 확인

### 수동 검증
- [ ] data-testid가 올바르게 추가되었는지 DevTools에서 확인
- [ ] `npx playwright test --ui`로 셀렉터 동작 확인

## 누락 정보
- 없음
