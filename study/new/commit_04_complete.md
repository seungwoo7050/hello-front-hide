# Commit #4 — 폼 컴포넌트, useForm 훅, 유효성 검사, Toast 시스템 구현

## Meta

- **난이도**: ⭐⭐⭐ 중급 (Intermediate)
- **권장 커밋 메시지**: `feat: add useform hook, form components, and toast system`

---

## 학습 목표

1. `useForm` 커스텀 훅으로 복잡한 폼 상태를 관리할 수 있다
2. 선언적 유효성 검사 규칙(validators)을 정의하고 적용할 수 있다
3. Context API를 활용한 Toast 알림 시스템을 구현할 수 있다
4. Form, Textarea, Select, Checkbox 등 폼 컴포넌트를 구현할 수 있다

---

## TL;DR

`useForm` 커스텀 훅으로 폼 상태(values, errors, touched, isSubmitting, isDirty)를 관리하고, `validators` 유틸리티로 선언적 유효성 검사를 수행한다. Context API 기반 Toast 시스템으로 사용자 피드백을 제공하며, Textarea, Select, Checkbox 폼 컴포넌트를 추가한다.

---

## 배경/컨텍스트

### 왜 이 변경이 필요한가?

- **폼 상태 관리**: 복잡한 폼 로직을 재사용 가능한 훅으로 추상화
- **선언적 유효성 검사**: 규칙 기반으로 일관된 검증 수행
- **사용자 피드백**: Toast 시스템으로 작업 결과 알림
- **완전한 폼 UI**: 다양한 입력 타입 지원

### 영향 범위

- 새로운 커스텀 훅 `useForm` 추가
- Toast 시스템 (ToastProvider, useToast) 추가
- 폼 컴포넌트 4개 추가 (Form, Textarea, Select, Checkbox)
- 테스트 수 109개 → 211개로 증가 (+102)

---

## 변경 파일 목록

### 추가된 파일 (32개)

| 카테고리 | 파일 | 설명 |
|----------|------|------|
| 훅 | `src/hooks/useForm.ts` | 폼 상태 관리 훅 |
| 훅 | `src/hooks/useForm.test.ts` | 훅 테스트 (30개) |
| Toast | `src/components/ui/Toast/*` | Toast 시스템 (7파일) |
| 폼 | `src/components/ui/Form/*` | Form, FormGroup, FormActions (4파일) |
| 폼 | `src/components/ui/Textarea/*` | Textarea 컴포넌트 (4파일) |
| 폼 | `src/components/ui/Select/*` | Select 컴포넌트 (4파일) |
| 폼 | `src/components/ui/Checkbox/*` | Checkbox 컴포넌트 (4파일) |
| 페이지 | `src/pages/FormDemo/*` | FormDemo 페이지 (4파일) |

### 수정된 파일 (4개)

| 파일 | 변경 내용 |
|------|------|
| `src/App.tsx` | ToastProvider로 앱 래핑 |
| `src/components/ui/index.ts` | 새 컴포넌트 export 추가 |
| `src/router/index.tsx` | `/form-demo` 라우트 추가 |
| `src/components/layout/Header/Header.tsx` | Form 네비게이션 링크 추가 |

---

## 코드 스니펫

### 1. useForm.ts — 폼 상태 관리 훅

**선택 이유**: 복잡한 폼 로직을 캡슐화하는 커스텀 훅의 핵심 패턴

