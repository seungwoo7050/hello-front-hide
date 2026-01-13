# Commit #4 — 폼 컴포넌트, useForm 훅, 유효성 검사, Toast 시스템 구현

## Meta
- **난이도**: ⭐⭐⭐ 중급 (Intermediate)
- **권장 커밋 메시지**: `feat(forms): add useForm hook, validation, Toast system, and form components`

## 학습 목표
1. 제네릭 타입을 활용한 `useForm` 커스텀 훅을 설계하고 구현한다
2. 선언적 유효성 검사 규칙(required, email, minLength 등)을 구현한다
3. Context API를 사용한 Toast 알림 시스템을 구축한다
4. Textarea, Select, Checkbox 등 폼 컴포넌트를 만든다

## TL;DR
`useForm` 훅으로 폼 상태(values, errors, touched, isSubmitting)를 관리하고, 9가지 유효성 검사 규칙과 Toast 시스템을 구현한다. Stage 2 대비 102개의 테스트가 추가되어 총 211개 테스트 통과.

## 배경/맥락
폼은 웹 애플리케이션의 핵심 상호작용 요소이다:
- **상태 관리**: 입력값, 에러, 터치 상태, 제출 중 상태를 일관되게 관리
- **유효성 검사**: 실시간 피드백으로 사용자 경험 향상
- **Toast 알림**: 폼 제출 결과를 시각적으로 피드백
- **접근성**: 에러 메시지와 입력 필드의 연결 (aria-describedby)

## 변경 파일 목록
### 추가된 파일 (28개)
- `src/hooks/useForm.ts`, `useForm.test.ts`, `index.ts` — useForm 훅
- `src/components/ui/Toast/` — Toast 시스템 (8파일)
- `src/components/ui/Form/` — Form, FormGroup, FormActions (4파일)
- `src/components/ui/Textarea/` — Textarea 컴포넌트 (4파일)
- `src/components/ui/Select/` — Select 컴포넌트 (4파일)
- `src/components/ui/Checkbox/` — Checkbox 컴포넌트 (4파일)
- `src/pages/FormDemo/` — FormDemo 페이지 (4파일)

### 수정된 파일 (4개)
- `src/App.tsx` — ToastProvider 래핑
- `src/components/ui/index.ts` — 새 컴포넌트 export
- `src/router/index.tsx` — `/form-demo` 라우트 추가
- `src/components/layout/Header/Header.tsx` — Form 네비게이션 링크

## 코드 스니펫

### 1. useForm 훅 — 제네릭 폼 상태 관리
```typescript
/* src/hooks/useForm.ts:1-120 */
import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react'

export type ValidationRule<T> = {
  validate: (value: T[keyof T], values: T) => boolean
  message: string
}

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>[]
}

export interface UseFormOptions<T extends object> {
  initialValues: T
  validationRules?: ValidationRules<T>
  onSubmit: (values: T) => void | Promise<void>
}

export interface UseFormReturn<T extends object> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isDirty: boolean
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleSubmit: (e: FormEvent) => void
  setFieldValue: (name: keyof T, value: T[keyof T]) => void
  setFieldError: (name: keyof T, error: string) => void
  resetForm: () => void
  getFieldProps: (name: keyof T) => object
}

export function useForm<T extends object>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues)

  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]): string | undefined => {
      const rules = validationRules[name]
      if (!rules) return undefined

      for (const rule of rules) {
        if (!rule.validate(value, values)) {
          return rule.message
        }
      }
      return undefined
    },
    [validationRules, values]
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target
      const fieldValue = type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value

      setValues((prev) => ({ ...prev, [name]: fieldValue }))

      if (touched[name as keyof T]) {
        const error = validateField(name as keyof T, fieldValue as T[keyof T])
        setErrors((prev) => ({ ...prev, [name]: error }))
      }
    },
    [touched, validateField]
  )

  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setTouched((prev) => ({ ...prev, [name]: true }))
      const error = validateField(name as keyof T, value as T[keyof T])
      setErrors((prev) => ({ ...prev, [name]: error }))
    },
    [validateField]
  )

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      
      // 모든 필드 검증
      const newErrors: Partial<Record<keyof T, string>> = {}
      const allTouched: Partial<Record<keyof T, boolean>> = {}
      
      for (const key of Object.keys(values) as (keyof T)[]) {
        allTouched[key] = true
        const error = validateField(key, values[key])
        if (error) newErrors[key] = error
      }
      
      setTouched(allTouched)
      setErrors(newErrors)
      
      if (Object.keys(newErrors).length > 0) return
      
      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } finally {
        setIsSubmitting(false)
      }
    },
    [values, validateField, onSubmit]
  )

  // ... resetForm, getFieldProps, setFieldValue, setFieldError

  return {
    values, errors, touched, isSubmitting, isDirty,
    handleChange, handleBlur, handleSubmit,
    setFieldValue, setFieldError, resetForm, getFieldProps,
  }
}
```

