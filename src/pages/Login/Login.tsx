/**
 * 로그인 페이지
 */
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { useAuth } from '../../features/auth'
import styles from './Login.module.css'

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {}

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

  return errors
}

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, status, error, clearError } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    '/notes'

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
    setTouched({ email: true, password: true })

    if (Object.keys(errors).length > 0) {
      return
    }

    const success = await login(formData)
    if (success) {
      navigate(from, { replace: true })
    }
  }

  const isLoading = status === 'loading'

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.subtitle}>계정에 로그인하여 노트를 관리하세요</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && <div className={styles.errorAlert}>{error}</div>}

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
              placeholder="비밀번호를 입력하세요"
              disabled={isLoading}
              autoComplete="current-password"
            />
            {formErrors.password && touched.password && (
              <span className={styles.fieldError}>{formErrors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <footer className={styles.footer}>
          계정이 없으신가요?{' '}
          <Link to="/register" className={styles.link}>
            회원가입
          </Link>
        </footer>
      </div>
    </div>
  )
}
