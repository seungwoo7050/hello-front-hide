import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm, validators } from './useForm';

describe('useForm', () => {
  describe('초기화', () => {
    it('초기값으로 폼을 생성한다', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '', email: '' },
        })
      );

      expect(result.current.values).toEqual({ name: '', email: '' });
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isValid).toBe(true);
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('값 변경', () => {
    it('setFieldValue로 필드 값을 변경할 수 있다', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
        })
      );

      act(() => {
        result.current.setFieldValue('name', '홍길동');
      });

      expect(result.current.values.name).toBe('홍길동');
      expect(result.current.isDirty).toBe(true);
    });

    it('handleChange로 input 이벤트를 처리할 수 있다', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
        })
      );

      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: '테스트', type: 'text' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values.name).toBe('테스트');
    });

    it('체크박스 타입을 올바르게 처리한다', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { agree: false },
        })
      );

      act(() => {
        result.current.handleChange({
          target: { name: 'agree', checked: true, type: 'checkbox' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values.agree).toBe(true);
    });
  });

  describe('유효성 검사', () => {
    it('validateOnChange가 true면 handleChange 시 유효성 검사를 실행한다', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
          validationRules: {
            name: [validators.required<{ name: string }>('필수 입력입니다')],
          },
          validateOnChange: true,
        })
      );

      // handleChange로 빈 값을 설정 (이벤트 시뮬레이션)
      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: '', type: 'text' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.errors.name).toBe('필수 입력입니다');
    });

    it('validateOnBlur가 true면 blur 시 유효성 검사를 실행한다', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
          validationRules: {
            name: [validators.required<{ name: string }>('필수 입력입니다')],
          },
          validateOnBlur: true,
        })
      );

      act(() => {
        result.current.handleBlur({
          target: { name: 'name' },
        } as React.FocusEvent<HTMLInputElement>);
      });

      expect(result.current.touched.name).toBe(true);
      expect(result.current.errors.name).toBe('필수 입력입니다');
    });

    it('validateForm으로 전체 폼을 검사할 수 있다', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '', email: '' },
          validationRules: {
            name: [validators.required<{ name: string; email: string }>('이름 필수')],
            email: [validators.required<{ name: string; email: string }>('이메일 필수')],
          },
        })
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateForm();
      });

      expect(isValid!).toBe(false);
      expect(result.current.errors.name).toBe('이름 필수');
      expect(result.current.errors.email).toBe('이메일 필수');
    });
  });

  describe('제출', () => {
    it('유효한 폼 제출 시 onSubmit이 호출된다', async () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '홍길동' },
          validationRules: {
            name: [validators.required<{ name: string }>('필수')],
          },
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(onSubmit).toHaveBeenCalledWith({ name: '홍길동' });
    });

    it('유효하지 않은 폼은 제출되지 않는다', async () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
          validationRules: {
            name: [validators.required<{ name: string }>('필수')],
          },
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('제출 중 isSubmitting이 true가 된다', async () => {
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });

      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '테스트' },
          onSubmit: async () => {
            await submitPromise;
          },
        })
      );

      let submitPromiseFromHook: Promise<void>;
      act(() => {
        submitPromiseFromHook = result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent<HTMLFormElement>);
      });

      expect(result.current.isSubmitting).toBe(true);

      await act(async () => {
        resolveSubmit!();
        await submitPromiseFromHook;
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('리셋', () => {
    it('resetForm으로 초기 상태로 되돌릴 수 있다', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '초기값' },
        })
      );

      act(() => {
        result.current.setFieldValue('name', '변경된 값');
      });

      expect(result.current.values.name).toBe('변경된 값');
      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.values.name).toBe('초기값');
      expect(result.current.isDirty).toBe(false);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
    });
  });

  describe('getFieldProps', () => {
    it('필드에 필요한 props를 반환한다', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '테스트' },
        })
      );

      const props = result.current.getFieldProps('name');

      expect(props.name).toBe('name');
      expect(props.value).toBe('테스트');
      expect(typeof props.onChange).toBe('function');
      expect(typeof props.onBlur).toBe('function');
    });
  });
});

