import { AppRouter } from './router'
import { ToastProvider } from './components/ui'
import { QueryProvider } from './providers'

function App() {
  return (
    <QueryProvider>
      <ToastProvider position="top-right" maxToasts={5}>
        <AppRouter />
      </ToastProvider>
    </QueryProvider>
  )
}

export default App
