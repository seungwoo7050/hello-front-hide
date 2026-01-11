/**
 * Protected Route 컴포넌트
 * 인증이 필요한 라우트를 보호
 */
import { Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';
import { useAuth } from '../../features/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  /** 로딩 중 표시할 컴포넌트 */
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { status } = useAuth();
  const location = useLocation();

  // 인증 상태 확인 중
  if (status === 'idle' || status === 'loading') {
    return fallback ?? <LoadingFallback />;
  }

  // 인증되지 않음 - 로그인 페이지로 리다이렉트
  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 인증됨 - 자식 컴포넌트 렌더링
  return <>{children}</>;
}

function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <p>인증 확인 중...</p>
    </div>
  );
}
