import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '../components/layout'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { PublicRoute } from '../components/PublicRoute'
import { Spinner } from '../components/ui'

// 라우트 기반 코드 스플리팅 - React.lazy로 동적 import
const Home = lazy(() =>
  import('../pages/Home').then((m) => ({ default: m.Home }))
)
const Playground = lazy(() =>
  import('../pages/Playground').then((m) => ({ default: m.Playground }))
)
const About = lazy(() =>
  import('../pages/About').then((m) => ({ default: m.About }))
)
const FormDemo = lazy(() =>
  import('../pages/FormDemo').then((m) => ({ default: m.FormDemo }))
)
const Notes = lazy(() =>
  import('../pages/Notes').then((m) => ({ default: m.Notes }))
)
const Login = lazy(() =>
  import('../pages/Login').then((m) => ({ default: m.Login }))
)
const Register = lazy(() =>
  import('../pages/Register').then((m) => ({ default: m.Register }))
)
const NotFound = lazy(() =>
  import('../pages/NotFound').then((m) => ({ default: m.NotFound }))
)

/** 페이지 로딩 중 표시될 폴백 컴포넌트 */
function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
      }}
    >
      <Spinner size="large" />
    </div>
  )
}

/** Suspense로 감싼 lazy 컴포넌트 렌더러 */
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <LazyPage>
            <Home />
          </LazyPage>
        ),
      },
      {
        path: 'playground',
        element: (
          <LazyPage>
            <Playground />
          </LazyPage>
        ),
      },
      {
        path: 'notes',
        element: (
          <ProtectedRoute>
            <LazyPage>
              <Notes />
            </LazyPage>
          </ProtectedRoute>
        ),
      },
      {
        path: 'about',
        element: (
          <LazyPage>
            <About />
          </LazyPage>
        ),
      },
      {
        path: 'form-demo',
        element: (
          <LazyPage>
            <FormDemo />
          </LazyPage>
        ),
      },
      {
        path: '*',
        element: (
          <LazyPage>
            <NotFound />
          </LazyPage>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LazyPage>
          <Login />
        </LazyPage>
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <LazyPage>
          <Register />
        </LazyPage>
      </PublicRoute>
    ),
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

export default AppRouter
