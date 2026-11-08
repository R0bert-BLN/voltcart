import { ApiError } from '@/api/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiRequest, clearToken, getToken, setToken } from '@/api/client'
import type { UserData } from '@/api/generated/types'
import { users } from '@/lib/mock-data'

export async function login(credentials: { email: string; password: string }) {
  const data = await apiRequest<{ token: string; user: unknown }>('/login', {
    method: 'POST',
    body: credentials,
  })
  setToken(data.token)
  return data.user
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  passwordConfirmation: string
  terms: boolean
}

export async function register(payload: RegisterPayload) {
  // Laravel's `confirmed` rule reads the confirmation from password_confirmation.
  const data = await apiRequest<{ token: string; user: unknown }>('/register', {
    method: 'POST',
    body: {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
      terms: payload.terms,
    },
  })
  setToken(data.token)
  return data.user
}

export async function logout() {
  await apiRequest<void>('/logout', { method: 'POST' })
  clearToken()
}

export async function fetchMe(): Promise<UserData> {
  return apiRequest<UserData>('/me')
}

export function useMe() {
  const hasToken = getToken() !== null

  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: hasToken,
    // A 401 only means "not signed in"; anything else is a real failure.
    throwOnError: (error) => (!(error instanceof ApiError) || error.status !== 401),
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => queryClient.setQueryData(['me'], user),
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: register,
    onSuccess: (user) => queryClient.setQueryData(['me'], user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.setQueryData(['me'], null),
  })
}

/** The name shown for the signed-in admin (the overview's subtitle): the
    account from the API when one is signed in, otherwise the admin of the
    data layer, so the area reads as itself outside a live session too. */
export function useAdminName(): string {
  const me = useMe()
  return me.data?.name ?? users.find((user) => user.role === 'admin')!.name
}
