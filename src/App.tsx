import { AppRouter } from './router'
import { ToastProvider } from './components/ui'
import { QueryProvider } from './providers'
import { AuthProvider } from './features/auth'

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider position="top-right" maxToasts={5}>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  )
}

export default App
