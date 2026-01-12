import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import styles from './NotFound.module.css'

export function NotFound() {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className={styles.notFound}>
      <div className={styles.illustration}>
        <div className={styles.errorCode}>404</div>
      </div>

      <h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>
      <p className={styles.description}>
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다. URL을
        확인하시거나 아래 버튼을 통해 이동해주세요.
      </p>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={handleGoBack}>
          뒤로 가기
        </Button>
        <Link to="/">
          <Button variant="primary">홈으로 이동</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
