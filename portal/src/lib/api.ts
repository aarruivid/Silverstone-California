export function createApiClient(baseUrl: string, token: string) {
  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${baseUrl}/api${path}`
    const resp = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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

export function getApi() {
  if (!_client) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5080'
    const token = import.meta.env.VITE_API_TOKEN || localStorage.getItem('portal_token') || ''
    _client = createApiClient(baseUrl, token)
  }
  return _client
}

export function resetApi() { _client = null }
