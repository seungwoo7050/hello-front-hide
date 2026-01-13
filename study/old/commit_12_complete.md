# Commit #12 — E2E 테스트 도입 — Playwright

## Meta
- **난이도**: ⭐⭐⭐⭐ 고급 (Advanced)
- **권장 커밋 메시지**: `test(e2e): add Playwright end-to-end tests`

## 학습 목표
1. Playwright를 사용한 E2E 테스트 환경을 설정한다
2. 페이지 객체 모델(Page Object Model) 패턴을 적용한다
3. 주요 사용자 흐름에 대한 E2E 테스트를 작성한다
4. CI에서 E2E 테스트 실행을 위한 설정을 구성한다

## TL;DR
Playwright를 설치하고 E2E 테스트를 작성한다. 로그인, 노트 CRUD, 네비게이션 등 주요 흐름을 테스트한다. Page Object Model 패턴으로 테스트 유지보수성을 높인다.

## 배경/맥락
E2E(End-to-End) 테스트의 필요성:
- **실제 사용자 흐름 검증**: 단위 테스트로 커버할 수 없는 통합 시나리오
- **회귀 테스트**: 배포 전 주요 기능 동작 확인
- **크로스 브라우저 테스트**: Chrome, Firefox, Safari 등 다양한 브라우저

Playwright 선택 이유:
- **빠른 실행 속도**: Cypress 대비 빠름
- **멀티 브라우저 지원**: Chromium, Firefox, WebKit
- **자동 대기**: 요소가 준비될 때까지 자동 대기
- **병렬 실행**: 테스트 병렬 실행 내장 지원

## 변경 파일 목록
### 추가된 파일 (8개+)
- `playwright.config.ts` — Playwright 설정
- `tests/e2e/auth.spec.ts` — 인증 테스트
- `tests/e2e/notes.spec.ts` — 노트 CRUD 테스트
- `tests/e2e/navigation.spec.ts` — 네비게이션 테스트
- `tests/e2e/fixtures.ts` — 테스트 픽스처
- `tests/e2e/pages/LoginPage.ts` — 로그인 페이지 객체
- `tests/e2e/pages/NotesPage.ts` — 노트 페이지 객체
- `tests/e2e/pages/index.ts` — 페이지 객체 배럴

### 수정된 파일 (2개)
- `package.json` — playwright 의존성, 스크립트 추가
- `.gitignore` — playwright 결과물 제외

## 코드 스니펫

### 1. Playwright 설정
```typescript
/* playwright.config.ts:1-70 */
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // 테스트 디렉토리
  testDir: './tests/e2e',
  
  // 테스트 파일 패턴
  testMatch: '**/*.spec.ts',
  
  // 전역 타임아웃 (테스트당)
  timeout: 30 * 1000,
  
  // expect 타임아웃
  expect: {
    timeout: 5000,
  },
  
  // 병렬 실행
  fullyParallel: true,
  
  // 실패 시 재시도 (CI에서만)
  retries: process.env.CI ? 2 : 0,
  
  // 워커 수
  workers: process.env.CI ? 1 : undefined,
  
  // 리포터
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  
  // 공유 설정
  use: {
    // 기본 URL
    baseURL: 'http://localhost:3000',
    
    // 트레이스 (실패 시에만)
    trace: 'on-first-retry',
    
    // 스크린샷 (실패 시에만)
    screenshot: 'only-on-failure',
    
    // 비디오 (실패 시에만)
    video: 'on-first-retry',
  },
  
  // 브라우저 프로젝트
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
    // 모바일 뷰포트
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  
  // 개발 서버 자동 시작
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
```

**선정 이유**: Playwright의 전체 설정 구조

**로직/흐름 설명**:
- `testDir`: 테스트 파일 위치
- `fullyParallel`: 테스트 병렬 실행
- `retries`: CI에서 실패 시 재시도
- `webServer`: 테스트 전 개발 서버 자동 시작
- `projects`: 멀티 브라우저 테스트 설정

