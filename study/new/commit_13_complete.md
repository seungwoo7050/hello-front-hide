# Commit #13 — CI/CD 설정 및 Preview 배포

## Meta
| 항목 | 내용 |
|------|------|
| 커밋 해시 | `49bd3801f2d241d439ce017527deed3ec85a019a` |
| 부모 커밋 | `88d3bc8ed9b2e8fde721ace8aaab5e4c7efb7cbe` |
| 난이도 | ⭐⭐⭐⭐ (고급) |
| 관련 기술 | GitHub Actions, CI/CD, Playwright CI, Vercel/Netlify, Docker |
| 커밋 메시지 | Stage 12: ci: CI/CD 설정 추가 및 E2E 테스트 셀렉터 수정 |

## 학습 목표
1. GitHub Actions 워크플로 작성 및 CI 파이프라인 구축
2. Lint → Unit Test → Build → E2E 테스트 순차 실행 이해
3. CI 환경에서 Vite Preview 서버를 활용한 E2E 테스트 실행
4. Vercel/Netlify를 통한 PR Preview 배포 설정
5. CI용 Dockerfile 작성 및 환경 일관성 확보
6. 안정적인 E2E 셀렉터 전략 (data-testid)

## TL;DR
> GitHub Actions로 `lint → unit tests → build → E2E` 파이프라인을 구축하고, CI 환경에서 Vite Preview 서버를 띄워 Playwright E2E 테스트를 실행한다. PR마다 Vercel/Netlify를 통해 Preview URL을 제공하며, 안정적인 E2E 테스트를 위해 data-testid 셀렉터로 요소를 타겟팅한다.

## 배경 / 컨텍스트
- **E2E 테스트 자동화 필요**: 로컬에서 작성한 E2E 테스트를 PR마다 자동 실행해야 회귀 방지 가능
- **CI/CD 파이프라인**: 린트, 유닛 테스트, 빌드, E2E를 순차적으로 실행하여 품질 게이트 구축
- **Preview 배포**: 리뷰어가 코드 변경을 실제로 확인할 수 있는 Preview URL 제공
- **E2E 셀렉터 안정성**: `getByText`나 `getByRole`이 여러 요소를 매칭할 경우 strict mode 위반 발생
- **CI 환경 일관성**: Dockerfile을 통해 로컬과 CI 환경을 동일하게 유지

## 변경 파일 목록
| 파일 경로 | 변경 타입 | 설명 |
|-----------|-----------|------|
| `.github/workflows/ci.yml` | ✨ 추가 | 메인 CI 워크플로 (lint, test, build, e2e, preview) |
| `.github/workflows/netlify-deploy.yml` | ✨ 추가 | Netlify Preview 배포 워크플로 |
| `Dockerfile.ci` | ✨ 추가 | CI용 Playwright Docker 이미지 |
| `docs/stage-12-branch-protection.md` | ✨ 추가 | 브랜치 보호 규칙 가이드 |
| `docs/stage-12-netlify-deploy.md` | ✨ 추가 | Netlify 배포 가이드 |
| `docs/stage-12-preview-deploy.md` | ✨ 추가 | Vercel Preview 배포 가이드 |
| `vitest.config.ts` | ✨ 추가 | Vitest 전용 설정 파일 |
| `playwright.config.ts` | ✏️ 수정 | CI 환경용 타임아웃 및 아티팩트 설정 |
| `src/features/notes/components/NoteEditor/NoteEditor.tsx` | ✏️ 수정 | data-testid 추가 |
| `tests/e2e/notes.spec.ts` | ✏️ 수정 | 로그인 플로우 및 testid 셀렉터로 전환 |
| `package.json` | ✏️ 수정 | wait-on 패키지 추가 |

## 코드 스니펫

### 1. GitHub Actions CI 워크플로
```yaml
# path: .github/workflows/ci.yml:1..100
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint_and_unit:
    name: Lint & Unit Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Run unit tests
        run: npm run test -- --run

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: lint_and_unit
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

  e2e:
    name: Playwright E2E
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Start preview server (robust)
        run: |
          npm run preview -- --port 5173 --host > /tmp/vite-preview.log 2>&1 &
          npx wait-on http://127.0.0.1:5173 --timeout 30000 --verbose
        env:
          CI: true

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test --reporter=github
```

