import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError, apiRequest, clearToken, getToken, setToken } from '@/api/client'

describe('token storage', () => {
  afterEach(() => clearToken())

  it('stores and clears the token', () => {
    expect(getToken()).toBeNull()
    setToken('tok-1')
    expect(getToken()).toBe('tok-1')
    clearToken()
    expect(getToken()).toBeNull()
  })
})

describe('apiRequest', () => {
  beforeEach(() => clearToken())
  afterEach(() => vi.unstubAllGlobals())

  it('sends JSON body, content type and bearer token', async () => {
    setToken('tok-1')
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await apiRequest('/me', { method: 'POST', body: { email: 'a@b.co' } })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/me')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: 'Bearer tok-1',
    })
    expect(init.body).toBe(JSON.stringify({ email: 'a@b.co' }))
  })

  it('omits the Authorization header when there is no token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await apiRequest('/ping')

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers).not.toHaveProperty('Authorization')
  })

  it('maps 422 field errors to a typed ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ message: 'The given data was invalid.', errors: { email: ['taken'] } }),
          { status: 422 },
        ),
      ),
    )

    const error = (await apiRequest('/register').catch((e) => e)) as ApiError

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(422)
    expect(error.fieldErrors).toEqual({ email: ['taken'] })
  })

  it('throws an ApiError for other non-ok statuses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'Unauthenticated.' }), { status: 401 }),
      ),
    )

    const error = (await apiRequest('/me').catch((e) => e)) as ApiError

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(401)
    expect(error.message).toBe('Unauthenticated.')
  })
})
