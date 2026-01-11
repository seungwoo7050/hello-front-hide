import styles from './About.module.css';

const stages = [
  { number: 0, name: '프로젝트 초기화', description: 'Vite + React + TypeScript 설정', completed: true },
  { number: 1, name: 'UI Kit + Playground', description: '기본 UI 컴포넌트 개발', completed: true },
  { number: 2, name: '라우팅 + 반응형', description: 'React Router, 레이아웃 시스템', completed: true },
  { number: 3, name: 'Form + Validation', description: '폼 처리 및 유효성 검사', completed: false },
  { number: 4, name: 'Notes App', description: '메모 CRUD 구현', completed: false },
  { number: 5, name: 'Local Persistence', description: 'localStorage 연동', completed: false },
  { number: 6, name: 'File Upload', description: '파일 업로드 및 미리보기', completed: false },
  { number: 7, name: 'Custom Timeline', description: 'rAF 기반 타임라인', completed: false },
  { number: 8, name: 'Web Worker', description: 'Worker 스레드 통신', completed: false },
  { number: 9, name: 'Capstone', description: '전체 기능 통합', completed: false },
  { number: 10, name: 'API Integration', description: '인증 및 서버 상태 관리', completed: false },
];

const techStack = [
  'React 19',
  'TypeScript',
  'Vite',
  'React Router',
  'CSS Modules',
  'Vitest',
  'Testing Library',
  'ESLint',
  'Prettier',
];

export function About() {
  return (
    <div className={styles.about}>
      <header className={styles.header}>
        <h1 className={styles.title}>프로젝트 소개</h1>
        <p className={styles.subtitle}>
          React + TypeScript 학습을 위한 단계별 프로젝트
        </p>
      </header>

      <div className={styles.content}>
        {/* 기술 스택 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <svg
              className={styles.sectionIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            기술 스택
          </h2>
          <div className={styles.techStack}>
            {techStack.map((tech) => (
              <span key={tech} className={styles.techBadge}>
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* 학습 단계 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <svg
              className={styles.sectionIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            학습 단계
          </h2>
          <ul className={styles.stageList}>
            {stages.map((stage) => (
              <li key={stage.number} className={styles.stageItem}>
                <span
                  className={`${styles.stageNumber} ${
                    stage.completed ? styles.stageCompleted : styles.stagePending
                  }`}
                >
                  {stage.completed ? '✓' : stage.number}
                </span>
                <div className={styles.stageContent}>
                  <div className={styles.stageName}>
                    Stage {stage.number}: {stage.name}
                  </div>
                  <div className={styles.stageDescription}>
                    {stage.description}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 학습 목표 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <svg
              className={styles.sectionIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            학습 목표
          </h2>
          <p className={styles.paragraph}>
            이 프로젝트는 현대적인 프론트엔드 개발의 핵심 개념을 단계별로 학습하기 
            위해 설계되었습니다. 각 단계는 이전 단계를 기반으로 구축되며, 실용적인 
            기능을 구현하면서 React와 TypeScript의 모범 사례를 익힐 수 있습니다.
          </p>
          <p className={styles.paragraph}>
            모든 코드는 테스트 커버리지를 유지하며, ESLint와 Prettier를 통해 
            일관된 코드 품질을 보장합니다. CSS Modules를 사용하여 스타일 충돌 없이 
            컴포넌트별 스타일링을 관리합니다.
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;
