export function createApiClient(baseUrl: string, token: string) {
  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${baseUrl}/api${path}`
    const resp = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
    if (!resp.ok) throw new Error(`API ${resp.status}: ${resp.statusText}`)
    return resp.json()
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  }
}

let _client: ReturnType<typeof createApiClient> | null = null

export function hasToken(): boolean {
  return !!(import.meta.env.VITE_API_TOKEN || localStorage.getItem('portal_token'))
}

export function getApiUrl(): string {
  return import.meta.env.VITE_API_URL || localStorage.getItem('portal_api_url') || 'http://localhost:5080'
}

export function getApi() {
  if (!_client) {
    const baseUrl = getApiUrl()
    const token = import.meta.env.VITE_API_TOKEN || localStorage.getItem('portal_token') || ''
    _client = createApiClient(baseUrl, token)
  }
  return _client
}

export function resetApi() { _client = null }

/** Check if the API gateway is reachable (uses /api/health which is public) */
export async function checkHealth(): Promise<{ status: string; services: Record<string, string> } | null> {
  try {
    const baseUrl = getApiUrl()
    const resp = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(5000) })
    if (!resp.ok) return null
    return resp.json()
  } catch {
    return null
  }
}
