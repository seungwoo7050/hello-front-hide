/**
 * 공개 라우트 (인증된 사용자는 접근 불가)
 * 이미 로그인한 사용자를 메인 페이지로 리다이렉트
 */
import { Navigate } from 'react-router'
import type { ReactNode } from 'react'
import { useAuth } from '../../features/auth'

interface PublicRouteProps {
  children: ReactNode
  /** 인증된 사용자가 리다이렉트될 경로 */
  redirectTo?: string
}

export function PublicRoute({
  children,
  redirectTo = '/notes',
}: PublicRouteProps) {
  const { status } = useAuth()

  // 인증 상태 확인 중
  if (status === 'idle' || status === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <p>로딩 중...</p>
      </div>
    )
  }

  // 이미 인증됨 - 리다이렉트
  if (status === 'authenticated') {
    return <Navigate to={redirectTo} replace />
  }

  // 인증되지 않음 - 자식 컴포넌트 렌더링
  return <>{children}</>
}
