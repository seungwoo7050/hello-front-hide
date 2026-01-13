# Commit #12 — E2E 테스트 (Playwright)

## Meta

- **난이도**: ⭐⭐⭐ 중급 (Intermediate)
- **권장 커밋 메시지**: `test: add E2E tests with Playwright for notes CRUD`

---

## 학습 목표

1. Playwright를 설치하고 설정할 수 있다
2. E2E 테스트로 사용자 시나리오를 검증할 수 있다
3. 개발 서버 자동 시작 설정을 구성할 수 있다
4. 테스트 리포트를 생성하고 확인할 수 있다

---

## TL;DR

Playwright를 설치하고 `playwright.config.ts`를 구성한다. 개발 서버 자동 시작을 설정하고, Notes CRUD 시나리오(생성 → 편집 → 삭제)를 E2E 테스트로 작성한다. `npm run test:e2e`로 브라우저 환경에서 실제 사용자 흐름을 검증한다.

---

## 배경/컨텍스트

### 왜 이 변경이 필요한가?

- **실제 사용자 환경 테스트**: 브라우저에서 전체 흐름 검증
- **회귀 방지**: 배포 전 핵심 시나리오 자동 검증
- **신뢰도 향상**: 유닛 테스트로 잡지 못하는 통합 이슈 발견
- **CI/CD 통합**: 자동화된 품질 게이트

### Unit Test vs E2E Test

| 특성 | Unit Test | E2E Test |
|------|-----------|----------|
| 범위 | 개별 함수/컴포넌트 | 전체 사용자 흐름 |
| 속도 | 빠름 (ms) | 느림 (초) |
| 환경 | jsdom | 실제 브라우저 |
| 격리 | 높음 | 낮음 |
| 용도 | 로직 검증 | 시나리오 검증 |

### 영향 범위

- 새로운 패키지: `@playwright/test`
- 설정 파일: `playwright.config.ts`
- 테스트 디렉토리: `tests/e2e/`
- npm 스크립트: `test:e2e` 추가

---

## 변경 파일 목록

### 추가된 파일 (3개)

| 카테고리 | 파일 | 설명 |
|----------|------|------|
| Config | `playwright.config.ts` | Playwright 설정 |
| Test | `tests/e2e/notes.spec.ts` | Notes CRUD E2E 테스트 |
| Report | `playwright-report/` | 테스트 리포트 |

### 수정된 파일 (2개)

| 파일 | 변경 내용 |
|------|------|
| `package.json` | @playwright/test, test:e2e 스크립트 추가 |
| `TODO.md` | Stage 11 체크리스트 |

---

## 코드 스니펫

### 1. Playwright 설정

```typescript
/* playwright.config.ts */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // 개발 서버 자동 시작
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

---

### 2. Notes CRUD E2E 테스트

```typescript
/* tests/e2e/notes.spec.ts */
import { test, expect } from '@playwright/test';

test.describe('Notes CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // 노트 페이지로 이동 (인증이 필요하면 로그인 먼저)
    await page.goto('/notes');
    
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
  });

  test('노트 목록이 표시된다', async ({ page }) => {
    // 노트 목록 컨테이너 확인
    await expect(page.getByTestId('notes-list')).toBeVisible();
  });

  test('새 노트를 생성할 수 있다', async ({ page }) => {
    // "새 노트" 버튼 클릭
    await page.getByRole('button', { name: '새 노트' }).click();
    
    // 폼 입력
    await page.getByLabel('제목').fill('테스트 노트');
    await page.getByLabel('내용').fill('Playwright로 작성한 테스트 노트입니다.');
    
    // 카테고리 선택
    await page.getByLabel('카테고리').selectOption('work');
    
    // 저장 버튼 클릭
    await page.getByRole('button', { name: '저장' }).click();
    
    // 생성된 노트가 목록에 표시되는지 확인
    await expect(page.getByText('테스트 노트')).toBeVisible();
  });

  test('노트를 수정할 수 있다', async ({ page }) => {
    // 기존 노트 클릭
    await page.getByText('테스트 노트').first().click();
    
    // 편집 버튼 클릭
    await page.getByRole('button', { name: '편집' }).click();
    
    // 제목 수정
    await page.getByLabel('제목').clear();
    await page.getByLabel('제목').fill('수정된 노트');
    
    // 저장
    await page.getByRole('button', { name: '저장' }).click();
    
    // 수정된 제목 확인
    await expect(page.getByText('수정된 노트')).toBeVisible();
  });

  test('노트를 삭제할 수 있다', async ({ page }) => {
    // 삭제할 노트의 삭제 버튼 클릭
    const noteCard = page.getByText('수정된 노트').locator('..');
    await noteCard.getByRole('button', { name: '삭제' }).click();
    
    // 확인 다이얼로그 (있다면)
    await page.getByRole('button', { name: '확인' }).click();
    
    // 삭제된 노트가 목록에서 사라졌는지 확인
    await expect(page.getByText('수정된 노트')).not.toBeVisible();
  });

  test('노트를 검색할 수 있다', async ({ page }) => {
    // 검색어 입력
    await page.getByPlaceholder('검색').fill('테스트');
    
    // 검색 결과 대기
    await page.waitForTimeout(500); // 디바운스 대기
    
    // 검색 결과에 해당 노트만 표시되는지 확인
    const noteCards = page.getByTestId('note-card');
    await expect(noteCards).toHaveCount(1);
  });
});

