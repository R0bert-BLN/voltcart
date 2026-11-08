import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { ApiError } from '@/api/client'
import type { UserData } from '@/api/generated/types'
import { useLogin } from '@/api/queries/auth'
import { Field } from '@/components/field'
import { PageHead } from '@/components/page-head'
import { SubmitButton } from '@/components/submit-button'
import { Card } from '@/components/ui/card'

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

type FieldErrors = { email?: string; password?: string }

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => {
    const next = typeof search.next === 'string' ? search.next : undefined
    // Only same-origin absolute paths pass through, so a crafted link cannot
    // redirect the freshly signed-in account elsewhere.
    return next?.startsWith('/') && !next.startsWith('//') ? { next } : {}
  },
  component: LoginScreen,
})

function LoginScreen() {
  const { next } = Route.useSearch()
  const navigate = useNavigate()
  const router = useRouter()
  const login = useLogin()
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')

    const errors: FieldErrors = {}
    if (email === '') errors.email = 'Enter your email address.'
    else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.'
    if (password === '') errors.password = 'Enter your password.'
    setFieldErrors(errors)
    if (errors.email !== undefined || errors.password !== undefined) return

    try {
      const user = (await login.mutateAsync({ email, password })) as UserData
      // The role comes from the backend account: admins land on the admin
      // products until the admin dashboard is built, clients on the store.
      if (user.role === 'admin') await navigate({ to: '/admin/products' })
      else if (next !== undefined) await router.history.push(next)
      else await navigate({ to: '/' })
    } catch (submitError) {
      const apiError = submitError instanceof ApiError ? submitError : undefined

      if (apiError?.fieldErrors) {
        setFieldErrors({
          email: apiError.fieldErrors.email?.[0],
          password: apiError.fieldErrors.password?.[0],
        })
      } else {
        setFormError(apiError?.message || 'Sign in failed. Please try again.')
      }
    }
  }

  return (
    <Card className="gap-(--sp-5) p-(--sp-6)">
      <PageHead
        title="Sign in"
        subtitle="Welcome back to Voltcart."
        className="justify-center text-center"
      />
      <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          error={fieldErrors.email}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          error={fieldErrors.password}
        />
        {formError !== null ? (
          <p role="alert" className="text-center text-sm text-danger">
            {formError}
          </p>
        ) : null}
        <SubmitButton label="Sign in" variant="block" disabled={login.isPending} />
      </form>
      <p className="text-center text-sm text-(--text-muted)">
        New to Voltcart?{' '}
        <Link className="font-medium underline hover:text-text" to="/register">
          Create account
        </Link>
      </p>
    </Card>
  )
}
