# Commit #14 — 코드 포맷팅 표준화

## Meta
| 항목 | 내용 |
|------|------|
| 커밋 해시 | `345ebed68c08606be8d6d06980c36c7354c09d83` |
| 부모 커밋 | `49bd3801f2d241d439ce017527deed3ec85a019a` |
| 난이도 | ⭐⭐ (초급) |
| 관련 기술 | Prettier, ESLint, Code Style, Refactoring |
| 커밋 메시지 | refactor: standardize code formatting and remove unnecessary semicolons |

## 학습 목표
1. Prettier를 활용한 일관된 코드 스타일 적용
2. 불필요한 세미콜론 제거 및 코드 정리
3. import 문 정렬 및 포맷팅 표준화
4. 대규모 리팩토링 시 코드 동작 유지 확인

## TL;DR
> 프로젝트 전체에 Prettier를 적용하여 코드 스타일을 표준화한다. 불필요한 세미콜론 제거, import 문 정렬, JSX 포맷팅 일관성 등을 통해 코드 가독성을 개선한다. 기능 변경 없이 코드 형식만 변경하는 리팩토링 커밋이다.

## 배경 / 컨텍스트
- **코드 스타일 불일치**: 여러 개발자가 작업하면서 코드 스타일이 혼재됨
- **세미콜론 정책**: JavaScript/TypeScript에서 세미콜론 생략 가능 (ASI)
- **Prettier 도입 효과**: 코드 리뷰 시 스타일 논쟁 제거, 일관된 코드베이스 유지
- **리팩토링 안전성**: 테스트가 통과하면 기능 변경 없이 포맷팅만 변경됨을 보장

## 변경 파일 목록

이 커밋은 **150개 이상의 파일**을 수정했습니다. 주요 변경 카테고리:

| 카테고리 | 파일 예시 | 변경 내용 |
|----------|-----------|-----------|
| API 레이어 | `src/api/client.ts`, `notes.ts` | 세미콜론 제거, 타입 정렬 |
| 컴포넌트 | `src/components/**/*.tsx` | JSX 포맷팅, import 정렬 |
| 테스트 파일 | `src/**/*.test.tsx` | expect 문 줄바꿈 |
| 스토어 | `src/stores/**/*` | export 문 표준화 |
| 훅 | `src/hooks/*` | 함수 시그니처 정렬 |
| 페이지 | `src/pages/**/*` | CSS import 순서 |
| 스타일 | `src/**/*.css` | CSS 변수 정렬 |

## 코드 스니펫

### 1. API 클라이언트 - 세미콜론 및 타입 정렬
```typescript
// Before (src/api/client.ts)
import { getAccessToken } from '../features/auth/tokenStorage';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// After (src/api/client.ts)
import { getAccessToken } from '../features/auth/tokenStorage'

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}
```

### 2. App 컴포넌트 - Promise 체이닝 포맷팅
```typescript
// Before (src/App.tsx)
useEffect(() => {
  import('./mocks/browser').then(({ worker }) => {
    worker.start({
      onUnhandledRequest: 'bypass',
    });
  }).catch(err => console.error('MSW setup failed:', err));
}, []);

// After (src/App.tsx)
useEffect(() => {
  import('./mocks/browser')
    .then(({ worker }) => {
      worker.start({
        onUnhandledRequest: 'bypass',
      })
    })
    .catch((err) => console.error('MSW setup failed:', err))
}, [])
```

### 3. 테스트 파일 - expect 문 포맷팅
```typescript
// Before (src/App.test.tsx)
it('메인 네비게이션이 표시되어야 한다', () => {
  render(<App />)
  expect(screen.getByRole('navigation', { name: '메인 네비게이션' })).toBeInTheDocument()
})

// After (src/App.test.tsx)
it('메인 네비게이션이 표시되어야 한다', () => {
  render(<App />)
  expect(
    screen.getByRole('navigation', { name: '메인 네비게이션' })
  ).toBeInTheDocument()
})
```

### 4. 타입 export 표준화
```typescript
// Before (src/features/auth/types.ts)
export type { User, AuthTokens, LoginCredentials };

// After (src/features/auth/types.ts)
export type { User, AuthTokens, LoginCredentials }
```

### 5. CSS 변수 정렬
```css
/* Before (src/styles/tokens.css) */
:root {
  --color-primary: #007bff;--color-secondary: #6c757d;
  --spacing-sm: 8px;--spacing-md: 16px;
}

/* After (src/styles/tokens.css) */
:root {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --spacing-sm: 8px;
  --spacing-md: 16px;
}
```

### 6. Index 파일 export 정리
```typescript
// Before (src/components/layout/index.ts)
export { AppLayout } from './AppLayout';
export { Header } from './Header';
export { Sidebar } from './Sidebar';
export { Main } from './Main';
export { Footer } from './Footer';

// After (src/components/layout/index.ts)
export { AppLayout } from './AppLayout'
export { Header } from './Header'
export { Sidebar } from './Sidebar'
export { Main } from './Main'
export { Footer } from './Footer'
```