### 2. CI용 Dockerfile
```dockerfile
# path: Dockerfile.ci:1..12
FROM mcr.microsoft.com/playwright:v1.57.0-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENV CI=true

RUN npm run build

CMD ["/bin/sh", "-c", "npm run preview -- --host --port 5173 >/tmp/vite-preview.log 2>&1 & npx wait-on http://127.0.0.1:5173 --timeout 30000 --verbose && npm run test:e2e -- --reporter=github"]
```

### 3. Vitest 전용 설정 파일
```typescript
// path: vitest.config.ts:1..20
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    globals: true,
    include: [
      'src/**/*.test.{ts,tsx,js,jsx}',
      'src/**/*.spec.{ts,tsx,js,jsx}',
      'tests/unit/**/*.test.{ts,tsx,js,jsx}',
      'tests/unit/**/*.spec.{ts,tsx,js,jsx}',
    ],
    exclude: ['node_modules/**', '**/tests/e2e/**'],
    coverage: {
      provider: 'c8',
    },
  },
})
```

### 4. Playwright CI 환경 설정
```typescript
// path: playwright.config.ts:1..30
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 10000 }, // CI 환경에서 더 긴 타임아웃
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10000,
    ignoreHTTPSErrors: true,
    // CI 디버깅용 아티팩트
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  webServer: process.env.CI
    ? undefined // CI에서는 수동으로 서버 시작
    : {
        command: 'npm run dev',
        url: 'http://127.0.0.1:5173',
        reuseExistingServer: !process.env.CI,
      },
})
```

### 5. E2E 테스트 - data-testid 활용
```typescript
// path: tests/e2e/notes.spec.ts:70..120
test('create → edit → delete a note', async ({ page }) => {
  // 로그인 먼저
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  await page.getByPlaceholder('example@email.com').fill('test@example.com')
  await page.getByPlaceholder('비밀번호를 입력하세요').fill('password123')
  await page.getByRole('button', { name: '로그인' }).click()

  await page.waitForURL('/notes')
  await page.waitForLoadState('networkidle')

  // 새 노트 생성 버튼 대기
  const createButton = page.getByRole('button', { name: '+ 새 노트' })
  await createButton.waitFor({ timeout: 15000 })

  // 노트 생성
  await createButton.click()
  await page.getByPlaceholder('제목을 입력하세요').fill('E2E Note Title')
  await page.getByPlaceholder('내용을 입력하세요...').fill('E2E note content')
  await page.getByRole('button', { name: '저장' }).click()

  // 리스트에서 확인 - 정확한 셀렉터
  await expect(page.locator('h3').filter({ hasText: 'E2E Note Title' })).toBeVisible()

  // 상세 보기 - data-testid 활용
  await page.locator('h3').filter({ hasText: 'E2E Note Title' }).click()
  const detailContent = page.getByTestId('note-detail-content')
  await expect(detailContent).toContainText('E2E note content')

  // 삭제 - data-testid로 정확한 버튼 타겟팅
  page.once('dialog', (dialog) => dialog.accept())
  const deleteButton = page.getByTestId('note-delete-button')
  await deleteButton.click()

  // 삭제 확인
  await expect(page.getByText('E2E Note Title')).toHaveCount(0)
})
```

### 6. NoteEditor - data-testid 추가
```tsx
// path: src/features/notes/components/NoteEditor/NoteEditor.tsx:125..150
<Button
  variant="ghost"
  size="small"
  onClick={handleDelete}
  data-testid="note-delete-button"
>
  삭제
</Button>

{/* 노트 제목 */}
<h1
  className={styles.titleInput}
  style={{ cursor: 'default' }}
  data-testid="note-detail-title"
>
  {note.title || '제목 없음'}
</h1>

{/* 노트 내용 */}
<div
  className={styles.content}
  data-testid="note-detail-content"
>
  {note.content || '내용 없음'}
</div>
```

