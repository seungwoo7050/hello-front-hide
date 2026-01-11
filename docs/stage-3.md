# Stage 3: 폼, 유효성 검사, 토스트 시스템

## 개요

Stage 3에서는 완전한 폼 시스템과 사용자 피드백 메커니즘을 구축합니다. `useForm` 커스텀 훅을 통한 폼 상태 관리, 선언적 유효성 검사, 그리고 토스트 알림 시스템을 구현합니다.

## 학습 목표

1. **커스텀 훅 설계** - 복잡한 상태 로직을 재사용 가능한 훅으로 추상화
2. **Context API 활용** - 전역 상태 관리와 Provider 패턴
3. **폼 상태 관리** - touched, errors, dirty 등 폼 메타데이터 관리
4. **선언적 유효성 검사** - 규칙 기반 검증 시스템
5. **Portal과 애니메이션** - createPortal을 활용한 오버레이 UI

## 구현 컴포넌트

### 1. useForm 훅 (`src/hooks/useForm.ts`)

폼 상태를 관리하는 포괄적인 커스텀 훅입니다.

#### 반환 값

```typescript
interface UseFormReturn<T> {
  values: T;                    // 현재 폼 값
  errors: FormErrors<T>;        // 필드별 오류
  touched: TouchedFields<T>;    // 터치된 필드
  isSubmitting: boolean;        // 제출 중 여부
  isValid: boolean;             // 폼 유효 여부
  isDirty: boolean;             // 값 변경 여부
  handleChange: Function;       // 값 변경 핸들러
  handleBlur: Function;         // blur 핸들러
  setFieldValue: Function;      // 특정 필드 값 설정
  setFieldError: Function;      // 특정 필드 오류 설정
  validateForm: Function;       // 전체 폼 검증
  handleSubmit: Function;       // 폼 제출 핸들러
  resetForm: Function;          // 폼 초기화
  getFieldProps: Function;      // 입력 필드 props 생성
}
```

#### 사용 예시

```tsx
const form = useForm({
  initialValues: { name: '', email: '' },
  validationRules: {
    name: [validators.required('이름을 입력해주세요')],
    email: [
      validators.required('이메일을 입력해주세요'),
      validators.email('올바른 이메일 형식이 아닙니다'),
    ],
  },
  onSubmit: async (values) => {
    await submitData(values);
  },
});
```

### 2. validators 유틸리티

선언적 유효성 검사 규칙을 생성하는 헬퍼 함수들입니다.

```typescript
validators.required(message)        // 필수 입력
validators.minLength(min, message)  // 최소 길이
validators.maxLength(max, message)  // 최대 길이
validators.email(message)           // 이메일 형식
validators.pattern(regex, message)  // 정규표현식
validators.min(min, message)        // 최소 값
validators.max(max, message)        // 최대 값
validators.match(field, message)    // 다른 필드와 일치
validators.custom(fn, message)      // 커스텀 검증
```

### 3. Toast 시스템

#### ToastProvider

```tsx
<ToastProvider 
  position="top-right"  // 기본 위치
  maxToasts={5}         // 최대 표시 개수
>
  <App />
</ToastProvider>
```

#### useToast 훅

```tsx
const { toast, success, error, warning, info, dismissAll } = useToast();

// 기본 토스트
toast('메시지');

// 타입별 토스트
success('저장되었습니다', { title: '성공' });
error('오류가 발생했습니다');
warning('주의가 필요합니다');
info('참고 정보입니다');
```

#### Toast 컴포넌트

- **타입**: success, error, warning, info
- **위치**: top-right, top-left, top-center, bottom-right, bottom-left, bottom-center
- **기능**: 자동 닫힘, 수동 닫기, 애니메이션

### 4. 폼 컴포넌트

#### Form, FormGroup, FormActions

```tsx
<Form onSubmit={form.handleSubmit}>
  <FormGroup>
    <Input {...form.getFieldProps('name')} />
  </FormGroup>
  
  <FormGroup row>  {/* 가로 배치 */}
    <Input {...} />
    <Input {...} />
  </FormGroup>
  
  <FormActions align="end">
    <Button type="submit">제출</Button>
  </FormActions>
</Form>
```

#### Textarea

```tsx
<Textarea
  label="메시지"
  required
  showCharCount
  maxLength={500}
  resize="vertical"
  error={form.errors.message}
  {...form.getFieldProps('message')}
/>
```

