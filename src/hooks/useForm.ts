import type { ChangeEvent, FormEvent } from 'react';
import { useState, useCallback } from 'react';

export type ValidationRule<T> = {
  /** 유효성 검사 함수 */
  validate: (value: T[keyof T], values: T) => boolean;
  /** 오류 메시지 */
  message: string;
};

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

export type TouchedFields<T> = {
  [K in keyof T]?: boolean;
};

export interface UseFormOptions<T> {
  /** 초기값 */
  initialValues: T;
  /** 유효성 검사 규칙 */
  validationRules?: ValidationRules<T>;
  /** 제출 시 콜백 */
  onSubmit?: (values: T) => void | Promise<void>;
  /** blur 시 유효성 검사 */
  validateOnBlur?: boolean;
  /** 변경 시 유효성 검사 */
  validateOnChange?: boolean;
}

export interface UseFormReturn<T> {
  /** 현재 폼 값 */
  values: T;
  /** 필드별 오류 */
  errors: FormErrors<T>;
  /** 터치된 필드 */
  touched: TouchedFields<T>;
  /** 제출 중 여부 */
  isSubmitting: boolean;
  /** 폼이 유효한지 여부 */
  isValid: boolean;
  /** 값이 변경되었는지 여부 */
  isDirty: boolean;
  /** 필드 값 변경 */
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  /** 필드 blur */
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  /** 특정 필드 값 설정 */
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  /** 특정 필드 오류 설정 */
  setFieldError: <K extends keyof T>(field: K, error: string | undefined) => void;
  /** 특정 필드 터치 설정 */
  setFieldTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  /** 모든 필드 유효성 검사 */
  validateForm: () => boolean;
  /** 특정 필드 유효성 검사 */
  validateField: <K extends keyof T>(field: K) => string | undefined;
  /** 폼 제출 */
  handleSubmit: (e?: FormEvent<HTMLFormElement>) => Promise<void>;
  /** 폼 초기화 */
  resetForm: (newValues?: T) => void;
  /** 입력 필드 props 생성 */
  getFieldProps: <K extends keyof T>(field: K) => {
    name: K;
    value: T[K];
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  };
}

export function useForm<T extends object>({
  initialValues,
  validationRules = {} as ValidationRules<T>,
  onSubmit,
  validateOnBlur = true,
  validateOnChange = false,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<TouchedFields<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 특정 필드 유효성 검사
  const validateField = useCallback(
    <K extends keyof T>(field: K): string | undefined => {
      const rules = validationRules[field];
      if (!rules) return undefined;

      for (const rule of rules) {
        if (!rule.validate(values[field], values)) {
          return rule.message;
        }
      }
      return undefined;
    },
    [values, validationRules]
  );

  // 전체 폼 유효성 검사
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;

    for (const field of Object.keys(validationRules) as (keyof T)[]) {
      const error = validateField(field);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [validationRules, validateField]);

  // 폼이 유효한지 계산
  const isValid = Object.keys(errors).length === 0;

  // 값이 변경되었는지 계산
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  // 필드 값 변경
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const newValue =
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setValues((prev) => ({ ...prev, [name]: newValue }));

      if (validateOnChange) {
        const error = validateField(name as keyof T);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validateOnChange, validateField]
  );

  // 필드 blur
  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validateOnBlur) {
        const error = validateField(name as keyof T);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validateOnBlur, validateField]
  );

  // 특정 필드 값 설정
  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  // 특정 필드 오류 설정
  const setFieldError = useCallback(
    <K extends keyof T>(field: K, error: string | undefined) => {
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    []
  );

  // 특정 필드 터치 설정
  const setFieldTouched = useCallback(
    <K extends keyof T>(field: K, isTouched = true) => {
      setTouched((prev) => ({ ...prev, [field]: isTouched }));
    },
    []
  );

  // 폼 제출
  const handleSubmit = useCallback(
    async (e?: FormEvent<HTMLFormElement>) => {
      e?.preventDefault();

      // 모든 필드 터치 처리
      const allTouched = Object.keys(initialValues).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as TouchedFields<T>
      );
      setTouched(allTouched);

      // 유효성 검사
      if (!validateForm()) {
        return;
      }

      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [initialValues, validateForm, onSubmit, values]
  );

  // 폼 초기화
  const resetForm = useCallback(
    (newValues?: T) => {
      setValues(newValues ?? initialValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues]
  );

  // 필드 props 생성
  const getFieldProps = useCallback(
    <K extends keyof T>(field: K) => ({
      name: field,
      value: values[field],
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    [values, handleChange, handleBlur]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateForm,
    validateField,
    handleSubmit,
    resetForm,
    getFieldProps,
  };
}

// 자주 사용하는 유효성 검사 규칙
export const validators = {
  required: <T>(message = '필수 입력 항목입니다'): ValidationRule<T> => ({
    validate: (value) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      return true;
    },
    message,
  }),

  minLength: <T>(min: number, message?: string): ValidationRule<T> => ({
    validate: (value) => {
      if (typeof value !== 'string') return true;
      return value.length >= min;
    },
    message: message ?? `최소 ${min}자 이상 입력해주세요`,
  }),

  maxLength: <T>(max: number, message?: string): ValidationRule<T> => ({
    validate: (value) => {
      if (typeof value !== 'string') return true;
      return value.length <= max;
    },
    message: message ?? `최대 ${max}자까지 입력 가능합니다`,
  }),

  email: <T>(message = '올바른 이메일 형식이 아닙니다'): ValidationRule<T> => ({
    validate: (value) => {
      if (typeof value !== 'string' || value.length === 0) return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    message,
  }),

  pattern: <T>(regex: RegExp, message: string): ValidationRule<T> => ({
    validate: (value) => {
      if (typeof value !== 'string' || value.length === 0) return true;
      return regex.test(value);
    },
    message,
  }),

  min: <T>(minValue: number, message?: string): ValidationRule<T> => ({
    validate: (value) => {
      if (typeof value !== 'number') return true;
      return value >= minValue;
    },
    message: message ?? `${minValue} 이상의 값을 입력해주세요`,
  }),

  max: <T>(maxValue: number, message?: string): ValidationRule<T> => ({
    validate: (value) => {
      if (typeof value !== 'number') return true;
      return value <= maxValue;
    },
    message: message ?? `${maxValue} 이하의 값을 입력해주세요`,
  }),

  match: <T>(
    fieldName: keyof T,
    message = '값이 일치하지 않습니다'
  ): ValidationRule<T> => ({
    validate: (value, values) => value === values[fieldName],
    message,
  }),

  custom: <T>(
    validateFn: (value: T[keyof T], values: T) => boolean,
    message: string
  ): ValidationRule<T> => ({
    validate: validateFn,
    message,
  }),
};

export default useForm;