```typescript
/* src/hooks/useForm.ts:1..100 */
import { useState, useCallback, useMemo } from 'react';

export type ValidationRule<T> = {
  validate: (value: T[keyof T], values: T) => boolean;
  message: string;
};

export interface UseFormOptions<T extends object> {
  initialValues: T;
  validationRules?: Partial<Record<keyof T, ValidationRule<T>[]>>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export interface UseFormReturn<T extends object> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setFieldValue: (name: keyof T, value: T[keyof T]) => void;
  setFieldError: (name: keyof T, error: string | undefined) => void;
  validateField: (name: keyof T) => boolean;
  validateForm: () => boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  getFieldProps: (name: keyof T) => FieldProps;
}

export function useForm<T extends object>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 필드 유효성 검사
  const validateField = useCallback((name: keyof T): boolean => {
    const rules = validationRules[name];
    if (!rules) return true;

    for (const rule of rules) {
      if (!rule.validate(values[name], values)) {
        setErrors(prev => ({ ...prev, [name]: rule.message }));
        return false;
      }
    }
    setErrors(prev => ({ ...prev, [name]: undefined }));
    return true;
  }, [values, validationRules]);

  // 값 변경 핸들러
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;
    setValues(prev => ({ ...prev, [name]: newValue }));
  }, []);

  // blur 핸들러
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name as keyof T);
  }, [validateField]);

  // 폼 제출 핸들러
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit, validateForm]);

  // 파생 상태
  const isValid = useMemo(() => Object.values(errors).every(e => !e), [errors]);
  const isDirty = useMemo(() => 
    JSON.stringify(values) !== JSON.stringify(initialValues), 
    [values, initialValues]
  );

  return {
    values, errors, touched, isSubmitting, isValid, isDirty,
    handleChange, handleBlur, setFieldValue, setFieldError,
    validateField, validateForm, handleSubmit, resetForm, getFieldProps,
  };
}
```

**로직 설명**:
- `ValidationRule`: validate 함수와 message를 포함한 규칙 객체
- `type === 'checkbox'`: checkbox는 `checked` 속성 사용
- `validateField`: 필드별 규칙 검사, 첫 번째 실패 시 중단
- `isDirty`: 초기값과 현재값 비교로 변경 여부 판단

**학습 노트**: `values` 의존성이 있는 규칙(`match`)을 위해 validate 함수에 전체 values 전달.

---

### 2. validators — 선언적 유효성 검사 규칙

**선택 이유**: 재사용 가능한 유효성 검사 팩토리 함수

```typescript
/* src/hooks/useForm.ts:validators */
export const validators = {
  required: (message = '필수 항목입니다') => ({
    validate: (value: unknown) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'boolean') return true;
      return value != null;
    },
    message,
  }),

  minLength: (min: number, message?: string) => ({
    validate: (value: string) => !value || value.length >= min,
    message: message ?? `최소 ${min}자 이상 입력해주세요`,
  }),

  email: (message = '올바른 이메일 형식이 아닙니다') => ({
    validate: (value: string) => {
      if (!value) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  pattern: (regex: RegExp, message: string) => ({
    validate: (value: string) => !value || regex.test(value),
    message,
  }),

  match: <T>(field: keyof T, message?: string) => ({
    validate: (value: unknown, values: T) => value === values[field],
    message: message ?? '값이 일치하지 않습니다',
  }),

  custom: <T>(fn: (value: T[keyof T], values: T) => boolean, message: string) => ({
    validate: fn,
    message,
  }),
};
```

**사용 예시**:
```typescript
const form = useForm({
  initialValues: { password: '', confirmPassword: '' },
  validationRules: {
    password: [
      validators.required('비밀번호를 입력해주세요'),
      validators.minLength(8, '8자 이상 입력해주세요'),
    ],
    confirmPassword: [
      validators.required(),
      validators.match('password', '비밀번호가 일치하지 않습니다'),
    ],
  },
});
```

---

### 3. ToastProvider & useToast — Context API 패턴

**선택 이유**: 전역 상태 관리와 Provider 패턴의 실용적 예시

```tsx
/* src/components/ui/Toast/ToastContext.tsx */
import { createContext, useContext } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
}

export interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, options?: Partial<Toast>) => void;
  success: (message: string, options?: Partial<Toast>) => void;
  error: (message: string, options?: Partial<Toast>) => void;
  warning: (message: string, options?: Partial<Toast>) => void;
  info: (message: string, options?: Partial<Toast>) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export { ToastContext };
```