**선정 이유**: 제네릭을 활용한 타입 안전한 폼 상태 관리의 핵심 구현

**로직/흐름 설명**:
- `T extends object`: 폼 값 타입을 제네릭으로 받아 타입 안전성 확보
- `ValidationRule`: validate 함수와 에러 메시지를 객체로 정의
- `handleChange`: 값 변경 시 touched된 필드만 실시간 검증
- `handleBlur`: 필드 이탈 시 touched 마킹 후 검증
- `handleSubmit`: 모든 필드 검증 후 에러 없으면 onSubmit 호출

**런타임 영향**:
- 폼 상태 변경 시마다 리렌더링 발생 (최적화 필요 시 분리 가능)
- `isSubmitting`으로 중복 제출 방지

**학습 포인트**:
- Q: 왜 `handleChange`에서 touched된 필드만 검증하는가?
- A: 아직 입력하지 않은 필드에 에러를 미리 표시하면 UX가 나빠짐
- Q: `isDirty`는 왜 필요한가?
- A: "변경사항 있음" 표시, 페이지 이탈 경고에 사용

---

### 2. 유효성 검사 규칙 (validators)
```typescript
/* src/hooks/useForm.ts:150-220 */
// 필수 입력
export const required = (message = '필수 입력 항목입니다'): ValidationRule<object> => ({
  validate: (value) => {
    if (typeof value === 'string') return value.trim().length > 0
    if (typeof value === 'boolean') return value === true
    return value !== null && value !== undefined
  },
  message,
})

// 최소 길이
export const minLength = (min: number, message?: string): ValidationRule<object> => ({
  validate: (value) => typeof value === 'string' && value.length >= min,
  message: message || `최소 ${min}자 이상 입력하세요`,
})

// 최대 길이
export const maxLength = (max: number, message?: string): ValidationRule<object> => ({
  validate: (value) => typeof value === 'string' && value.length <= max,
  message: message || `최대 ${max}자까지 입력 가능합니다`,
})

// 이메일 형식
export const email = (message = '유효한 이메일 주소를 입력하세요'): ValidationRule<object> => ({
  validate: (value) => {
    if (typeof value !== 'string') return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },
  message,
})

// 정규식 패턴
export const pattern = (regex: RegExp, message: string): ValidationRule<object> => ({
  validate: (value) => typeof value === 'string' && regex.test(value),
  message,
})

// 필드 매칭 (비밀번호 확인)
export const match = <T extends object>(
  fieldName: keyof T,
  message = '값이 일치하지 않습니다'
): ValidationRule<T> => ({
  validate: (value, values) => value === values[fieldName],
  message,
})

// 커스텀 검증
export const custom = <T>(
  validateFn: (value: T[keyof T], values: T) => boolean,
  message: string
): ValidationRule<T> => ({
  validate: validateFn,
  message,
})
```