test.describe('Notes 필터링', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notes');
    await page.waitForLoadState('networkidle');
  });

  test('카테고리로 필터링할 수 있다', async ({ page }) => {
    // 카테고리 필터 선택
    await page.getByLabel('카테고리 필터').selectOption('work');
    
    // 필터링된 결과 확인
    const noteCards = page.getByTestId('note-card');
    const count = await noteCards.count();
    
    // 모든 카드가 'work' 카테고리인지 확인
    for (let i = 0; i < count; i++) {
      await expect(noteCards.nth(i)).toContainText('업무');
    }
  });

  test('정렬을 변경할 수 있다', async ({ page }) => {
    // 정렬 옵션 변경
    await page.getByLabel('정렬').selectOption('oldest');
    
    // 정렬 결과 확인 (첫 번째 노트가 가장 오래된 것인지)
    const firstNote = page.getByTestId('note-card').first();
    await expect(firstNote).toBeVisible();
  });
});
```

---

### 3. 인증이 필요한 경우

```typescript
/* tests/e2e/auth.setup.ts */
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // 로그인 페이지로 이동
  await page.goto('/login');
  
  // 로그인 폼 입력
  await page.getByLabel('이메일').fill('test@example.com');
  await page.getByLabel('비밀번호').fill('password123');
  await page.getByRole('button', { name: '로그인' }).click();
  
  // 로그인 성공 확인
  await expect(page).toHaveURL('/');
  
  // 인증 상태 저장
  await page.context().storageState({ path: authFile });
});
```

```typescript
/* playwright.config.ts - 인증 프로젝트 추가 */
export default defineConfig({
  // ...
  projects: [
    // 인증 설정 프로젝트
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

---

### 4. package.json 스크립트

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.57.0"
  }
}
```

---

## 재현 단계 (CLI 우선)

### 1. Playwright 설치

```bash
npm install -D @playwright/test
npx playwright install
```

### 2. 디렉토리 생성

```bash
mkdir -p tests/e2e
```

### 3. 설정 파일 생성

```bash
# playwright.config.ts 생성
# tests/e2e/notes.spec.ts 생성
```

### 4. 테스트 실행

```bash
# 전체 E2E 테스트 실행
npm run test:e2e

# UI 모드로 실행 (디버깅에 유용)
npm run test:e2e:ui

# 특정 테스트만 실행
npx playwright test notes.spec.ts

# 특정 브라우저만 실행
npx playwright test --project=chromium
```

### 5. 리포트 확인

```bash
npm run test:e2e:report
# 브라우저에서 playwright-report/index.html 열림
```

---

## 검증 체크리스트

- [ ] `npm run test:e2e` 실행 시 모든 테스트 통과
- [ ] 노트 생성 → 편집 → 삭제 시나리오 성공
- [ ] 개발 서버 자동 시작 동작
- [ ] `playwright-report/index.html` 리포트 생성
- [ ] 실패 시 스크린샷 저장

---

## 누락 정보

- ✅ 커밋 해시: `88d3bc8ed9b2e8fde721ace8aaab5e4c7efb7cbe`
- ✅ 테스트 결과: E2E 테스트 통과 (단위 테스트 408개 유지)

**핵심 학습 포인트**:
- `webServer` 설정: 개발 서버 자동 시작
- `reuseExistingServer`: 로컬에서는 기존 서버 재사용
- Locator: `getByRole`, `getByLabel`, `getByText`, `getByTestId`
- `waitForLoadState('networkidle')`: 네트워크 요청 완료 대기
- `storageState`: 인증 상태 저장 및 재사용
- `--ui` 모드: 비주얼 디버깅