### 7. Vercel Preview 배포 Job
```yaml
# path: .github/workflows/ci.yml:134..174
deploy_preview:
  name: Deploy Preview (Vercel)
  if: ${{ github.event_name == 'pull_request' }}
  runs-on: ubuntu-latest
  needs: build
  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install dependencies
      run: npm ci

    - name: Check Vercel token
      id: check_vercel
      run: |
        if [ -n "${{ secrets.VERCEL_TOKEN }}" ]; then
          echo "allow=true" >> "$GITHUB_OUTPUT"
        else
          echo "allow=false" >> "$GITHUB_OUTPUT"
        fi

    - name: Vercel Deploy
      if: ${{ steps.check_vercel.outputs.allow == 'true' }}
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        github-comment: true
```

## 재현 단계 (CLI 우선)

### Step 1: wait-on 패키지 추가
```bash
npm install -D wait-on@^9.0.3
```

### Step 2: CI 워크플로 생성
```bash
mkdir -p .github/workflows
cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint_and_unit:
    name: Lint & Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --run

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: lint_and_unit
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build

  e2e:
    name: Playwright E2E
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - name: Start preview server
        run: |
          npm run preview -- --port 5173 --host > /tmp/vite-preview.log 2>&1 &
          npx wait-on http://127.0.0.1:5173 --timeout 30000 --verbose
        env:
          CI: true
      - run: npx playwright install --with-deps
      - run: npx playwright test --reporter=github
EOF
```

### Step 3: vitest.config.ts 생성
```bash
cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    globals: true,
    include: [
      'src/**/*.test.{ts,tsx,js,jsx}',
      'src/**/*.spec.{ts,tsx,js,jsx}',
    ],
    exclude: ['node_modules/**', '**/tests/e2e/**'],
  },
})
EOF
```

### Step 4: Dockerfile.ci 생성
```bash
cat > Dockerfile.ci << 'EOF'
FROM mcr.microsoft.com/playwright:v1.57.0-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENV CI=true

RUN npm run build

CMD ["/bin/sh", "-c", "npm run preview -- --host --port 5173 & npx wait-on http://127.0.0.1:5173 --timeout 30000 && npm run test:e2e"]
EOF
```

### Step 5: Playwright 설정 업데이트
```bash
# playwright.config.ts에서 CI 환경 설정 추가
# - expect.timeout: 10000 (5000에서 증가)
# - actionTimeout: 10000
# - trace: 'on-first-retry'
# - video: 'retain-on-failure'
```

### Step 6: E2E 테스트에 로그인 플로우 추가
```bash
# tests/e2e/notes.spec.ts 수정
# - 테스트 시작 시 로그인 수행
# - data-testid 셀렉터 사용
# - 디버깅용 아티팩트 수집 로직 추가
```

### Step 7: NoteEditor에 data-testid 추가
```bash
# src/features/notes/components/NoteEditor/NoteEditor.tsx
# - 삭제 버튼: data-testid="note-delete-button"
# - 제목: data-testid="note-detail-title"
# - 내용: data-testid="note-detail-content"
```

### Step 8: 로컬에서 CI 환경 테스트
```bash
# Docker로 CI 환경 시뮬레이션
docker build -f Dockerfile.ci -t hello-front-ci .
docker run --rm hello-front-ci
```

### Step 9: GitHub 리포지토리에 Push
```bash
git add .
git commit -m "ci: CI/CD 설정 추가 및 E2E 테스트 셀렉터 수정"
git push origin main
```

### Step 10: GitHub Actions 확인
```bash
# GitHub 리포지토리 > Actions 탭에서 워크플로 실행 확인
# PR 생성 시 자동으로 CI 파이프라인 실행됨
```

## 상세 설명

### GitHub Actions 워크플로 구조
```
┌─────────────────┐
│ push/PR 이벤트  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ lint_and_unit   │ ← ESLint + Vitest
└────────┬────────┘
         │ needs
         ▼
┌─────────────────┐
│     build       │ ← Vite 프로덕션 빌드
└────────┬────────┘
         │ needs
    ┌────┴────┐
    ▼         ▼
┌───────┐  ┌──────────────┐
│  e2e  │  │deploy_preview│
└───────┘  └──────────────┘
    ↓           ↓
Playwright   Vercel/Netlify
```