**선정 이유**: 선언적이고 재사용 가능한 유효성 검사 패턴

**로직/흐름 설명**:
- 각 validator는 팩토리 함수로 메시지 커스터마이징 가능
- `match`: 다른 필드 값 참조 (비밀번호 확인에 사용)
- `custom`: 임의의 검증 로직 지원

**학습 포인트**:
- 선언적 검증: `validationRules: { email: [required(), email()] }`
- Q: 왜 함수 대신 객체(`{ validate, message }`)로 규칙을 정의하는가?
- A: 에러 메시지를 규칙과 함께 관리하여 일관성 유지

---

### 3. Toast 시스템 — Context + Provider
```tsx
/* src/components/ui/Toast/ToastContext.tsx:1-50 */
import { createContext, useContext } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'
export type ToastPosition = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

export interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  position: ToastPosition
  setPosition: (position: ToastPosition) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
```

```tsx
/* src/components/ui/Toast/ToastProvider.tsx:1-60 */
import { useState, useCallback, type ReactNode } from 'react'
import { ToastContext, type Toast, type ToastPosition } from './ToastContext'
import { ToastContainer } from './Toast'

interface ToastProviderProps {
  children: ReactNode
  defaultPosition?: ToastPosition
}

export function ToastProvider({ 
  children, 
  defaultPosition = 'top-right' 
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [position, setPosition] = useState<ToastPosition>(defaultPosition)

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: Toast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])

    // 자동 제거
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, position, setPosition }}>
      {children}
      <ToastContainer toasts={toasts} position={position} onClose={removeToast} />
    </ToastContext.Provider>
  )
}
```

**선정 이유**: Context API를 활용한 전역 상태 관리 패턴

**로직/흐름 설명**:
- `ToastContext`: 토스트 목록, 추가/제거 함수, 위치 설정 공유
- `ToastProvider`: 상태 관리 및 자동 제거 타이머 설정
- `useToast`: Context 접근 훅 (Provider 외부 사용 시 에러)
- 6가지 위치: top-left, top-center, top-right, bottom-*

**런타임 영향**:
- 토스트 추가/제거 시 Provider 하위 전체가 아닌 ToastContainer만 리렌더링
- `setTimeout`으로 자동 제거 (duration=0이면 수동 제거만)

**학습 포인트**:
- Context 분리: ToastContext.tsx와 ToastProvider.tsx를 분리하여 Fast Refresh 호환
- Q: 왜 Context를 별도 파일로 분리하는가?
- A: ESLint `react-refresh/only-export-components` 규칙 준수

---

### 4. FormDemo 페이지 — useForm 사용 예시
```tsx
/* src/pages/FormDemo/FormDemo.tsx:1-100 (부분) */
import { useForm, required, email, minLength, match } from '../../hooks'
import { useToast } from '../../components/ui'
import { Form, FormGroup, FormActions, Input, Textarea, Select, Checkbox, Button } from '../../components/ui'

interface FormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
  message: string
  category: string
  terms: boolean
}

export function FormDemo() {
  const { addToast } = useToast()

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useForm<FormValues>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      message: '',
      category: '',
      terms: false,
    },
    validationRules: {
      name: [required(), minLength(2)],
      email: [required(), email()],
      password: [required(), minLength(8)],
      confirmPassword: [required(), match<FormValues>('password', '비밀번호가 일치하지 않습니다')],
      message: [required()],
      category: [required('카테고리를 선택하세요')],
      terms: [required('약관에 동의해야 합니다')],
    },
    onSubmit: async (formValues) => {
      // 가짜 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log('Form submitted:', formValues)
      addToast({ type: 'success', message: '폼이 성공적으로 제출되었습니다!' })
      resetForm()
    },
  })

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Input
          name="name"
          label="이름"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.name ? errors.name : undefined}
        />
      </FormGroup>
      {/* ... 다른 필드들 */}
      <FormActions>
        <Button type="submit" isLoading={isSubmitting}>
          제출하기
        </Button>
        <Button type="button" variant="secondary" onClick={resetForm}>
          초기화
        </Button>
      </FormActions>
    </Form>
  )
}
```

