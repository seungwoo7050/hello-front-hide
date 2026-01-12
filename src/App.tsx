import { useEffect } from 'react'
import { AppRouter } from './router'
import { ToastProvider } from './components/ui'
import { QueryProvider } from './providers'
import { AuthProvider } from './features/auth'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  useEffect(() => {
    // MSW 워커 시작 (항상 시작 - API 모킹 필요)
    import('./mocks/browser')
      .then(({ worker }) => {
        worker.start({
          onUnhandledRequest: 'bypass',
        })
      })
      .catch((err) => console.error('MSW setup failed:', err))
  }, [])

  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <ToastProvider position="top-right" maxToasts={5}>
            <AppRouter />
          </ToastProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}

export default App
