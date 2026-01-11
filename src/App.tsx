import { AppRouter } from './router'
import { ToastProvider } from './components/ui'

function App() {
  return (
    <ToastProvider position="top-right" maxToasts={5}>
      <AppRouter />
    </ToastProvider>
  )
}

export default App