**학습 포인트**:
- `reuseExistingServer`: 로컬에서 이미 실행 중인 서버 사용
- `trace`: 디버깅용 실행 기록

---

### 2. 페이지 객체 모델 (Login)
```typescript
/* tests/e2e/pages/LoginPage.ts:1-60 */
import { type Page, type Locator, expect } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator
  readonly registerLink: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel('이메일')
    this.passwordInput = page.getByLabel('비밀번호')
    this.submitButton = page.getByRole('button', { name: '로그인' })
    this.errorMessage = page.getByRole('alert')
    this.registerLink = page.getByRole('link', { name: '회원가입' })
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toContainText(message)
  }

  async expectLoggedIn() {
    // 로그인 성공 후 리다이렉트 확인
    await expect(this.page).not.toHaveURL('/login')
  }

  async expectLoggedOut() {
    await expect(this.page).toHaveURL('/login')
  }
}
```

**선정 이유**: Page Object Model 패턴

**로직/흐름 설명**:
- **Locator**: 요소 선택자를 속성으로 정의
- **메서드**: 페이지 동작을 캡슐화
- **expect 메서드**: 검증 로직 캡슐화

**테스트 영향**:
- 셀렉터 변경 시 페이지 객체만 수정
- 테스트 가독성 향상

**학습 포인트**:
- `getByLabel`, `getByRole`: 접근성 기반 셀렉터 (권장)
- `fill()` vs `type()`: fill은 기존 값 대체, type은 추가

---

### 3. 노트 페이지 객체
```typescript
/* tests/e2e/pages/NotesPage.ts:1-80 */
import { type Page, type Locator, expect } from '@playwright/test'

export class NotesPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly createButton: Locator
  readonly notesList: Locator
  readonly noteTitle: Locator
  readonly noteContent: Locator
  readonly saveButton: Locator
  readonly deleteButton: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.getByPlaceholder('검색')
    this.createButton = page.getByRole('button', { name: /새 노트|추가/ })
    this.notesList = page.getByTestId('notes-list')
    this.noteTitle = page.getByLabel('제목')
    this.noteContent = page.getByLabel('내용')
    this.saveButton = page.getByRole('button', { name: '저장' })
    this.deleteButton = page.getByRole('button', { name: '삭제' })
  }

  async goto() {
    await this.page.goto('/notes')
  }

  async createNote(title: string, content: string) {
    await this.createButton.click()
    await this.noteTitle.fill(title)
    await this.noteContent.fill(content)
    await this.saveButton.click()
  }

  async searchNotes(query: string) {
    await this.searchInput.fill(query)
    // 디바운스 대기
    await this.page.waitForTimeout(400)
  }

  async selectNote(title: string) {
    await this.page.getByRole('listitem').filter({ hasText: title }).click()
  }

  async deleteNote(title: string) {
    await this.selectNote(title)
    await this.deleteButton.click()
    // 확인 다이얼로그 처리
    await this.page.getByRole('button', { name: '확인' }).click()
  }

  async expectNoteVisible(title: string) {
    await expect(
      this.page.getByRole('listitem').filter({ hasText: title })
    ).toBeVisible()
  }

  async expectNoteNotVisible(title: string) {
    await expect(
      this.page.getByRole('listitem').filter({ hasText: title })
    ).not.toBeVisible()
  }

  async expectNoteCount(count: number) {
    await expect(this.page.getByRole('listitem')).toHaveCount(count)
  }
}
```

**선정 이유**: CRUD 테스트를 위한 페이지 객체

**로직/흐름 설명**:
- `getByTestId`: 테스트 전용 셀렉터 (data-testid 속성)
- `filter({ hasText })`: 텍스트로 요소 필터링
- `waitForTimeout`: 디바운스 대기 (검색)

---

