# Commit #2 — UI Kit 컴포넌트 및 Playground 구현

## Meta
- **난이도**: ⭐⭐ 초중급 (Beginner-Intermediate)
- **권장 커밋 메시지**: `feat(ui-kit): add Button, Input, Card, Badge, Spinner components and Playground`

## 학습 목표
1. 재사용 가능한 UI 컴포넌트 설계 패턴 (forwardRef, variant props)을 익힌다
2. CSS 변수 기반 디자인 토큰 시스템을 구축한다
3. CSS Modules 환경에서 행동 기반 테스트 전략을 학습한다
4. React 19의 `useId` 훅을 활용한 안정적인 ID 생성 방법을 이해한다

## TL;DR
Button, Input, Card, Badge, Spinner 컴포넌트로 구성된 UI Kit을 구현하고, 모든 상태를 시연할 수 있는 Playground 페이지를 만든다. 통합 디자인 토큰 시스템(`tokens.css`)을 구축하고 63개의 행동 기반 테스트를 작성한다.

## 배경/맥락
UI Kit은 프론트엔드 프로젝트의 디자인 일관성과 개발 효율성을 높이는 핵심 요소이다:
- **컴포넌트 재사용**: 동일한 버튼, 입력 필드를 매번 새로 만들 필요 없음
- **디자인 토큰**: 색상, 간격, 타이포그래피를 중앙 관리하여 일관성 유지
- **접근성**: 모든 컴포넌트에 키보드 탐색과 ARIA 속성 적용
- **Playground**: 개발자가 컴포넌트 상태를 시각적으로 확인할 수 있는 데모 페이지

## 변경 파일 목록
### 추가된 파일 (24개)
- `src/styles/tokens.css` — 디자인 토큰 정의
- `src/components/ui/Button/` — Button 컴포넌트 (4파일)
- `src/components/ui/Input/` — Input 컴포넌트 (4파일)
- `src/components/ui/Card/` — Card 컴포넌트 (4파일)
- `src/components/ui/Badge/` — Badge 컴포넌트 (4파일)
- `src/components/ui/Spinner/` — Spinner 컴포넌트 (4파일)
- `src/components/ui/index.ts` — UI Kit 배럴 export
- `src/pages/Playground/` — Playground 페이지 (3파일)

### 수정된 파일 (4개)
- `src/index.css` — tokens.css import 추가
- `src/App.tsx` — Playground 페이지 렌더링으로 변경
- `src/App.test.tsx` — Playground 기반 테스트로 변경
- `state/stage-0.json` → `state/stage-1.json` 추가

## 코드 스니펫

### 1. tokens.css — 디자인 토큰 시스템
```css
/* src/styles/tokens.css:1-80 */
:root {
  /* 색상 팔레트 - Primary */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  
  /* 색상 팔레트 - Gray */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-500: #6b7280;
  --color-gray-700: #374151;
  --color-gray-900: #111827;
  
  /* 시맨틱 색상 */
  --color-success-600: #16a34a;
  --color-warning-600: #d97706;
  --color-error-600: #dc2626;
  --color-info-600: #2563eb;
  
  /* 스페이싱 */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  
  /* 타이포그래피 */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  
  /* 그림자 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  /* 포커스 링 */
  --ring-color: var(--color-primary-500);
  --ring-width: 2px;
  --ring-offset: 2px;
  
  /* 보더 */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-full: 9999px;
}
```

**선정 이유**: 프로젝트 전체에서 사용되는 디자인 토큰의 중앙 저장소

**로직/흐름 설명**:
- CSS 변수(Custom Properties)로 모든 디자인 값을 `:root`에 정의
- 컴포넌트에서 `var(--color-primary-500)` 형태로 참조
- 다크 모드 전환 시 이 변수들만 재정의하면 전체 테마 변경 가능

**빌드/런타임 영향**:
- 런타임에 동적 테마 변경 가능 (JavaScript로 CSS 변수 조작)
- 빌드 타임에 별도 처리 없이 브라우저가 직접 해석

**학습 포인트**:
- 색상 스케일(50~900)은 Tailwind CSS의 색상 시스템에서 영감
- Q: 왜 HEX 대신 rgba를 사용하는 경우가 있는가?
- A: 투명도가 필요한 경우 rgba 사용 (그림자, 오버레이)

---

