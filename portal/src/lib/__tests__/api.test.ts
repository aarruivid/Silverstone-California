import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApiClient } from '../api'

describe('API Client', () => {
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn()) })

  it('adds auth header', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }))
    const api = createApiClient('https://example.com', 'test-token')
    await api.get('/health')
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'https://example.com/api/health',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    )
  })

  it('throws on non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 401, statusText: 'Unauthorized' }))
    const api = createApiClient('https://example.com', 'bad')
    await expect(api.get('/test')).rejects.toThrow('API 401')
  })
})
