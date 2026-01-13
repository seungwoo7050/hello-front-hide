# Commit #2 — UI Kit 컴포넌트 및 Playground 구현

## Meta

- **난이도**: ⭐⭐ 초중급 (Beginner-Intermediate)
- **권장 커밋 메시지**: `feat: implement ui-kit components with playground demo`

---

## 학습 목표

1. `forwardRef` 패턴을 활용한 재사용 가능한 UI 컴포넌트를 설계할 수 있다
2. CSS 변수 기반 디자인 토큰 시스템을 구축하고 활용할 수 있다
3. `useId` 훅으로 접근성을 고려한 폼 컴포넌트를 구현할 수 있다
4. CSS Modules 환경에서 행동 기반 테스트 전략을 적용할 수 있다

---

## TL;DR

Button, Input, Card, Badge, Spinner 5개의 UI Kit 컴포넌트를 구현한다. 통합 디자인 토큰 시스템(`tokens.css`)을 구축하고, 모든 컴포넌트 상태를 시각적으로 확인할 수 있는 Playground 페이지를 만든다. CSS Modules 해싱으로 인한 테스트 실패를 행동 기반 테스트로 전환하여 해결한다.

---

## 배경/컨텍스트

### 왜 이 변경이 필요한가?

- **재사용성**: 일관된 UI를 위해 공통 컴포넌트 라이브러리 필요
- **접근성**: `forwardRef`, `useId`, ARIA 속성으로 접근성 기준 충족
- **디자인 시스템**: 색상, 스페이싱, 타이포그래피 토큰으로 일관성 확보
- **품질 보증**: 63개 테스트로 컴포넌트 동작 검증

### 영향 범위

- 새로운 UI Kit 컴포넌트 5개 추가
- 디자인 토큰 시스템 구축
- App.tsx가 Playground 페이지를 렌더링하도록 변경
- 테스트 수 5개 → 63개로 증가

---

## 변경 파일 목록

### 추가된 파일 (27개)

| 파일 | 설명 |
|------|------|
| `src/styles/tokens.css` | 디자인 토큰 시스템 |
| `src/components/ui/Button/*` | Button 컴포넌트 (4파일) |
| `src/components/ui/Input/*` | Input 컴포넌트 (4파일) |
| `src/components/ui/Card/*` | Card 컴포넌트 (4파일) |
| `src/components/ui/Badge/*` | Badge 컴포넌트 (4파일) |
| `src/components/ui/Spinner/*` | Spinner 컴포넌트 (4파일) |
| `src/components/ui/index.ts` | UI Kit 통합 export |
| `src/pages/Playground/*` | Playground 페이지 (3파일) |
| `docs/stage-1.md` | 학습 문서 |
| `docs/changes/stage-1.md` | 변경 로그 |

### 수정된 파일 (4개)

| 파일 | 변경 내용 |
|------|------|
| `src/index.css` | tokens.css import, 글로벌 스타일 정리 |
| `src/App.tsx` | Playground 페이지 렌더링으로 변경 |
| `src/App.test.tsx` | Playground 기반 테스트로 변경 |
| `docs/failures.md` | CSS Modules 해싱 실패 사례 추가 |

---

## 코드 스니펫

### 1. tokens.css — 디자인 토큰 시스템

**선택 이유**: 디자인 시스템의 핵심으로, 모든 컴포넌트가 참조하는 중앙 집중화된 스타일 변수

```css
/* src/styles/tokens.css:1..80 */
:root {
  /* 색상 팔레트 - Primary */
  --color-primary-50: #eef2ff;
  --color-primary-100: #e0e7ff;
  --color-primary-200: #c7d2fe;
  --color-primary-300: #a5b4fc;
  --color-primary-400: #818cf8;
  --color-primary-500: #6366f1;
  --color-primary-600: #4f46e5;
  --color-primary-700: #4338ca;
  --color-primary-800: #3730a3;
  --color-primary-900: #312e81;

  /* 색상 팔레트 - Gray */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;

  /* 시맨틱 색상 */
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-info-500: #3b82f6;
  --color-info-600: #2563eb;

  /* 스페이싱 */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;

  /* 타이포그래피 */
  --font-family-base: system-ui, -apple-system, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* 보더 & 그림자 */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-full: 9999px;
  
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* 포커스 & 트랜지션 */
  --focus-ring-width: 2px;
  --focus-ring-color: var(--color-primary-500);
  --focus-ring-offset: 2px;
  --transition-fast: 150ms ease;
}
```