## 재현 단계 (CLI 우선)

### Step 1: Prettier 설정 확인
```bash
# .prettierrc 또는 package.json에 prettier 설정 확인
cat package.json | grep -A 10 "prettier"
```

### Step 2: 현재 포맷 상태 확인
```bash
# 포맷팅이 필요한 파일 확인
npm run format:check
```

### Step 3: 전체 코드 포맷팅 실행
```bash
# Prettier로 모든 파일 포맷팅
npm run format
```

### Step 4: 변경사항 확인
```bash
# git diff로 변경된 파일 확인
git diff --stat
git diff src/api/client.ts  # 특정 파일 상세 확인
```

### Step 5: 테스트 실행으로 동작 확인
```bash
# 모든 테스트가 통과하는지 확인
npm run test -- --run
```

### Step 6: 린트 확인
```bash
# ESLint 규칙도 통과하는지 확인
npm run lint
```

### Step 7: 커밋
```bash
git add .
git commit -m "refactor: standardize code formatting and remove unnecessary semicolons"
```

## 상세 설명

### Prettier 주요 설정 옵션

```json
{
  "semi": false,           // 세미콜론 생략
  "singleQuote": true,     // 작은따옴표 사용
  "trailingComma": "es5",  // ES5 호환 trailing comma
  "printWidth": 80,        // 줄 너비 제한
  "tabWidth": 2,           // 탭 크기
  "jsxSingleQuote": false  // JSX에서 큰따옴표
}
```

### 세미콜론 생략 장단점

**장점**
- 코드가 더 깔끔해 보임
- JavaScript 언어 특성상 대부분 안전
- 현대적인 스타일 트렌드

**단점**
- ASI(Automatic Semicolon Insertion) 예외 상황 존재
- 팀 컨벤션에 따라 선호도 다름

**ASI 주의 사항**
```typescript
// 위험한 경우 (세미콜론 필요)
const a = 1
[1, 2, 3].map(x => x * 2)  // Error! a[1, 2, 3]으로 해석됨

// 안전한 경우
const a = 1;
[1, 2, 3].map(x => x * 2)  // OK
```

### 대규모 포맷팅 커밋 전략

1. **별도 커밋으로 분리**
   - 기능 변경과 포맷팅 변경을 섞지 않음
   - 코드 리뷰 및 git blame 추적 용이

2. **CI 파이프라인 통과 확인**
   - 포맷팅만 변경해도 테스트는 반드시 통과해야 함
   - lint, test, build 모두 확인

3. **점진적 적용 vs 일괄 적용**
   - 일괄 적용: 한 번에 모든 파일 포맷팅 (이 커밋의 방식)
   - 점진적 적용: 수정하는 파일만 포맷팅

### 변경 파일 수 분석

```
150+ 파일 수정
├── src/components/     (40+ 파일)
├── src/features/       (30+ 파일)
├── src/pages/          (25+ 파일)
├── src/hooks/          (10+ 파일)
├── src/stores/         (10+ 파일)
├── src/api/            (5+ 파일)
├── src/mocks/          (5+ 파일)
└── 기타                (25+ 파일)
```

### ESLint + Prettier 통합

```javascript
// eslint.config.js
import prettier from 'eslint-config-prettier'

export default [
  // ... other configs
  prettier, // Prettier와 충돌하는 ESLint 규칙 비활성화
]
```

## 검증 체크리스트
- [ ] `npm run format:check`가 통과하는가?
- [ ] `npm run lint`가 통과하는가?
- [ ] `npm run test -- --run`이 모두 통과하는가?
- [ ] `npm run build`가 성공하는가?
- [ ] 기능 동작이 변경 전과 동일한가?
- [ ] 모든 파일에서 세미콜론이 일관되게 처리되었는가?

## 누락 정보
| 항목 | 설명 | 대안 |
|------|------|------|
| Prettier 설정 파일 | 구체적인 .prettierrc 내용 미확인 | package.json 또는 별도 파일 확인 필요 |
| 테스트 수 | 변경 후 정확한 테스트 수 미기재 | 이전 커밋 기준 약 408개 |
| 포맷팅 자동화 | pre-commit hook 설정 여부 | husky + lint-staged 권장 |

---

## 학습 포인트 요약

1. **코드 스타일 일관성**: Prettier로 팀 전체의 코드 스타일 통일
2. **리팩토링 안전성**: 테스트가 통과하면 기능 변경 없음을 보장
3. **세미콜론 정책**: 프로젝트별로 일관된 정책 선택 중요
4. **대규모 변경 전략**: 포맷팅 커밋은 기능 커밋과 분리
5. **자동화**: format:check를 CI에 포함하여 스타일 회귀 방지

## 관련 npm 스크립트
```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\""
  }
}
```