#### Select

```tsx
<Select
  label="카테고리"
  options={[
    { value: 'general', label: '일반' },
    { value: 'support', label: '지원' },
  ]}
  placeholder="선택해주세요"
  {...form.getFieldProps('category')}
/>
```

#### Checkbox

```tsx
<Checkbox
  label="동의합니다"
  checked={form.values.agree}
  onChange={form.handleChange}
/>
```

## 파일 구조

```
src/
├── hooks/
│   ├── useForm.ts              # 폼 상태 관리 훅
│   ├── useForm.test.ts         # 훅 테스트 (30 tests)
│   └── index.ts                # 훅 exports
├── components/ui/
│   ├── Toast/
│   │   ├── Toast.tsx           # 개별 토스트 컴포넌트
│   │   ├── Toast.module.css
│   │   ├── Toast.test.tsx      # 10 tests
│   │   ├── ToastProvider.tsx   # Context Provider
│   │   ├── ToastProvider.test.tsx # 8 tests
│   │   ├── ToastContext.tsx    # Context 정의
│   │   ├── ToastContainer.module.css
│   │   └── index.ts
│   ├── Form/
│   │   ├── Form.tsx            # Form, FormGroup, FormActions
│   │   ├── Form.module.css
│   │   ├── Form.test.tsx       # 11 tests
│   │   └── index.ts
│   ├── Textarea/
│   │   ├── Textarea.tsx
│   │   ├── Textarea.module.css
│   │   ├── Textarea.test.tsx   # 12 tests
│   │   └── index.ts
│   ├── Select/
│   │   ├── Select.tsx
│   │   ├── Select.module.css
│   │   ├── Select.test.tsx     # 12 tests
│   │   └── index.ts
│   └── Checkbox/
│       ├── Checkbox.tsx
│       ├── Checkbox.module.css
│       ├── Checkbox.test.tsx   # 10 tests
│       └── index.ts
└── pages/
    └── FormDemo/
        ├── FormDemo.tsx        # 데모 페이지
        ├── FormDemo.module.css
        ├── FormDemo.test.tsx   # 9 tests
        └── index.ts
```

## 핵심 패턴

### 1. Context 분리 패턴

```tsx
// ToastContext.tsx - Context와 훅만 정의
export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// ToastProvider.tsx - Provider 구현
export function ToastProvider({ children }) {
  // 상태 관리 로직
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(/* Toast UI */, document.body)}
    </ToastContext.Provider>
  );
}
```

### 2. 유효성 검사 규칙 패턴

```typescript
type ValidationRule<T> = {
  validate: (value: T[keyof T], values: T) => boolean;
  message: string;
};

// 규칙 팩토리
const validators = {
  required: <T>(message: string): ValidationRule<T> => ({
    validate: (value) => Boolean(value),
    message,
  }),
  // ...
};
```

### 3. 폼 필드 Props 생성 패턴

```typescript
const getFieldProps = (field: keyof T) => ({
  name: field,
  value: values[field],
  onChange: handleChange,
  onBlur: handleBlur,
});
```

## CSS 구현 특징

### Toast 애니메이션

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast {
  animation: slideIn 0.3s ease-out;
}
```

### Custom Checkbox

```css
.checkboxVisual {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.checkbox:checked + .checkboxVisual {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
```

## 테스트 전략

### 훅 테스트 (renderHook)

```typescript
const { result } = renderHook(() =>
  useForm({
    initialValues: { name: '' },
    validationRules: { name: [validators.required('필수')] },
  })
);

act(() => {
  result.current.handleChange({ target: { name: 'name', value: 'test' } });
});

expect(result.current.values.name).toBe('test');
```

### Context 테스트

```tsx
function TestComponent() {
  const { toast } = useToast();
  return <button onClick={() => toast('test')}>Toast</button>;
}

render(
  <ToastProvider>
    <TestComponent />
  </ToastProvider>
);
```

## 품질 메트릭

- **테스트 커버리지**: 211 tests (Stage 2 대비 +102)
- **새 테스트 파일**: 7개
- **Lint 에러**: 0
- **TypeScript 에러**: 0
- **빌드 상태**: 성공

## 다음 단계 (Stage 4)

Stage 4에서는 이 폼 시스템을 활용하여 Notes App CRUD를 구현합니다:
- 노트 목록, 생성, 수정, 삭제
- 검색 및 필터링
- 정렬 기능
