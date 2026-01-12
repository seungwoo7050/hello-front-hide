/**
 * 회원가입 페이지
 */
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../features/auth'
import styles from './Register.module.css'

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {}

  if (!data.name) {
    errors.name = '이름을 입력해주세요.'
  } else if (data.name.length < 2) {
    errors.name = '이름은 2자 이상이어야 합니다.'
  }

  if (!data.email) {
    errors.email = '이메일을 입력해주세요.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.'
  }

  if (!data.password) {
    errors.password = '비밀번호를 입력해주세요.'
  } else if (data.password.length < 6) {
    errors.password = '비밀번호는 6자 이상이어야 합니다.'
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = '비밀번호 확인을 입력해주세요.'
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = '비밀번호가 일치하지 않습니다.'
  }

  return errors
}

export function Register() {
  const navigate = useNavigate()
  const { register, status, error, clearError } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      if (error) clearError()

      // 실시간 유효성 검증
      if (touched[field]) {
        const errors = validateForm({ ...formData, [field]: e.target.value })
        setFormErrors((prev) => ({ ...prev, [field]: errors[field] }))
      }
    }

  const handleBlur = (field: keyof FormData) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const errors = validateForm(formData)
    setFormErrors((prev) => ({ ...prev, [field]: errors[field] }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const errors = validateForm(formData)
    setFormErrors(errors)
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    })

    if (Object.keys(errors).length > 0) {
      return
    }

    const success = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    })
    if (success) {
      navigate('/notes', { replace: true })
    }
  }

  const isLoading = status === 'loading'

  return (
    <div className={styles.registerPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>회원가입</h1>
          <p className={styles.subtitle}>새 계정을 만들어 시작하세요</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              이름
            </label>
            <input
              id="name"
              type="text"
              className={`${styles.input} ${formErrors.name && touched.name ? styles.error : ''}`}
              value={formData.name}
              onChange={handleChange('name')}
              onBlur={handleBlur('name')}
              placeholder="이름을 입력하세요"
              disabled={isLoading}
              autoComplete="name"
            />
            {formErrors.name && touched.name && (
              <span className={styles.fieldError}>{formErrors.name}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.input} ${formErrors.email && touched.email ? styles.error : ''}`}
              value={formData.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              placeholder="example@email.com"
              disabled={isLoading}
              autoComplete="email"
            />
            {formErrors.email && touched.email && (
              <span className={styles.fieldError}>{formErrors.email}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              className={`${styles.input} ${formErrors.password && touched.password ? styles.error : ''}`}
              value={formData.password}
              onChange={handleChange('password')}
              onBlur={handleBlur('password')}
              placeholder="6자 이상의 비밀번호"
              disabled={isLoading}
              autoComplete="new-password"
            />
            {formErrors.password && touched.password && (
              <span className={styles.fieldError}>{formErrors.password}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirmPassword">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`${styles.input} ${formErrors.confirmPassword && touched.confirmPassword ? styles.error : ''}`}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              placeholder="비밀번호를 다시 입력하세요"
              disabled={isLoading}
              autoComplete="new-password"
            />
            {formErrors.confirmPassword && touched.confirmPassword && (
              <span className={styles.fieldError}>
                {formErrors.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <footer className={styles.footer}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className={styles.link}>
            로그인
          </Link>
        </footer>
      </div>
    </div>
  )
}