### CI 환경에서 E2E 테스트 실행 전략

1. **빌드 → 프리뷰 서버 → E2E** 순서
   - `npm run build`로 정적 파일 생성
   - `vite preview`로 프로덕션 환경과 유사하게 서빙
   - `wait-on`으로 서버 준비 대기 후 테스트 실행

2. **wait-on 사용 이유**
   - 서버가 백그라운드로 실행되므로 즉시 다음 명령 실행됨
   - 서버가 완전히 준비되기 전에 테스트 실행 시 실패
   - `wait-on`이 HTTP 응답을 받을 때까지 대기

3. **Playwright 브라우저 설치**
   ```bash
   npx playwright install --with-deps
   ```
   - `--with-deps`: 시스템 의존성(libgbm, libnss3 등)도 함께 설치

### data-testid 셀렉터 전략

**문제**: strict mode에서 여러 요소가 매칭되면 에러
```typescript
// ❌ 여러 "삭제" 버튼이 있으면 실패
await page.getByRole('button', { name: '삭제' }).click()
```

**해결**: data-testid로 고유하게 식별
```typescript
// ✅ 정확한 요소 타겟팅
await page.getByTestId('note-delete-button').click()
```

**베스트 프랙티스**
- 테스트용 속성은 `data-testid`로 통일
- 프로덕션 빌드에서 제거하려면 babel 플러그인 사용 가능
- CSS 클래스나 텍스트보다 안정적 (UI 변경에 강함)

### Preview 배포 옵션 비교

| 옵션 | 장점 | 단점 |
|------|------|------|
| **Vercel Git Integration** | 설정 간단, 토큰 불필요 | Vercel에 리포 연결 필요 |
| **GitHub Actions + Vercel** | 커스텀 빌드 가능 | Secret 설정 필요 |
| **Netlify Git Integration** | 무료 범위 넓음 | 설정이 약간 복잡 |
| **GitHub Actions + Netlify** | 완전한 제어 | Secret 설정 필요 |

### 브랜치 보호 규칙 권장 설정

```
Repository → Settings → Branches → Add rule

✅ Require status checks to pass
   - Lint & Unit Tests
   - Playwright E2E

✅ Require branches to be up to date

✅ Require pull request reviews (1명 이상)

✅ Dismiss stale approvals when new commits pushed
```

## 검증 체크리스트
- [ ] `.github/workflows/ci.yml` 파일이 존재하는가?
- [ ] `npm run lint`, `npm run test -- --run`, `npm run build` 모두 통과하는가?
- [ ] Dockerfile.ci로 빌드 및 테스트가 성공하는가?
- [ ] PR 생성 시 GitHub Actions가 자동 실행되는가?
- [ ] E2E 테스트가 CI 환경에서 안정적으로 통과하는가?
- [ ] data-testid 셀렉터로 요소가 정확히 타겟팅되는가?
- [ ] Vercel/Netlify Preview URL이 PR에 표시되는가? (옵션)

## 누락 정보
| 항목 | 설명 | 대안 |
|------|------|------|
| 테스트 커버리지 수 | 이 커밋의 정확한 테스트 수 미기재 | 이전 커밋 기준 약 408개 |
| Vercel/Netlify Secret | 실제 토큰 값 미포함 | 각 서비스에서 발급 필요 |
| 브랜치 보호 규칙 설정 | GitHub UI 설정 필요 | 문서 참고하여 수동 설정 |
| CI 실행 시간 | 실제 소요 시간 미측정 | 약 3-5분 예상 |

---

## 학습 포인트 요약

1. **CI/CD 파이프라인**: lint → test → build → e2e → deploy 순서로 품질 게이트 구축
2. **GitHub Actions**: `jobs`, `needs`, `steps`, `secrets` 개념 이해
3. **E2E in CI**: 서버 시작 → wait-on 대기 → Playwright 실행
4. **data-testid**: UI 변경에 강한 테스트 셀렉터 전략
5. **Preview 배포**: PR마다 배포된 URL로 실제 동작 확인 가능
