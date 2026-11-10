export class ApiError extends Error {
  status: number
  fieldErrors?: Record<string, string[]>

  constructor(status: number, message: string, fieldErrors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

const TOKEN_KEY = 'voltcart.auth.token'

const getToken = (): string | null => localStorage.getItem(TOKEN_KEY)

export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token)

export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY)

export const isSignedIn = (): boolean => getToken() !== null

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown }

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options

  const response = await fetch(`/api${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)

    const fieldErrors: Record<string, string[]> | undefined =
      typeof errorBody?.errors === 'object' && errorBody.errors !== null
        ? (errorBody.errors as Record<string, string[]>)
        : undefined

    throw new ApiError(
      response.status,
      typeof errorBody?.message === 'string' ? errorBody.message : response.statusText,
      fieldErrors,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const isUnauthorized = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 401

export const isForbidden = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 403

export const isNotFound = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 404
