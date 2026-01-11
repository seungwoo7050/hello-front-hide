import { useState } from 'react'
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Spinner,
} from '../../components/ui'
import styles from './Playground.module.css'

/**
 * UI Playground 페이지
 *
 * 모든 UI Kit 컴포넌트의 상태와 변형을 시연하는 페이지
 */
export function Playground() {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadingDemo = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className={styles.playground}>
      <h1 className={styles.title}>UI 컴포넌트 Playground</h1>

      {/* Button 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Button</h2>

        <div className={styles.subsection}>
          <h3 className={styles.subsectionTitle}>변형 (Variants)</h3>
          <div className={styles.row}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </div>

        <div className={styles.subsection}>
          <h3 className={styles.subsectionTitle}>크기 (Sizes)</h3>
          <div className={styles.row}>
            <Button size="small">Small</Button>
            <Button size="medium">Medium</Button>
            <Button size="large">Large</Button>
          </div>
        </div>

        <div className={styles.subsection}>
          <h3 className={styles.subsectionTitle}>상태 (States)</h3>
          <div className={styles.row}>
            <Button>기본</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
            <Button onClick={handleLoadingDemo} loading={isLoading}>
              {isLoading ? '로딩 중...' : '클릭하여 로딩'}
            </Button>
          </div>
        </div>

        <div className={styles.subsection}>
          <h3 className={styles.subsectionTitle}>전체 너비</h3>
          <Button fullWidth>Full Width Button</Button>
        </div>
      </section>

      {/* Input 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Input</h2>

        <div className={styles.inputGrid}>
          <Input
            label="기본 입력"
            placeholder="텍스트를 입력하세요"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <Input
            label="도움말 텍스트"
            placeholder="이메일 입력"
            helperText="example@email.com 형식"
          />

          <Input
            label="에러 상태"
            placeholder="필수 입력"
            error="이 필드는 필수입니다"
          />

          <Input
            label="비활성화"
            placeholder="수정 불가"
            disabled
            value="비활성화된 값"
          />
        </div>
      </section>

      {/* Card 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Card</h2>

        <div className={styles.grid}>
          <Card variant="outlined" className={styles.cardDemo}>
            <CardHeader
              title="Outlined 카드"
              subtitle="기본 테두리 스타일"
            />
            <CardBody>
              <p>카드의 본문 내용이 들어갑니다. 다양한 콘텐츠를 담을 수 있습니다.</p>
            </CardBody>
            <CardFooter>
              <Button size="small" variant="ghost">더 보기</Button>
            </CardFooter>
          </Card>

          <Card variant="elevated" className={styles.cardDemo}>
            <CardHeader
              title="Elevated 카드"
              subtitle="그림자가 있는 스타일"
            />
            <CardBody>
              <p>elevated 변형은 카드가 떠 있는 것처럼 보이게 합니다.</p>
            </CardBody>
            <CardFooter>
              <div className={styles.row}>
                <Button size="small">확인</Button>
                <Button size="small" variant="ghost">취소</Button>
              </div>
            </CardFooter>
          </Card>

          <Card interactive className={styles.cardDemo}>
            <CardBody>
              <strong>인터랙티브 카드</strong>
              <p>클릭하거나 키보드로 선택할 수 있습니다.</p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Badge 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Badge</h2>

        <div className={styles.subsection}>
          <h3 className={styles.subsectionTitle}>색상 변형</h3>
          <div className={styles.row}>
            <Badge variant="default">Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </div>

        <div className={styles.subsection}>
          <h3 className={styles.subsectionTitle}>크기</h3>
          <div className={styles.row}>
            <Badge size="small">Small</Badge>
            <Badge size="medium">Medium</Badge>
            <Badge size="large">Large</Badge>
          </div>
        </div>

        <div className={styles.subsection}>
          <h3 className={styles.subsectionTitle}>도트 포함</h3>
          <div className={styles.row}>
            <Badge variant="success" dot>온라인</Badge>
            <Badge variant="warning" dot>대기 중</Badge>
            <Badge variant="error" dot>오프라인</Badge>
          </div>
        </div>
      </section>

      {/* Spinner 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Spinner</h2>

        <div className={styles.subsection}>
          <h3 className={styles.subsectionTitle}>크기</h3>
          <div className={styles.row}>
            <Spinner size="small" />
            <Spinner size="medium" />
            <Spinner size="large" />
          </div>
        </div>

        <div className={styles.subsection}>
          <h3 className={styles.subsectionTitle}>색상</h3>
          <div className={styles.row}>
            <Spinner color="primary" />
            <Spinner color="secondary" />
            <div style={{ backgroundColor: '#333', padding: '8px', borderRadius: '4px' }}>
              <Spinner color="white" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
