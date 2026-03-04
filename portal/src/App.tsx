import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { PortalLayout } from './layouts/PortalLayout'
import { DashboardHome } from './pages/DashboardHome'

const BASE = import.meta.env.BASE_URL

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={BASE}>
        <Routes>
          <Route element={<PortalLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="mission-control" element={<div className="text-[var(--text)]">Mission Control — Coming soon</div>} />
            <Route path="solar" element={<div className="text-[var(--text)]">Solar Ops — Coming soon</div>} />
            <Route path="isarv" element={<div className="text-[var(--text)]">ISARV — Coming soon</div>} />
            <Route path="fitness" element={<div className="text-[var(--text)]">Fitness — Coming soon</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
