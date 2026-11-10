import { Link } from '@tanstack/react-router'

import { PageHead } from '@/components/common/page-head'
import { Field } from '@/components/forms/field'
import { SubmitButton } from '@/components/forms/submit-button'
import { Card } from '@/components/ui/card'
import type { LoginErrors } from '@/lib/auth-forms'

export interface LoginViewProps {
  errors: LoginErrors
  formError: string | null
  isPending: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function LoginView({ errors, formError, isPending, onSubmit }: LoginViewProps) {
  return (
    <Card className="gap-(--sp-5) p-(--sp-6)">
      <PageHead
        title="Sign in"
        className="justify-center text-center"
      />
      <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          error={errors.email}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          error={errors.password}
        />
        {formError !== null ? (
          <p role="alert" className="text-center text-sm text-danger">
            {formError}
          </p>
        ) : null}
        <SubmitButton label="Sign in" variant="block" disabled={isPending} />
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
