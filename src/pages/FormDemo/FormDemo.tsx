import {
  Button,
  Input,
  Form,
  FormGroup,
  FormActions,
  Textarea,
  Select,
  Checkbox,
  useToast,
} from '../../components/ui'
import { useForm, validators } from '../../hooks'
import styles from './FormDemo.module.css'

interface ContactFormValues {
  name: string
  email: string
  category: string
  message: string
  subscribe: boolean
}

const categoryOptions = [
  { value: 'general', label: '일반 문의' },
  { value: 'support', label: '기술 지원' },
  { value: 'feedback', label: '피드백' },
  { value: 'partnership', label: '제휴 문의' },
]

export function FormDemo() {
  const { success, error, warning, info } = useToast()

  const form = useForm<ContactFormValues>({
    initialValues: {
      name: '',
      email: '',
      category: '',
      message: '',
      subscribe: false,
    },
    validationRules: {
      name: [
        validators.required('이름을 입력해주세요'),
        validators.minLength(2, '이름은 최소 2자 이상이어야 합니다'),
      ],
      email: [
        validators.required('이메일을 입력해주세요'),
        validators.email('올바른 이메일 형식이 아닙니다'),
      ],
      category: [validators.required('카테고리를 선택해주세요')],
      message: [
        validators.required('메시지를 입력해주세요'),
        validators.minLength(10, '메시지는 최소 10자 이상 입력해주세요'),
        validators.maxLength(500, '메시지는 500자를 초과할 수 없습니다'),
      ],
    },
    onSubmit: async (values) => {
      // 제출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log('Form submitted:', values)
      success('폼이 성공적으로 제출되었습니다!', { title: '제출 완료' })
      form.resetForm()
    },
    validateOnBlur: true,
  })

  const handleToastDemo = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: { message: '작업이 성공적으로 완료되었습니다.', title: '성공' },
      error: {
        message: '오류가 발생했습니다. 다시 시도해주세요.',
        title: '오류',
      },
      warning: { message: '주의가 필요한 항목이 있습니다.', title: '경고' },
      info: { message: '새로운 업데이트가 있습니다.', title: '알림' },
    }

    const { message: msg, title } = messages[type]
    switch (type) {
      case 'success':
        success(msg, { title })
        break
      case 'error':
        error(msg, { title })
        break
      case 'warning':
        warning(msg, { title })
        break
      case 'info':
        info(msg, { title })
        break
    }
  }

  return (
    <div className={styles.formDemo}>
      <header className={styles.header}>
        <h1 className={styles.title}>Form + Validation</h1>
        <p className={styles.subtitle}>
          폼 컴포넌트와 유효성 검사, 토스트 알림 데모
        </p>
      </header>

      {/* 토스트 데모 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Toast 알림</h2>
        <div className={styles.toastButtons}>
          <Button variant="primary" onClick={() => handleToastDemo('success')}>
            성공
          </Button>
          <Button variant="secondary" onClick={() => handleToastDemo('error')}>
            오류
          </Button>
          <Button variant="ghost" onClick={() => handleToastDemo('warning')}>
            경고
          </Button>
          <Button variant="ghost" onClick={() => handleToastDemo('info')}>
            정보
          </Button>
        </div>
      </section>

      {/* 폼 데모 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>문의 폼</h2>
        <div className={styles.formCard}>
          <Form onSubmit={form.handleSubmit}>
            <FormGroup row>
              <Input
                label="이름"
                placeholder="홍길동"
                required
                error={form.touched.name ? form.errors.name : undefined}
                {...form.getFieldProps('name')}
              />
              <Input
                label="이메일"
                type="email"
                placeholder="email@example.com"
                required
                error={form.touched.email ? form.errors.email : undefined}
                {...form.getFieldProps('email')}
              />
            </FormGroup>

            <FormGroup>
              <Select
                label="문의 유형"
                placeholder="카테고리를 선택하세요"
                options={categoryOptions}
                required
                error={form.touched.category ? form.errors.category : undefined}
                {...form.getFieldProps('category')}
              />
            </FormGroup>

            <FormGroup>
              <Textarea
                label="메시지"
                placeholder="문의 내용을 입력해주세요..."
                required
                showCharCount
                maxLength={500}
                error={form.touched.message ? form.errors.message : undefined}
                {...form.getFieldProps('message')}
              />
            </FormGroup>

            <FormGroup>
              <Checkbox
                label="새로운 소식과 업데이트를 이메일로 받겠습니다"
                checked={form.values.subscribe}
                name="subscribe"
                onChange={form.handleChange}
                onBlur={form.handleBlur}
              />
            </FormGroup>

            <FormActions align="end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => form.resetForm()}
                disabled={!form.isDirty}
              >
                초기화
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={form.isSubmitting}
                disabled={form.isSubmitting}
              >
                제출하기
              </Button>
            </FormActions>
          </Form>
        </div>
      </section>
    </div>
  )
}

export default FormDemo
