import { getRouteApi, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { ApiError } from '@/api/client'
import { useLogin } from '@/api/queries/common/auth'
import { LoginView } from '@/containers/common/auth/login-view'
import { isLoginValid, readLoginForm, type LoginErrors } from '@/lib/auth-forms'

const route = getRouteApi('/login')

export function LoginContainer() {
  const { next } = route.useSearch()
  const navigate = useNavigate()
  const router = useRouter()
  const login = useLogin()
  const [errors, setErrors] = useState<LoginErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const form = readLoginForm(new FormData(event.currentTarget))
    setErrors(form.errors)
    if (!isLoginValid(form)) return

    try {
      const user = await login.mutateAsync({ email: form.email, password: form.password })
      if (user.role === 'admin') await navigate({ to: '/admin' })
      else if (next !== undefined) await router.history.push(next)
      else await navigate({ to: '/' })
    } catch (error) {
      const apiError = error instanceof ApiError ? error : undefined

      if (apiError?.fieldErrors) {
        setErrors({
          email: apiError.fieldErrors.email?.[0],
          password: apiError.fieldErrors.password?.[0],
        })
      } else {
        setFormError(apiError?.message || 'Sign in failed. Please try again.')
      }
    }
  }

  return (
    <LoginView
      errors={errors}
      formError={formError}
      isPending={login.isPending}
      onSubmit={(event) => void handleSubmit(event)}
    />
  )
}