### 4. 인증 E2E 테스트
```typescript
/* tests/e2e/auth.spec.ts:1-60 */
import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'

test.describe('인증', () => {
  test.describe('로그인', () => {
    test('올바른 자격증명으로 로그인 성공', async ({ page }) => {
      const loginPage = new LoginPage(page)
      
      await loginPage.goto()
      await loginPage.login('test@example.com', 'password123')
      
      await loginPage.expectLoggedIn()
      await expect(page).toHaveURL('/')
    })

    test('잘못된 비밀번호로 로그인 실패', async ({ page }) => {
      const loginPage = new LoginPage(page)
      
      await loginPage.goto()
      await loginPage.login('test@example.com', 'wrongpassword')
      
      await loginPage.expectErrorMessage('비밀번호가 올바르지 않습니다')
      await loginPage.expectLoggedOut()
    })

    test('존재하지 않는 이메일로 로그인 실패', async ({ page }) => {
      const loginPage = new LoginPage(page)
      
      await loginPage.goto()
      await loginPage.login('nonexistent@example.com', 'password123')
      
      await loginPage.expectErrorMessage('이메일 또는 비밀번호가 올바르지 않습니다')
    })

    test('빈 폼 제출 시 유효성 검사 에러', async ({ page }) => {
      const loginPage = new LoginPage(page)
      
      await loginPage.goto()
      await loginPage.submitButton.click()
      
      // HTML5 유효성 검사 또는 커스텀 에러 메시지
      await expect(loginPage.emailInput).toBeFocused()
    })
  })

  test.describe('로그아웃', () => {
    test('로그아웃 후 보호된 페이지 접근 불가', async ({ page }) => {
      const loginPage = new LoginPage(page)
      
      // 로그인
      await loginPage.goto()
      await loginPage.login('test@example.com', 'password123')
      await loginPage.expectLoggedIn()
      
      // 로그아웃
      await page.getByRole('button', { name: '로그아웃' }).click()
      
      // 보호된 페이지 접근 시도
      await page.goto('/notes')
      await expect(page).toHaveURL('/login')
    })
  })
})
```

**선정 이유**: E2E 테스트 구조와 페이지 객체 사용 예시

**로직/흐름 설명**:
- `test.describe`: 테스트 그룹화
- 페이지 객체 인스턴스 생성 후 메서드 호출
- `expect(page).toHaveURL()`: 라우팅 검증

**학습 포인트**:
- E2E 테스트는 사용자 관점에서 작성
- 페이지 객체로 테스트 코드 중복 감소

---

### 5. 노트 CRUD E2E 테스트
```typescript
/* tests/e2e/notes.spec.ts:1-80 */
import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { NotesPage } from './pages/NotesPage'

test.describe('노트', () => {
  // 각 테스트 전 로그인
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('test@example.com', 'password123')
    await loginPage.expectLoggedIn()
  })

  test('노트 생성', async ({ page }) => {
    const notesPage = new NotesPage(page)
    await notesPage.goto()
    
    await notesPage.createNote('테스트 노트', '테스트 내용입니다.')
    
    await notesPage.expectNoteVisible('테스트 노트')
  })

  test('노트 검색', async ({ page }) => {
    const notesPage = new NotesPage(page)
    await notesPage.goto()
    
    // 검색
    await notesPage.searchNotes('테스트')
    
    // 검색 결과 확인 (검색어와 일치하는 노트만 표시)
    await expect(
      page.getByRole('listitem').filter({ hasText: '테스트' })
    ).toBeVisible()
  })

  test('노트 수정', async ({ page }) => {
    const notesPage = new NotesPage(page)
    await notesPage.goto()
    
    // 노트 선택
    await notesPage.selectNote('테스트 노트')
    
    // 수정
    await notesPage.noteTitle.fill('수정된 제목')
    await notesPage.saveButton.click()
    
    // 수정 확인
    await notesPage.expectNoteVisible('수정된 제목')
  })

  test('노트 삭제', async ({ page }) => {
    const notesPage = new NotesPage(page)
    await notesPage.goto()
    
    // 현재 노트 수 확인
    const initialCount = await page.getByRole('listitem').count()
    
    // 삭제
    await notesPage.deleteNote('수정된 제목')
    
    // 삭제 확인
    await notesPage.expectNoteNotVisible('수정된 제목')
    await notesPage.expectNoteCount(initialCount - 1)
  })

  test('빈 제목으로 노트 생성 불가', async ({ page }) => {
    const notesPage = new NotesPage(page)
    await notesPage.goto()
    
    await notesPage.createButton.click()
    await notesPage.noteContent.fill('내용만 있는 노트')
    await notesPage.saveButton.click()
    
    // 유효성 검사 에러 확인
    await expect(page.getByText('제목을 입력해주세요')).toBeVisible()
  })
})
```

