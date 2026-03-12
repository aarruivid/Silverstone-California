import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SolarOps } from './pages/SolarOps'

const BASE = import.meta.env.BASE_URL

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={BASE}>
        <Routes>
          <Route index element={<ErrorBoundary fallbackTitle="Solar Ops error"><SolarOps /></ErrorBoundary>} />
          <Route path="*" element={<ErrorBoundary fallbackTitle="Solar Ops error"><SolarOps /></ErrorBoundary>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
