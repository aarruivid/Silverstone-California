import { useState, useEffect } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { AlertTriangle, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { checkHealth, getApiUrl } from '../lib/api'

export function PortalLayout() {
  const [showBanner, setShowBanner] = useState(false)
  const [bannerMsg, setBannerMsg] = useState('')

  useEffect(() => {
    async function check() {
      const url = getApiUrl()
      const isDefault = url === 'http://localhost:5080'
      const hasCustomUrl = !!localStorage.getItem('portal_api_url')

      if (isDefault && !hasCustomUrl && !import.meta.env.VITE_API_URL) {
        setBannerMsg('API not configured')
        setShowBanner(true)
        return
      }

      const health = await checkHealth()
      if (!health) {
        setBannerMsg('API unreachable')
        setShowBanner(true)
      }
    }
    check()
  }, [])

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-[230px] p-8 transition-all duration-200">
        {showBanner && (
          <div
            className="mb-6 px-4 py-3 rounded-lg flex items-center justify-between text-sm"
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid var(--status-warn)',
              color: 'var(--text)',
            }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} style={{ color: 'var(--status-warn)' }} />
              <span>{bannerMsg} &mdash; </span>
              <Link
                to="/settings"
                className="font-medium underline cursor-pointer"
                style={{ color: 'var(--accent)' }}
              >
                Go to Settings
              </Link>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="cursor-pointer p-1 rounded hover:bg-[var(--bg-surface-2)] transition-colors duration-150"
              aria-label="Dismiss"
            >
              <X size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}
