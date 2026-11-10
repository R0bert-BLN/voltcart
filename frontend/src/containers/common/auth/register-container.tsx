import { getRouteApi, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { ApiError } from '@/api/client'
import { useRegister } from '@/api/queries/common/auth'
import { RegisterView } from '@/components/views/common/register-view'
import { isRegisterValid, readRegisterForm, type RegisterErrors } from '@/lib/auth-forms'
import { firstName } from '@/lib/format'
import { showToast } from '@/lib/toasts'

const route = getRouteApi('/register')

export function RegisterContainer() {
  const { next } = route.useSearch()
  const navigate = useNavigate()
  const router = useRouter()
  const register = useRegister()
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const form = readRegisterForm(new FormData(event.currentTarget))
    setErrors(form.errors)
    if (!isRegisterValid(form)) return

    try {
      await register.mutateAsync({
        name: form.name,
        email: form.email,
        password: form.password,
      })
      showToast(`Welcome to Voltcart, ${firstName(form.name)}.`)
      if (next !== undefined) await router.history.push(next)
      else await navigate({ to: '/' })
    } catch (error) {
      const apiError = error instanceof ApiError ? error : undefined

      if (apiError?.fieldErrors) {
        const { name, email, password } = apiError.fieldErrors
        setErrors({
          name: name?.[0],
          email: email?.[0],
          password: password?.[0],
        })
      } else {
        setFormError(apiError?.message || 'Creating the account failed. Please try again.')
      }
    }
  }

  return (
    <RegisterView
      errors={errors}
      formError={formError}
      isPending={register.isPending}
      next={next}
      onSubmit={(event) => void handleSubmit(event)}
    />
  )
}