```tsx
/* src/components/ui/Toast/ToastProvider.tsx */
import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { ToastContext, type Toast, type ToastType } from './ToastContext';
import { ToastContainer } from './ToastContainer';

export function ToastProvider({ 
  children, 
  position = 'top-right',
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType, options?: Partial<Toast>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type, ...options };
    
    setToasts(prev => {
      const updated = [...prev, newToast];
      return updated.slice(-maxToasts); // 최대 개수 제한
    });

    // 자동 닫기
    const duration = options?.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }, [maxToasts]);

  const value = useMemo(() => ({
    toasts,
    toast: (msg: string, opts?: Partial<Toast>) => addToast(msg, 'info', opts),
    success: (msg: string, opts?: Partial<Toast>) => addToast(msg, 'success', opts),
    error: (msg: string, opts?: Partial<Toast>) => addToast(msg, 'error', opts),
    warning: (msg: string, opts?: Partial<Toast>) => addToast(msg, 'warning', opts),
    info: (msg: string, opts?: Partial<Toast>) => addToast(msg, 'info', opts),
    dismiss,
    dismissAll,
  }), [toasts, addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={position} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
```

**로직 설명**:
- Context 분리: `ToastContext.tsx`를 별도 파일로 분리 (Fast Refresh 대응)
- `maxToasts`: 화면에 표시할 최대 토스트 수 제한
- `duration`: 자동 닫기 시간 (0이면 자동 닫기 비활성화)

**학습 노트**: Context와 Provider를 분리하면 `react-refresh/only-export-components` 린트 규칙 준수 가능.

---

## 재현 단계 (CLI 우선)

### 사전 요구사항
- Commit #3 완료 상태

### 1. 디렉토리 구조 생성

```bash
# 폼 컴포넌트 디렉토리
mkdir -p src/components/ui/{Form,Textarea,Select,Checkbox,Toast}

# 페이지 디렉토리
mkdir -p src/pages/FormDemo

# 훅 디렉토리 (이미 존재할 수 있음)
mkdir -p src/hooks
```

### 2. 구현 단계 (코드 작성 순서)

1. **src/hooks/useForm.ts**: 폼 상태 관리 훅 + validators
2. **src/hooks/useForm.test.ts**: 훅 테스트 (30개)
3. **Toast 시스템**: ToastContext → ToastProvider → Toast 컴포넌트
4. **Form 컴포넌트**: Form, FormGroup, FormActions
5. **Textarea 컴포넌트**: label, error, helperText 지원
6. **Select 컴포넌트**: options, placeholder 지원
7. **Checkbox 컴포넌트**: checked 상태 관리
8. **src/App.tsx**: ToastProvider로 앱 래핑
9. **FormDemo 페이지**: 폼 및 토스트 데모
10. **src/router/index.tsx**: `/form-demo` 라우트 추가

### 3. 품질 게이트 검증

```bash
npm run lint
npm test -- --run   # 211개 테스트
npm run build
npm run dev
```

---

## 검증 체크리스트

- [ ] `npm test -- --run` 실행 시 211개 테스트 통과
- [ ] `/form-demo` 페이지에서 폼 제출 시 유효성 검사 동작
- [ ] 필수 필드 비어 있을 때 에러 메시지 표시
- [ ] 이메일 형식 검증 동작
- [ ] 비밀번호 확인 필드 일치 검증 동작
- [ ] Toast 버튼 클릭 시 토스트 알림 표시
- [ ] 토스트 자동 닫기 동작 (5초)
- [ ] 토스트 수동 닫기 버튼 동작

---

## 누락 정보

- ✅ 커밋 해시: `cbd115021b596947647f3830eaad94be420a5a2d`
- ✅ 테스트 결과: 211개 통과 (+102)

**핵심 학습 포인트**:
- Context 파일 분리로 Fast Refresh 린트 규칙 준수
- Checkbox는 `checked` 속성 사용 (`type === 'checkbox'` 분기)
- `match` validator는 다른 필드 값 참조를 위해 `values` 매개변수 활용
