import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiRequest, clearToken, isSignedIn, isUnauthorized, setToken } from '@/api/client'
import type { LoginData, TokenData, UserData } from '@/api/generated/types'
import { queryKeys } from '@/api/queries/common/keys'

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

async function startSession(path: string, body: unknown): Promise<UserData> {
  const { token, user } = await apiRequest<TokenData>(path, { method: 'POST', body })
  setToken(token)
  return user
}

const login = (credentials: LoginData) => startSession('/login', credentials)

const register = (payload: RegisterPayload) =>
  startSession('/register', {
    name: payload.name,
    email: payload.email,
    password: payload.password,
  })

async function logout(): Promise<void> {
  await apiRequest<void>('/logout', { method: 'POST' })
  clearToken()
}

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => apiRequest<UserData>('/me'),
    enabled: isSignedIn(),
    throwOnError: (error) => !isUnauthorized(error),
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => queryClient.setQueryData(queryKeys.me, user),
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: register,
    onSuccess: (user) => queryClient.setQueryData(queryKeys.me, user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.setQueryData(queryKeys.me, null),
  })
}
