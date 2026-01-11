import { AppRouter } from './router'
import { ToastProvider } from './components/ui'
import { QueryProvider } from './providers'
import { AuthProvider } from './features/auth'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
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
