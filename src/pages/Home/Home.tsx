import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import styles from './Home.module.css'

const features = [
  {
    title: 'UI Kit',
    description:
      '재사용 가능한 Button, Input, Card, Badge, Spinner 컴포넌트로 구성된 디자인 시스템.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    title: 'TypeScript',
    description:
      '정적 타입 검사로 안전하고 예측 가능한 코드를 작성하며, 뛰어난 IDE 지원을 활용합니다.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: 'React Router',
    description:
      'SPA 라우팅으로 페이지 간 자연스러운 전환과 URL 기반 네비게이션을 구현합니다.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: '반응형 디자인',
    description:
      'Mobile-first 접근 방식으로 모든 화면 크기에서 최적의 사용자 경험을 제공합니다.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    title: 'CSS Modules',
    description:
      '스코프가 지정된 CSS로 스타일 충돌 없이 컴포넌트별 스타일링을 관리합니다.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22 6 12 13 2 6" />
      </svg>
    ),
  },
  {
    title: '테스트',
    description:
      'Vitest와 Testing Library로 컴포넌트 동작을 검증하고 코드 품질을 보장합니다.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
]

export function Home() {
  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Hello Front 🚀</h1>
        <p className={styles.heroSubtitle}>
          React + TypeScript 학습 여정을 위한 프로젝트입니다. 단계별로 현대적인
          프론트엔드 개발의 핵심 개념을 익혀보세요.
        </p>
        <div className={styles.heroCta}>
          <Link to="/playground">
            <Button variant="primary" size="large">
              Playground 둘러보기
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="secondary" size="large">
              프로젝트 소개
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>주요 기능</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature) => (
            <article key={feature.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
