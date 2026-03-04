import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { PortalLayout } from './layouts/PortalLayout'
import { DashboardHome } from './pages/DashboardHome'
import { MissionControl } from './pages/MissionControl'
import { SolarOps } from './pages/SolarOps'
import { IsarvFiscal } from './pages/IsarvFiscal'
import { Fitness } from './pages/Fitness'

const BASE = import.meta.env.BASE_URL

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={BASE}>
        <Routes>
          <Route element={<PortalLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="mission-control" element={<MissionControl />} />
            <Route path="solar" element={<SolarOps />} />
            <Route path="isarv" element={<IsarvFiscal />} />
            <Route path="fitness" element={<Fitness />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