**로직 설명**:
- 색상 팔레트: 50-900 스케일로 명도 단계 정의
- 시맨틱 색상: success, warning, error, info로 의미 기반 색상
- 스페이싱: 4px 기반 시스템 (0.25rem = 4px)

**학습 노트**: CSS 변수 네이밍은 `--카테고리-세부사항` 패턴 사용. 다크 모드 전환 시 시맨틱 색상만 재정의하면 됨.

---

### 2. Button.tsx — forwardRef 패턴

**선택 이유**: 재사용 가능한 컴포넌트의 표준 패턴으로, ref 전달과 타입 안전성 확보

```tsx
/* src/components/ui/Button/Button.tsx:1..63 */
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'small' | 'medium' | 'large'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼 스타일 변형 */
  variant?: ButtonVariant
  /** 버튼 크기 */
  size?: ButtonSize
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean
  /** 로딩 상태 */
  loading?: boolean
}

/**
 * Button 컴포넌트
 * 
 * 다양한 변형과 상태를 지원하는 기본 버튼 컴포넌트
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.button,
      styles[variant],
      size !== 'medium' && styles[size],
      fullWidth && styles.fullWidth,
      loading && styles.loading,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <span className={styles.spinner} aria-hidden="true" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

**로직 설명**:
- `forwardRef<HTMLButtonElement, ButtonProps>`: 타입 안전한 ref 전달
- `filter(Boolean).join(' ')`: 조건부 클래스명 조합
- `disabled={disabled || loading}`: 로딩 중 클릭 방지
- `aria-busy={loading}`: 스크린 리더에 로딩 상태 전달
- `displayName`: DevTools에서 컴포넌트 이름 표시

**빌드/테스트 영향**: CSS Modules 해싱으로 클래스명이 `_primary_abc123` 형태로 변환됨

---

### 3. Input.tsx — useId 훅 활용

**선택 이유**: React 19 순수성 규칙을 준수하면서 접근성을 보장하는 ID 생성 방법

```tsx
/* src/components/ui/Input/Input.tsx:1..95 */
import { type InputHTMLAttributes, forwardRef, type ReactNode, useId } from 'react'
import styles from './Input.module.css'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 라벨 텍스트 */
  label?: string
  /** 에러 메시지 */
  error?: string
  /** 도움말 텍스트 */
  helperText?: string
  /** 왼쪽 아이콘 */
  leftIcon?: ReactNode
  /** 오른쪽 아이콘 */
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
      id,
      ...props
    },
    ref
  ) => {
    // React 18+ useId 훅으로 안정적인 id 생성
    const generatedId = useId()
    const inputId = id || generatedId
    const errorId = error ? `${inputId}-error` : undefined
    const helperId = helperText && !error ? `${inputId}-helper` : undefined

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.inputWrapper}>
          {leftIcon && (
            <span className={styles.leftIcon} aria-hidden="true">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputClassNames}
            aria-invalid={!!error}
            aria-describedby={errorId || helperId}
            {...props}
          />
          {rightIcon && (
            <span className={styles.rightIcon} aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <span id={errorId} className={styles.errorMessage} role="alert">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

**로직 설명**:
- `useId()`: SSR에서도 안정적인 고유 ID 생성 (Math.random() 대체)
- `Omit<..., 'size'>`: HTML input의 size 속성과 충돌 방지
- `aria-invalid`, `aria-describedby`: 에러 상태의 접근성 지원
- `role="alert"`: 에러 메시지를 스크린 리더가 즉시 읽음

**학습 노트**: `useId`는 React 18+에서 도입된 훅으로, 컴포넌트 렌더링 중 불순 함수(`Math.random()`) 호출을 피할 수 있음.

---

### 4. Button.test.tsx — 행동 기반 테스트

**선택 이유**: CSS Modules 환경에서 클래스명 대신 사용자 동작을 검증하는 테스트 전략

```tsx
/* src/components/ui/Button/Button.test.tsx:1..99 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button 컴포넌트', () => {
  describe('렌더링', () => {
    it('기본 버튼이 정상적으로 렌더링되어야 한다', () => {
      render(<Button>클릭</Button>)
      expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument()
    })

    it('secondary 변형 버튼이 렌더링되어야 한다', () => {
      render(<Button variant="secondary">버튼</Button>)
      expect(screen.getByRole('button', { name: '버튼' })).toBeInTheDocument()
    })
  })

  describe('상호작용', () => {
    it('클릭 이벤트가 발생해야 한다', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button onClick={handleClick}>클릭</Button>)
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('disabled 상태에서는 클릭이 불가능해야 한다', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button disabled onClick={handleClick}>비활성</Button>)
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('loading 상태에서는 클릭이 불가능해야 한다', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button loading onClick={handleClick}>로딩</Button>)
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('접근성', () => {
    it('loading 상태에서 aria-busy가 true여야 한다', () => {
      render(<Button loading>로딩 중</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    })

    it('키보드로 버튼을 활성화할 수 있어야 한다', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      
      render(<Button onClick={handleClick}>키보드 테스트</Button>)
      const button = screen.getByRole('button')
      
      button.focus()
      await user.keyboard('{Enter}')
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })
})
```

**로직 설명**:
- `screen.getByRole('button')`: 역할 기반 쿼리로 접근성 친화적 테스트
- `vi.fn()`: Vitest의 mock 함수
- `userEvent.setup()`: 실제 사용자 상호작용 시뮬레이션
- 클래스명(`toHaveClass`) 대신 동작(`toHaveBeenCalled`) 검증

**학습 노트**: CSS Modules가 클래스명을 해싱하므로 `toHaveClass('primary')`는 실패함. 행동 기반 테스트가 더 견고함.

---

### 5. Card.tsx — 서브 컴포넌트 패턴

**선택 이유**: 복합 컴포넌트의 구성 요소를 명확히 분리하는 설계 패턴

```tsx
/* src/components/ui/Card/Card.tsx:60..103 */
/* Card 서브 컴포넌트들 */

export interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={`${styles.header} ${className || ''}`}>
      <div>
        <h3 className={styles.headerTitle}>{title}</h3>
        {subtitle && <p className={styles.headerSubtitle}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export interface CardBodyProps {
  children: ReactNode
  className?: string
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={`${styles.body} ${className || ''}`}>{children}</div>
}

export interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={`${styles.footer} ${className || ''}`}>{children}</div>
}
```

**사용 예시**:
```tsx
<Card variant="elevated">
  <CardHeader title="제목" subtitle="부제목" />
  <CardBody>본문 내용</CardBody>
  <CardFooter>
    <Button>확인</Button>
  </CardFooter>
</Card>
```

**학습 노트**: 서브 컴포넌트 패턴은 합성(Composition)을 활용하여 유연한 레이아웃 구성 가능.

---

## 재현 단계 (CLI 우선)

### 사전 요구사항
- Commit #1 완료 상태

### 1. 디렉토리 구조 생성

```bash
# UI 컴포넌트 디렉토리 생성
mkdir -p src/components/ui/{Button,Input,Card,Badge,Spinner}
mkdir -p src/pages/Playground
mkdir -p src/styles
```

### 2. 디자인 토큰 파일 생성

```bash
# tokens.css 생성 후 index.css에서 import
touch src/styles/tokens.css
```

### 3. 구현 단계 (코드 작성 순서)

1. **src/styles/tokens.css**: 디자인 토큰 정의 (색상, 스페이싱, 타이포그래피)
2. **src/index.css**: tokens.css import, 글로벌 스타일 정리
3. **Button 컴포넌트**: Button.tsx, Button.module.css, Button.test.tsx, index.ts
4. **Input 컴포넌트**: useId 훅 활용, 에러/도움말 지원
5. **Card 컴포넌트**: 서브 컴포넌트 패턴 (Header, Body, Footer)
6. **Badge 컴포넌트**: 6가지 색상 변형, 도트 옵션
7. **Spinner 컴포넌트**: 크기/색상 변형, fullPage 모드
8. **src/components/ui/index.ts**: 통합 export
9. **Playground 페이지**: 모든 컴포넌트 상태 시연
10. **App.tsx 수정**: Playground 렌더링

### 4. 품질 게이트 검증

```bash
# 린트 검사
npm run lint

# 테스트 실행 (63개 테스트)
npm test -- --run

# 빌드 검증
npm run build

# 개발 서버에서 Playground 확인
npm run dev
```

---

## 설명

### 설계 고려사항

1. **forwardRef**: 모든 UI 컴포넌트에 적용하여 부모에서 DOM 접근 가능
2. **useId**: SSR 호환성과 React 순수성 규칙 준수
3. **CSS Modules**: 스타일 캡슐화로 전역 충돌 방지

### 트레이드오프

| 선택 | 장점 | 단점 |
|------|------|------|
| CSS Modules | 스타일 캡슐화, 제로 런타임 | 클래스명 해싱으로 테스트 어려움 |
| 행동 기반 테스트 | 리팩토링에 강함 | 시각적 변화 검증 불가 |
| 서브 컴포넌트 패턴 | 유연한 합성 | 복잡도 증가 |

### 잠재적 위험

- **CSS Modules 해싱**: 클래스명 직접 검증 불가 → 행동 기반 테스트로 전환
- **useId 미지원**: React 18 미만에서는 사용 불가
- **디자인 토큰 중복**: index.css와 tokens.css 중복 정의 주의

---

## 검증 체크리스트

- [ ] `npm run lint` 실행 시 에러 없음
- [ ] `npm test -- --run` 실행 시 63개 테스트 통과
- [ ] `npm run build` 실행 시 빌드 성공
- [ ] Playground 페이지에서 Button 3가지 변형 확인
- [ ] Tab 키로 모든 버튼 포커스 이동 가능
- [ ] Input 에러 상태에서 빨간 테두리와 에러 메시지 표시
- [ ] 로딩 버튼 클릭 시 스피너 표시
- [ ] Card elevated/outlined 변형 확인
- [ ] Badge 6가지 색상 변형 확인

### 예상 결과

```bash
# npm test -- --run 출력 예시
 ✓ src/App.test.tsx (5 tests)
 ✓ src/components/ui/Button/Button.test.tsx (13 tests)
 ✓ src/components/ui/Input/Input.test.tsx (11 tests)
 ✓ src/components/ui/Card/Card.test.tsx (12 tests)
 ✓ src/components/ui/Badge/Badge.test.tsx (9 tests)
 ✓ src/components/ui/Spinner/Spinner.test.tsx (13 tests)

Test Files  6 passed (6)
Tests       63 passed (63)
```

---

## 누락 정보

이 가이드는 `study/commit-summary/commit_2_summary.txt`를 기반으로 작성되었으며:

- ✅ 커밋 해시: `1ba37eba72cd0ee2f102e496bffb1d4f8d0e2aa8`
- ✅ 변경 파일 목록: 33개 파일
- ✅ 테스트 결과: 63개 테스트 통과

**핵심 학습 포인트**:
- CSS Modules 해싱으로 인한 테스트 실패 → 행동 기반 테스트로 전환
- React 19 순수성 규칙 → `useId()` 훅 사용
- 디자인 토큰 중복 → `tokens.css`로 통합

**참고 파일**:
- [src/styles/tokens.css](../src/styles/tokens.css)
- [src/components/ui/Button/Button.tsx](../src/components/ui/Button/Button.tsx)
- [src/components/ui/Input/Input.tsx](../src/components/ui/Input/Input.tsx)
- [src/pages/Playground/Playground.tsx](../src/pages/Playground/Playground.tsx)