**선정 이유**: useForm 훅의 실제 사용 패턴을 보여주는 완전한 예시

**로직/흐름 설명**:
- `useForm<FormValues>`: 타입 안전한 폼 값 관리
- `validationRules`: 선언적 유효성 검사 규칙 정의
- `onSubmit`: 검증 통과 후 실행되는 콜백
- `touched[field] ? errors[field] : undefined`: 터치된 필드만 에러 표시

**학습 포인트**:
- 폼 제출 성공 시 Toast로 피드백 제공
- `resetForm()`으로 폼을 초기 상태로 복원

## 재현 단계 (CLI 우선)

### CLI 명령어
```bash
# 1. 개발 서버 실행
npm run dev

# 2. 테스트 실행 (211개)
npm test -- --run

# 3. 빌드 확인
npm run build
```

### 구현 단계 (코드 작성 순서)
1. **useForm 훅 구현**: `src/hooks/useForm.ts` — 상태, 핸들러, validators
2. **useForm 테스트**: `src/hooks/useForm.test.ts` — 30개 테스트
3. **hooks 배럴 export**: `src/hooks/index.ts`
4. **Toast 시스템 구현**:
   - `ToastContext.tsx` — Context 정의, useToast 훅
   - `ToastProvider.tsx` — Provider 컴포넌트
   - `Toast.tsx` — Toast, ToastContainer 컴포넌트
   - 스타일 및 테스트 (18개)
5. **폼 컴포넌트 구현**: Form, Textarea, Select, Checkbox (각 4파일)
6. **UI index.ts 업데이트**: 새 컴포넌트 export 추가
7. **FormDemo 페이지 구현**: `src/pages/FormDemo/`
8. **라우터 업데이트**: `/form-demo` 라우트 추가
9. **App.tsx 수정**: `ToastProvider`로 앱 래핑
10. **Header 업데이트**: Form 네비게이션 링크 추가
11. **테스트 실행**: `npm test` (211개 통과 확인)

## 설명

### 설계 결정
1. **Context 파일 분리**: Fast Refresh 호환을 위해 ToastContext.tsx 분리
2. **객체 기반 ValidationRule**: 함수 대신 `{ validate, message }` 객체로 에러 메시지 함께 관리
3. **제네릭 useForm**: 타입 안전한 폼 값 접근 보장

### 트레이드오프
- **커스텀 훅 vs 라이브러리**: react-hook-form은 더 최적화되어 있지만, 학습 목적으로 직접 구현
- **Context vs Props**: Toast는 앱 전역에서 사용되므로 Context 선택

### 테스트 통계
| 구분 | 테스트 수 |
|------|----------|
| useForm | 30 |
| Toast | 10 |
| ToastProvider | 8 |
| Form | 11 |
| Textarea | 12 |
| Select | 12 |
| Checkbox | 10 |
| FormDemo | 9 |
| **Stage 3 추가** | **102** |

## 검증 체크리스트

### 자동 검증
```bash
npm run lint      # PASS
npm test -- --run # 211 tests passed
npm run build     # 성공 (112 modules)
```

### 수동 검증
- [ ] `/form-demo` 페이지 접속
- [ ] 빈 폼 제출 시 모든 필드에 에러 메시지 표시
- [ ] 이메일 필드에 잘못된 형식 입력 시 에러
- [ ] 비밀번호 확인 필드가 일치하지 않을 때 에러
- [ ] 모든 필드 올바르게 입력 후 제출 시 성공 Toast 표시
- [ ] Toast 5초 후 자동 사라짐 확인

## 누락 정보
- 없음
