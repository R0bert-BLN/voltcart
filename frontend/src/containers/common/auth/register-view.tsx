import { Link } from '@tanstack/react-router'

import { PageHead } from '@/components/common/page-head'
import { Field } from '@/components/forms/field'
import { SubmitButton } from '@/components/forms/submit-button'
import { Card } from '@/components/ui/card'
import type { RegisterErrors } from '@/lib/auth-forms'

export interface RegisterViewProps {
  errors: RegisterErrors
  formError: string | null
  isPending: boolean
  next: string | undefined
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function RegisterView({
  errors,
  formError,
  isPending,
  next,
  onSubmit,
}: RegisterViewProps) {
  return (
    <Card className="gap-(--sp-5) p-(--sp-6)">
      <PageHead
        title="Create account"
        className="justify-center text-center"
      />
      <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
        <Field
          label="Full name"
          name="name"
          required
          maxLength={80}
          autoComplete="name"
          error={errors.name}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          error={errors.email}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          error={errors.password}
        />
        {formError !== null ? (
          <p role="alert" className="text-center text-sm text-danger">
            {formError}
          </p>
        ) : null}
        <SubmitButton label="Create account" variant="block" disabled={isPending} />
      </form>
      <p className="text-center text-sm text-(--text-muted)">
        Already have an account?{' '}
        <Link
          className="font-medium underline hover:text-text"
          to="/login"
          search={next !== undefined ? { next } : {}}
        >
          Sign in
        </Link>
      </p>
    </Card>
  )
}
