import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { PortalLayout } from './layouts/PortalLayout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DashboardHome } from './pages/DashboardHome'
import { MissionControl } from './pages/MissionControl'
import { SolarOps } from './pages/SolarOps'
import { IsarvFiscal } from './pages/IsarvFiscal'
import { Fitness } from './pages/Fitness'
import { Settings } from './pages/Settings'

const BASE = import.meta.env.BASE_URL

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={BASE}>
        <Routes>
          <Route element={<PortalLayout />}>
            <Route index element={<ErrorBoundary fallbackTitle="Dashboard error"><DashboardHome /></ErrorBoundary>} />
            <Route path="mission-control" element={<ErrorBoundary fallbackTitle="Mission Control error"><MissionControl /></ErrorBoundary>} />
            <Route path="solar" element={<ErrorBoundary fallbackTitle="Solar Ops error"><SolarOps /></ErrorBoundary>} />
            <Route path="isarv" element={<ErrorBoundary fallbackTitle="ISARV error"><IsarvFiscal /></ErrorBoundary>} />
            <Route path="fitness" element={<ErrorBoundary fallbackTitle="Fitness error"><Fitness /></ErrorBoundary>} />
            <Route path="settings" element={<ErrorBoundary fallbackTitle="Settings error"><Settings /></ErrorBoundary>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