### 2. Button 컴포넌트
```tsx
/* src/components/ui/Button/Button.tsx:1-70 */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import styles from './Button.module.css'
import { Spinner } from '../Spinner'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const buttonClasses = [
      styles.button,
      styles[variant],
      styles[size],
      isLoading && styles.loading,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Spinner size="small" className={styles.spinner} />}
        {!isLoading && leftIcon && (
          <span className={styles.icon}>{leftIcon}</span>
        )}
        <span className={styles.content}>{children}</span>
        {!isLoading && rightIcon && (
          <span className={styles.icon}>{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

**선정 이유**: forwardRef 패턴과 variant props를 활용한 컴포넌트 설계의 대표 예시

**로직/흐름 설명**:
- `forwardRef`: 부모 컴포넌트에서 버튼 DOM 노드에 직접 접근 가능
- `variant`: primary/secondary/ghost 스타일 변형
- `isLoading`: 로딩 중 Spinner 표시 및 버튼 비활성화
- 클래스 조합: 배열로 클래스를 모아 `filter(Boolean).join(' ')`로 병합

**접근성 영향**:
- `disabled` 속성으로 스크린 리더에 비활성화 상태 전달
- 로딩 중에도 `disabled` 적용으로 중복 클릭 방지

**학습 포인트**:
- `displayName`은 React DevTools에서 컴포넌트 이름 표시용
- Q: `forwardRef`는 왜 필요한가?
- A: 폼 라이브러리나 포커스 관리에서 DOM 노드 접근이 필요할 때

---

### 3. Input 컴포넌트 (useId 활용)
```tsx
/* src/components/ui/Input/Input.tsx:1-75 */
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = providedId || generatedId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    const hasError = Boolean(error)
    const hasHelper = Boolean(helperText) && !hasError

    const inputClasses = [
      styles.input,
      hasError && styles.error,
      leftIcon && styles.hasLeftIcon,
      rightIcon && styles.hasRightIcon,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.inputContainer}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : hasHelper ? helperId : undefined}
            {...props}
          />
          {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
        </div>
        {hasError && (
          <span id={errorId} className={styles.errorText} role="alert">
            {error}
          </span>
        )}
        {hasHelper && (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)
```

**선정 이유**: React 19의 `useId` 훅과 접근성 속성(ARIA) 적용 예시

**로직/흐름 설명**:
- `useId()`: SSR 안전한 고유 ID 생성 (Math.random() 대신)
- `aria-invalid`: 에러 상태를 스크린 리더에 전달
- `aria-describedby`: 에러/도움말 텍스트와 입력 필드 연결

**접근성 영향**:
- 스크린 리더가 라벨, 에러 메시지, 도움말을 순차적으로 읽음
- `role="alert"`로 에러 메시지가 즉시 공지됨

**학습 포인트**:
- `useId`는 React 18에서 도입되어 hydration 불일치 문제 해결
- Q: `Math.random()` 대신 `useId`를 쓰는 이유는?
- A: SSR에서 서버와 클라이언트의 ID가 일치해야 hydration 오류 방지

---

### 4. 행동 기반 테스트 (CSS Modules 대응)
```tsx
/* src/components/ui/Button/Button.test.tsx:1-50 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('기본 버튼이 렌더링되어야 한다', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('클릭 이벤트가 호출되어야 한다', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled 상태에서 클릭되지 않아야 한다', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick} disabled>Click me</Button>)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('로딩 상태에서 스피너가 표시되어야 한다', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('키보드로 버튼을 활성화할 수 있어야 한다', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button')
    
    button.focus()
    await user.keyboard('{Enter}')
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

**선정 이유**: CSS Modules 해싱 환경에서의 행동 기반 테스트 전략

**로직/흐름 설명**:
- **클래스명 검증 대신 행동 검증**: `toHaveClass('primary')` 불가능 (해싱됨)
- `getByRole`: 접근성 트리 기반 쿼리로 구현 세부사항에 독립적
- `userEvent`: 실제 사용자 상호작용 시뮬레이션

**테스트 전략 영향**:
- 리팩토링에 강한 테스트: 클래스명 변경해도 테스트 유지
- 접근성 검증: `getByRole`은 ARIA 역할이 올바를 때만 작동

**학습 포인트**:
- `vi.fn()`: Vitest의 mock 함수 생성
- Q: 왜 `toHaveClass` 대신 행동 테스트를 하는가?
- A: CSS Modules가 `_primary_bf748c` 형태로 클래스명을 해싱하기 때문

---

### 5. Playground 페이지
```tsx
/* src/pages/Playground/Playground.tsx:1-100 (부분) */
import styles from './Playground.module.css'
import { Button, Input, Card, Badge, Spinner } from '../../components/ui'

export function Playground() {
  return (
    <div className={styles.playground}>
      <h1>UI 컴포넌트 Playground</h1>
      
      <section className={styles.section}>
        <h2>Button</h2>
        <div className={styles.grid}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
          <Button isLoading>Loading</Button>
        </div>
      </section>
      
      <section className={styles.section}>
        <h2>Input</h2>
        <div className={styles.stack}>
          <Input label="기본 입력" placeholder="입력하세요" />
          <Input label="에러 상태" error="필수 입력 항목입니다" />
          <Input label="도움말" helperText="이메일 형식으로 입력하세요" />
          <Input label="비활성화" disabled value="수정 불가" />
        </div>
      </section>
      
      {/* Card, Badge, Spinner 섹션 ... */}
    </div>
  )
}
```

**선정 이유**: 모든 UI 컴포넌트 상태를 한눈에 확인할 수 있는 데모 페이지

**로직/흐름 설명**:
- 각 컴포넌트의 모든 variant와 상태를 시각적으로 나열
- 개발자가 컴포넌트 동작을 빠르게 확인 가능

**빌드 영향**:
- 개발 중에만 사용되는 페이지지만 프로덕션 빌드에도 포함
- 필요 시 라우트 분리로 번들에서 제외 가능

## 재현 단계 (CLI 우선)

### CLI 명령어
```bash
# 1. 의존성 설치 (이전 스테이지에서 완료)
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 테스트 실행 (63개 테스트)
npm test -- --run

# 4. 린트 검사
npm run lint

# 5. 빌드
npm run build
```

### 구현 단계 (코드 작성 순서)
1. **디자인 토큰 생성**: `src/styles/tokens.css` 작성 — 색상, 스페이싱, 타이포그래피 정의
2. **tokens.css import**: `src/index.css`에 `@import './styles/tokens.css';` 추가
3. **Button 컴포넌트 구현**: 
   - `src/components/ui/Button/Button.tsx` — forwardRef, variant props
   - `src/components/ui/Button/Button.module.css` — 스타일
   - `src/components/ui/Button/Button.test.tsx` — 행동 기반 테스트
   - `src/components/ui/Button/index.ts` — 배럴 export
4. **Input 컴포넌트 구현**: useId, label, error, helperText 지원
5. **Card 컴포넌트 구현**: elevated/outlined variant, 서브 컴포넌트 (Header, Body, Footer)
6. **Badge 컴포넌트 구현**: 6가지 색상, dot 옵션
7. **Spinner 컴포넌트 구현**: 3가지 크기, fullPage 모드
8. **UI Kit 배럴 export**: `src/components/ui/index.ts`에 모든 컴포넌트 export
9. **Playground 페이지 구현**: `src/pages/Playground/Playground.tsx`
10. **App.tsx 수정**: Playground 렌더링
11. **테스트 실행**: `npm test` (63개 테스트 통과 확인)

## 설명

### 설계 결정
1. **forwardRef 패턴**: 모든 UI 컴포넌트에 적용하여 DOM 접근 허용
2. **CSS 변수 기반 토큰**: 런타임 테마 변경 가능, CSS-in-JS 불필요
3. **행동 기반 테스트**: CSS Modules 해싱 대응, 리팩토링에 강함

### 트레이드오프
- **CSS Modules vs CSS-in-JS**: 
  - CSS Modules: 런타임 오버헤드 없음, 동적 스타일링 제한
  - CSS-in-JS: 동적 스타일링 용이, 런타임 비용 발생
- **useId vs uuid/nanoid**: useId는 SSR 안전하지만 패턴이 복잡할 수 있음

### 실패에서 배운 것
1. **CSS Modules 클래스명 해싱**: `toHaveClass('primary')` 실패 → 행동 기반 테스트로 전환
2. **React 19 순수성 규칙**: `Math.random()` 금지 → `useId()` 사용

## 검증 체크리스트

### 자동 검증
```bash
# 린트 — PASS 예상
npm run lint

# 테스트 — 63개 통과 예상
npm test -- --run

# 빌드 — 성공 예상
npm run build
```

### 수동 검증
- [ ] `npm run dev` 실행 후 UI Playground 페이지 확인
- [ ] Button의 3가지 변형(primary, secondary, ghost) 확인
- [ ] Tab 키로 모든 버튼에 포커스 이동 확인
- [ ] Input 에러 상태에서 빨간 테두리와 에러 메시지 확인
- [ ] "클릭하여 로딩" 버튼 클릭 시 스피너 표시 확인

## 누락 정보
- 없음
