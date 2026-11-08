import { ApiError } from '@/api/client'
import type { UserData } from '@/api/generated/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { routeTree } from '@/routeTree.gen'

const registerMock = vi.hoisted(() => vi.fn())
const pendingMock = vi.hoisted(() => ({ value: false }))

vi.mock('@/api/queries/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/queries/auth')>()
  return {
    ...actual,
    // The store top bar on the destination screen reads the account; the
    // mocked register never sets a token, so the query stays disabled.
    useMe: actual.useMe,
    useRegister: () => ({ mutateAsync: registerMock, isPending: pendingMock.value }),
  }
})

const renderRoute = async (path: string) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const history = createMemoryHistory({ initialEntries: [path] })
  const router = createRouter({ routeTree, history, context: { queryClient } })
  await router.load()

  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { router, container: view.container }
}

const user: UserData = {
  id: 3,
  role: 'client',
  name: 'Maya Keller',
  email: 'maya.keller@example.com',
  phone: null,
}

const fillForm = async (
  values: { name?: string; email?: string; password?: string; confirm?: string } = {},
  { terms = true }: { terms?: boolean } = {},
) => {
  await userEvent.type(input('name'), values.name ?? 'Maya Keller')
  await userEvent.type(input('email'), values.email ?? 'maya.keller@example.com')
  await userEvent.type(input('password'), values.password ?? 'correct-horse')
  await userEvent.type(input('confirm'), values.confirm ?? values.password ?? 'correct-horse')
  if (terms) await userEvent.click(screen.getByRole('checkbox', { name: /terms of sale/ }))
}

beforeEach(() => {
  localStorage.clear()
  registerMock.mockReset()
  pendingMock.value = false
})

describe('auth-register screen', () => {
  it('shows the heading, the fields, the terms checkbox, the submit button, the sign-in link and the legal note, in order', async () => {
    const { container } = await renderRoute('/register')

    expect(screen.getByRole('link', { name: 'Voltcart' })).toBeVisible()
    const heading = screen.getByRole('heading', { level: 1, name: 'Create account' })
    expect(screen.getByText('Shop faster and keep track of your orders.')).toBeVisible()

    const name = container.querySelector('input[name="name"]')
    const email = container.querySelector('input[name="email"]')
    const password = container.querySelector('input[name="password"]')
    const confirm = container.querySelector('input[name="confirm"]')
    const terms = screen.getByRole('checkbox', { name: /terms of sale/ })
    const submit = screen.getByRole('button', { name: 'Create account' })
    const note = screen.getByRole('note')
    const loginLink = screen.getByRole('link', { name: 'Sign in' })

    // Screen order: heading, the four fields, the terms checkbox, the button,
    // the sign-in link, the legal note.
    const following = (first: Element, second: Element) =>
      first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING
    expect(following(heading, name!)).toBeTruthy()
    expect(following(name!, email!)).toBeTruthy()
    expect(following(email!, password!)).toBeTruthy()
    expect(following(password!, confirm!)).toBeTruthy()
    expect(following(confirm!, terms)).toBeTruthy()
    expect(following(terms, submit)).toBeTruthy()
    expect(following(submit, loginLink)).toBeTruthy()
    expect(following(loginLink, note)).toBeTruthy()

    expect((submit as HTMLButtonElement).type).toBe('submit')
    expect(name).toHaveAttribute('autocomplete', 'name')
    expect(email).toHaveAttribute('type', 'email')
    expect(password).toHaveAttribute('type', 'password')
    expect(confirm).toHaveAttribute('type', 'password')
    expect(screen.getByText('At least 8 characters.')).toBeVisible()
    expect((loginLink as HTMLAnchorElement).getAttribute('href')).toContain('/login')
    expect(note).toHaveTextContent('Requires legal validation before implementation.')
  })

  it('passes the next path from the query string on to the sign-in link', async () => {
    await renderRoute('/register?next=%2Fwishlist')

    const link = screen.getByRole('link', { name: 'Sign in' }) as HTMLAnchorElement

    expect(link.getAttribute('href')).toBe('/login?next=%2Fwishlist')
  })

  it('shows an inline error under each empty field and does not call the API', async () => {
    await renderRoute('/register')

    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByText('Enter your full name.')).toBeVisible()
    expect(screen.getByText('Enter your email address.')).toBeVisible()
    expect(screen.getByText('Enter a password.')).toBeVisible()
    expect(screen.getByText('Enter the password again.')).toBeVisible()
    expect(screen.getByText('Accept the terms to create an account.')).toBeVisible()
    expect(registerMock).not.toHaveBeenCalled()
  })

  it('rejects a badly formed email inline without calling the API', async () => {
    await renderRoute('/register')

    await fillForm({ email: 'maya@nowhere' })
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByText('Enter a valid email address.')).toBeVisible()
    expect(registerMock).not.toHaveBeenCalled()
  })

  it('rejects a short password inline without calling the API', async () => {
    await renderRoute('/register')

    await fillForm({ password: 'short', confirm: 'short' })
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByText('Use at least 8 characters.')).toBeVisible()
    expect(registerMock).not.toHaveBeenCalled()
  })

  it('rejects mismatched passwords inline without calling the API', async () => {
    await renderRoute('/register')

    await fillForm({ confirm: 'different-horse' })
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByText('The passwords do not match.')).toBeVisible()
    expect(registerMock).not.toHaveBeenCalled()
  })

  it('does not call the API while the terms checkbox is unchecked', async () => {
    await renderRoute('/register')

    await fillForm({}, { terms: false })
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(screen.getByText('Accept the terms to create an account.')).toBeVisible()
    expect(screen.getByRole('checkbox', { name: /terms of sale/ })).toBeInvalid()
    expect(registerMock).not.toHaveBeenCalled()
  })

  it('registers, shows the welcome toast and opens the store home', async () => {
    registerMock.mockResolvedValue(user)
    const { router } = await renderRoute('/register')

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(registerMock).toHaveBeenCalledWith({
      name: 'Maya Keller',
      email: 'maya.keller@example.com',
      password: 'correct-horse',
      passwordConfirmation: 'correct-horse',
      terms: true,
    })
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    // The store home is a placeholder in this ticket, so query the toast box
    // by its slot instead of the role.
    await waitFor(() =>
      expect(document.querySelector('[data-slot="toast"]')).toHaveTextContent(
        'Welcome to Voltcart, Maya.',
      ),
    )
  })

  it('redirects to the next path from the query string', async () => {
    registerMock.mockResolvedValue(user)
    const { router } = await renderRoute('/register?next=%2Fwishlist')

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/wishlist'))
  })

  it('shows backend field errors inline under their field', async () => {
    registerMock.mockRejectedValue(
      new ApiError(422, 'The email has already been taken.', {
        email: ['The email has already been taken.'],
      }),
    )
    await renderRoute('/register')

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('The email has already been taken.')).toBeVisible()
  })

  it('shows non-field backend failures as a form-level error', async () => {
    registerMock.mockRejectedValue(new ApiError(500, 'Server error'))
    await renderRoute('/register')

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Server error')
  })

  it('disables the submit button while the request is pending', async () => {
    pendingMock.value = true
    await renderRoute('/register')

    expect(screen.getByRole('button', { name: 'Create account' })).toBeDisabled()
  })
})

function input(name: string): HTMLElement {
  const element = document.querySelector(`input[name="${name}"]`)
  if (!(element instanceof HTMLElement)) throw new Error(`${name} field missing`)
  return element
}
