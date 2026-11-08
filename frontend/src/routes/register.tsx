import { createFileRoute, Link, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { ApiError } from '@/api/client'
import { useRegister } from '@/api/queries/auth'
import { Check } from '@/components/check'
import { Field } from '@/components/field'
import { Note } from '@/components/note'
import { PageHead } from '@/components/page-head'
import { SubmitButton } from '@/components/submit-button'
import { Card } from '@/components/ui/card'
import { showToast } from '@/lib/toasts'

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

type FieldErrors = { name?: string; email?: string; password?: string; confirm?: string }

export const Route = createFileRoute('/register')({
  validateSearch: (search: Record<string, unknown>) => {
    const next = typeof search.next === 'string' ? search.next : undefined
    // Same guard as auth-login: only same-origin absolute paths pass through.
    return next?.startsWith('/') && !next.startsWith('//') ? { next } : {}
  },
  component: RegisterScreen,
})

function RegisterScreen() {
  const { next } = Route.useSearch()
  const navigate = useNavigate()
  const router = useRouter()
  const register = useRegister()
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [termsError, setTermsError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setTermsError(null)

    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    const confirm = String(data.get('confirm') ?? '')
    const terms = data.get('terms') === 'on'

    const errors: FieldErrors = {}
    if (name === '') errors.name = 'Enter your full name.'
    if (email === '') errors.email = 'Enter your email address.'
    else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.'
    if (password === '') errors.password = 'Enter a password.'
    else if (password.length < 8) errors.password = 'Use at least 8 characters.'
    if (confirm === '') errors.confirm = 'Enter the password again.'
    else if (confirm !== password) errors.confirm = 'The passwords do not match.'
    setFieldErrors(errors)
    if (!terms) setTermsError('Accept the terms to create an account.')
    if (errors.name !== undefined || errors.email !== undefined || errors.password !== undefined) {
      return
    }
    if (!terms || errors.confirm !== undefined) return

    try {
      await register.mutateAsync({ name, email, password, passwordConfirmation: confirm, terms })
      // A new account is always a client; take them where they left off.
      showToast(`Welcome to Voltcart, ${name.split(' ')[0]}.`)
      if (next !== undefined) await router.history.push(next)
      else await navigate({ to: '/' })
    } catch (submitError) {
      const apiError = submitError instanceof ApiError ? submitError : undefined

      if (apiError?.fieldErrors) {
        setFieldErrors({
          name: apiError.fieldErrors.name?.[0],
          email: apiError.fieldErrors.email?.[0],
          password:
            apiError.fieldErrors.password?.[0] ?? apiError.fieldErrors.password_confirmation?.[0],
          confirm: apiError.fieldErrors.password_confirmation?.[0],
        })
        setTermsError(apiError.fieldErrors.terms?.[0] ?? null)
      } else {
        setFormError(apiError?.message || 'Creating the account failed. Please try again.')
      }
    }
  }

  return (
    <Card className="gap-(--sp-5) p-(--sp-6)">
      <PageHead
        title="Create account"
        subtitle="Shop faster and keep track of your orders."
        className="justify-center text-center"
      />
      <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
        <Field
          label="Full name"
          name="name"
          required
          maxLength={80}
          autoComplete="name"
          error={fieldErrors.name}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          error={fieldErrors.email}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          required
          hint="At least 8 characters."
          autoComplete="new-password"
          error={fieldErrors.password}
        />
        <Field
          label="Confirm password"
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          error={fieldErrors.confirm}
        />
        <Check
          label="I accept the terms of sale and the privacy policy."
          name="terms"
          error={termsError ?? undefined}
        />
        {formError !== null ? (
          <p role="alert" className="text-center text-sm text-danger">
            {formError}
          </p>
        ) : null}
        <SubmitButton label="Create account" variant="block" disabled={register.isPending} />
      </form>
      <p className="text-center text-sm text-(--text-muted)">
        Already have an account?{' '}
        <Link className="font-medium underline hover:text-text" to="/login" search={next !== undefined ? { next } : {}}>
          Sign in
        </Link>
      </p>
      <Note />
    </Card>
  )
}
