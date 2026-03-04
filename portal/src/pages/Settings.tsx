import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { checkHealth, getApiUrl, hasToken, resetApi } from '../lib/api'

export function Settings() {
  const [apiUrl, setApiUrl] = useState('')
  const [token, setToken] = useState('')
  const [status, setStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle')
  const [serviceInfo, setServiceInfo] = useState<Record<string, string> | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setApiUrl(localStorage.getItem('portal_api_url') || '')
    setToken(localStorage.getItem('portal_token') || '')
  }, [])

  function handleSave() {
    if (apiUrl.trim()) {
      localStorage.setItem('portal_api_url', apiUrl.trim().replace(/\/$/, ''))
    } else {
      localStorage.removeItem('portal_api_url')
    }
    if (token.trim()) {
      localStorage.setItem('portal_token', token.trim())
    } else {
      localStorage.removeItem('portal_token')
    }
    resetApi()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleTest() {
    setStatus('testing')
    setServiceInfo(null)
    // Save first so checkHealth uses the new URL
    handleSave()
    // Small delay for resetApi to take effect
    await new Promise(r => setTimeout(r, 100))
    const health = await checkHealth()
    if (health) {
      setStatus('connected')
      setServiceInfo(health.services)
    } else {
      setStatus('failed')
    }
  }

  const currentUrl = getApiUrl()
  const currentToken = hasToken()
  const maskedToken = token ? `${'*'.repeat(Math.max(0, token.length - 4))}${token.slice(-4)}` : '(not set)'

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Settings</h1>

      <div className="rounded-xl p-6 space-y-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div>
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>API Connection</h2>

          {/* API URL */}
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }} htmlFor="api-url">
            API URL
          </label>
          <input
            id="api-url"
            type="url"
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            placeholder="https://xxx-yyy-zzz.trycloudflare.com"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors duration-150"
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Leave empty to use default (localhost:5080)
          </p>
        </div>

        {/* Token */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }} htmlFor="api-token">
            API Token
          </label>
          <input
            id="api-token"
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Paste your PORTAL_API_TOKEN here"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors duration-150"
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-150"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            {saved ? 'Saved!' : 'Save'}
          </button>
          <button
            onClick={handleTest}
            disabled={status === 'testing'}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-150 flex items-center gap-2"
            style={{
              background: 'var(--bg-surface-2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              opacity: status === 'testing' ? 0.6 : 1,
            }}
          >
            <RefreshCw size={14} className={status === 'testing' ? 'animate-spin' : ''} />
            Test Connection
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="rounded-xl p-5 mt-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Connection Status</h2>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {status === 'connected' ? (
              <Wifi size={16} style={{ color: 'var(--status-ok)' }} />
            ) : (
              <WifiOff size={16} style={{ color: status === 'failed' ? 'var(--status-error)' : 'var(--text-muted)' }} />
            )}
            <span className="text-sm" style={{ color: 'var(--text)' }}>
              {status === 'idle' && 'Not tested yet'}
              {status === 'testing' && 'Testing...'}
              {status === 'connected' && 'Connected'}
              {status === 'failed' && 'Connection failed'}
            </span>
          </div>

          <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
            <p>URL: {currentUrl}</p>
            <p>Token: {currentToken ? maskedToken : '(not set)'}</p>
          </div>

          {/* Service statuses */}
          {serviceInfo && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Services</p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(serviceInfo).map(([name, state]) => (
                  <div key={name} className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: state === 'ok' ? 'var(--status-ok)' : state === 'degraded' ? 'var(--status-warn)' : 'var(--status-error)' }}
                    />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