**선정 이유**: CRUD 시나리오 전체 테스트

**로직/흐름 설명**:
- `test.beforeEach`: 각 테스트 전 로그인 (공통 설정)
- 순차적 테스트: 생성 → 검색 → 수정 → 삭제
- 각 단계에서 결과 검증

## 재현 단계 (CLI 우선)

### CLI 명령어
```bash
# 1. Playwright 설치
npm install -D @playwright/test
npx playwright install

# 2. 브라우저 설치 (Chromium, Firefox, WebKit)
npx playwright install chromium firefox webkit

# 3. E2E 테스트 실행
npm run test:e2e

# 4. 특정 브라우저로만 실행
npx playwright test --project=chromium

# 5. UI 모드로 실행 (디버깅)
npx playwright test --ui

# 6. 특정 테스트 파일만 실행
npx playwright test auth.spec.ts

# 7. 테스트 리포트 보기
npx playwright show-report

# 8. 코드 생성기 (테스트 작성 도우미)
npx playwright codegen http://localhost:3000
```

### 구현 단계 (코드 작성 순서)
1. **Playwright 설치**: `npm install -D @playwright/test && npx playwright install`
2. **playwright.config.ts 작성**
3. **테스트 디렉토리 구조 생성**: `tests/e2e/`, `tests/e2e/pages/`
4. **페이지 객체 작성**: LoginPage.ts, NotesPage.ts
5. **E2E 테스트 작성**: auth.spec.ts, notes.spec.ts
6. **package.json 스크립트 추가**: `"test:e2e": "playwright test"`
7. **.gitignore 업데이트**: playwright-report, test-results 제외
8. **검증**: `npm run test:e2e`

## 설명

### 설계 결정
1. **Page Object Model**: 유지보수성과 재사용성 향상
2. **접근성 기반 셀렉터**: `getByRole`, `getByLabel` 우선 사용
3. **멀티 브라우저 테스트**: Chromium, Firefox, WebKit

### 트레이드오프
- **Playwright vs Cypress**: Playwright가 더 빠르고 멀티 브라우저 지원
- **data-testid vs 접근성 셀렉터**: 접근성 셀렉터가 더 견고하지만 때로 testid 필요

### 셀렉터 우선순위 (권장)
1. `getByRole()` — 접근성 역할
2. `getByLabel()` — 레이블 텍스트
3. `getByPlaceholder()` — placeholder
4. `getByText()` — 텍스트 내용
5. `getByTestId()` — 테스트 전용 (최후의 수단)

### 디렉토리 구조
```
tests/
└── e2e/
    ├── pages/           # 페이지 객체
    │   ├── LoginPage.ts
    │   ├── NotesPage.ts
    │   └── index.ts
    ├── fixtures.ts      # 공유 픽스처
    ├── auth.spec.ts     # 인증 테스트
    ├── notes.spec.ts    # 노트 테스트
    └── navigation.spec.ts
```

## 검증 체크리스트

### 자동 검증
```bash
npm run lint        # PASS
npm test -- --run   # 단위 테스트 통과
npm run test:e2e    # E2E 테스트 통과
npm run build       # 성공
```

### 수동 검증
- [ ] `npx playwright test --ui`로 테스트 실행 상태 확인
- [ ] `npx playwright show-report`로 리포트 확인
- [ ] 테스트 실패 시 스크린샷/비디오 생성 확인
- [ ] `npx playwright codegen`으로 셀렉터 확인

## 누락 정보
- 없음
