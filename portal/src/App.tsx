import { ThemeProvider } from './contexts/ThemeContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SolarOps } from './pages/SolarOps'

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen p-6 md:p-10" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <ErrorBoundary fallbackTitle="Solar Ops error">
          <SolarOps />
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  )
}
