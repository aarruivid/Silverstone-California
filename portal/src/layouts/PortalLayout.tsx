import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function PortalLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-[230px] p-8 transition-all duration-200">
        <Outlet />
      </main>
    </div>
  )
}
