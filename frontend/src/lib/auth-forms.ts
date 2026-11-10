const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export interface LoginErrors {
  email?: string | undefined
  password?: string | undefined
}

export interface RegisterErrors {
  name?: string | undefined
  email?: string | undefined
  password?: string | undefined
}

export interface LoginForm {
  email: string
  password: string
  errors: LoginErrors
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  errors: RegisterErrors
}

const text = (data: FormData, field: string): string => String(data.get(field) ?? '').trim()

const raw = (data: FormData, field: string): string => String(data.get(field) ?? '')

const hasErrors = (errors: object): boolean => Object.values(errors).some((error) => error !== undefined)

function validateEmail(email: string): string | undefined {
  if (email === '') return 'Enter your email address.'
  return EMAIL_PATTERN.test(email) ? undefined : 'Enter a valid email address.'
}

export function readLoginForm(data: FormData): LoginForm {
  const email = text(data, 'email')
  const password = raw(data, 'password')

  const errors: LoginErrors = {
    email: validateEmail(email),
    password: password === '' ? 'Enter your password.' : undefined,
  }

  return { email, password, errors }
}

export function readRegisterForm(data: FormData): RegisterForm {
  const name = text(data, 'name')
  const email = text(data, 'email')
  const password = raw(data, 'password')

  const errors: RegisterErrors = {
    name: name === '' ? 'Enter your full name.' : undefined,
    email: validateEmail(email),
    password: password === '' ? 'Enter a password.' : undefined,
  }

  return { name, email, password, errors }
}

export const isLoginValid = (form: LoginForm): boolean => !hasErrors(form.errors)

export const isRegisterValid = (form: RegisterForm): boolean => !hasErrors(form.errors)