describe('validators', () => {
  describe('required', () => {
    it('빈 값에 에러를 반환한다', () => {
      const rule = validators.required<{ field: string }>('필수입니다');
      expect(rule.validate('', {} as { field: string })).toBe(false);
      expect(rule.validate('   ', {} as { field: string })).toBe(false);
      expect(rule.validate(null as unknown as string, {} as { field: string })).toBe(false);
      expect(rule.validate(undefined as unknown as string, {} as { field: string })).toBe(false);
      expect(rule.message).toBe('필수입니다');
    });

    it('값이 있으면 true를 반환한다', () => {
      const rule = validators.required<{ field: string }>('필수입니다');
      expect(rule.validate('값', {} as { field: string })).toBe(true);
    });
  });

  describe('minLength', () => {
    it('최소 길이 미만이면 false를 반환한다', () => {
      const rule = validators.minLength<{ field: string }>(5, '5자 이상');
      expect(rule.validate('abc', {} as { field: string })).toBe(false);
      expect(rule.message).toBe('5자 이상');
    });

    it('최소 길이 이상이면 true를 반환한다', () => {
      const rule = validators.minLength<{ field: string }>(5, '5자 이상');
      expect(rule.validate('abcde', {} as { field: string })).toBe(true);
    });
  });

  describe('maxLength', () => {
    it('최대 길이 초과하면 false를 반환한다', () => {
      const rule = validators.maxLength<{ field: string }>(5, '5자 이하');
      expect(rule.validate('abcdef', {} as { field: string })).toBe(false);
      expect(rule.message).toBe('5자 이하');
    });

    it('최대 길이 이하면 true를 반환한다', () => {
      const rule = validators.maxLength<{ field: string }>(5, '5자 이하');
      expect(rule.validate('abcde', {} as { field: string })).toBe(true);
    });
  });

  describe('email', () => {
    it('이메일 형식이 아니면 false를 반환한다', () => {
      const rule = validators.email<{ field: string }>('이메일 형식 오류');
      expect(rule.validate('invalid', {} as { field: string })).toBe(false);
      expect(rule.validate('invalid@', {} as { field: string })).toBe(false);
      expect(rule.message).toBe('이메일 형식 오류');
    });

    it('이메일 형식이면 true를 반환한다', () => {
      const rule = validators.email<{ field: string }>('이메일 형식 오류');
      expect(rule.validate('test@example.com', {} as { field: string })).toBe(true);
    });

    it('빈 값은 통과시킨다 (required와 조합해서 사용)', () => {
      const rule = validators.email<{ field: string }>('이메일 형식 오류');
      expect(rule.validate('', {} as { field: string })).toBe(true);
    });
  });

  describe('pattern', () => {
    it('패턴에 맞지 않으면 false를 반환한다', () => {
      const rule = validators.pattern<{ field: string }>(/^\d+$/, '숫자만');
      expect(rule.validate('abc', {} as { field: string })).toBe(false);
      expect(rule.message).toBe('숫자만');
    });

    it('패턴에 맞으면 true를 반환한다', () => {
      const rule = validators.pattern<{ field: string }>(/^\d+$/, '숫자만');
      expect(rule.validate('123', {} as { field: string })).toBe(true);
    });
  });

  describe('min', () => {
    it('최솟값 미만이면 false를 반환한다', () => {
      const rule = validators.min<{ field: number }>(10, '10 이상');
      expect(rule.validate(5, {} as { field: number })).toBe(false);
      expect(rule.message).toBe('10 이상');
    });

    it('최솟값 이상이면 true를 반환한다', () => {
      const rule = validators.min<{ field: number }>(10, '10 이상');
      expect(rule.validate(10, {} as { field: number })).toBe(true);
      expect(rule.validate(15, {} as { field: number })).toBe(true);
    });
  });

  describe('max', () => {
    it('최댓값 초과하면 false를 반환한다', () => {
      const rule = validators.max<{ field: number }>(100, '100 이하');
      expect(rule.validate(101, {} as { field: number })).toBe(false);
      expect(rule.message).toBe('100 이하');
    });

    it('최댓값 이하면 true를 반환한다', () => {
      const rule = validators.max<{ field: number }>(100, '100 이하');
      expect(rule.validate(100, {} as { field: number })).toBe(true);
      expect(rule.validate(50, {} as { field: number })).toBe(true);
    });
  });

  describe('match', () => {
    it('값이 일치하지 않으면 false를 반환한다', () => {
      const rule = validators.match<{ password: string; confirmPassword: string }>('password', '비밀번호 불일치');
      expect(rule.validate('different', { password: 'password123', confirmPassword: 'different' })).toBe(false);
      expect(rule.message).toBe('비밀번호 불일치');
    });

    it('값이 일치하면 true를 반환한다', () => {
      const rule = validators.match<{ password: string; confirmPassword: string }>('password', '비밀번호 불일치');
      expect(rule.validate('password123', { password: 'password123', confirmPassword: 'password123' })).toBe(true);
    });
  });

  describe('custom', () => {
    it('커스텀 유효성 검사를 수행할 수 있다', () => {
      const rule = validators.custom<{ field: string }>(
        (value) => value === 'admin',
        'admin만 허용'
      );
      expect(rule.validate('user', {} as { field: string })).toBe(false);
      expect(rule.validate('admin', {} as { field: string })).toBe(true);
      expect(rule.message).toBe('admin만 허용');
    });
  });
});
