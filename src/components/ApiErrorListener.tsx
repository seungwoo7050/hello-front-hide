import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { subscribeToApiErrors } from '../api/events'
import { useAuth } from '../features/auth'
import { useToast } from './ui'

/**
 * API 에러를 전역적으로 감지하고 사용자 친화적인 피드백을 제공
 */
export function ApiErrorListener() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const { error: showError } = useToast()

  useEffect(() => {
    const unsubscribe = subscribeToApiErrors((apiError) => {
      if (apiError.status === 401) {
        logout()
        showError('세션이 만료되었습니다. 다시 로그인해주세요.')
        if (location.pathname !== '/login') {
          navigate('/login', { replace: true, state: { from: location } })
        }
        return
      }

      if (apiError.status === 403) {
        showError('접근 권한이 없습니다.')
        return
      }

      if (apiError.status === 0 || apiError.code === 'NETWORK_ERROR') {
        showError('네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.')
        return
      }

      if (apiError.status >= 500) {
        showError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        return
      }

      showError(apiError.message || '요청 처리 중 문제가 발생했습니다.')
    })

    return unsubscribe
  }, [logout, navigate, showError, location])

  return null
}

export default ApiErrorListener
