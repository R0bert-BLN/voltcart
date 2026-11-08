import { ApiError } from '@/api/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiRequest, clearToken, getToken, setToken } from '@/api/client'
import type { UserData } from '@/api/generated/types'

export async function login(credentials: { email: string; password: string }) {
  const data = await apiRequest<{ token: string; user: unknown }>('/login', {
    method: 'POST',
    body: credentials,
  })
  setToken(data.token)
  return data.user
}

export async function register(payload: { name: string; email: string; password: string }) {
  const data = await apiRequest<{ token: string; user: unknown }>('/register', {
    method: 'POST',
    body: payload,
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
