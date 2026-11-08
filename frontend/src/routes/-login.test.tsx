import { ApiError } from '@/api/client'
import type { UserData } from '@/api/generated/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { routeTree } from '@/routeTree.gen'

const loginMock = vi.hoisted(() => vi.fn())
const pendingMock = vi.hoisted(() => ({ value: false }))

vi.mock('@/api/queries/auth', () => ({
  useLogin: () => ({ mutateAsync: loginMock, isPending: pendingMock.value }),
}))

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

const client: UserData = {
  id: 1,
  role: 'client',
  name: 'Maya Keller',
  email: 'maya.keller@example.com',
  phone: null,
}

const admin: UserData = { id: 2, role: 'admin', name: 'Daniel Roth', email: 'daniel.roth@voltcart.example', phone: null }

beforeEach(() => {
  localStorage.clear()
  loginMock.mockReset()
  pendingMock.value = false
})

describe('auth-login screen', () => {
  it('shows the brand, the heading, the fields, the submit button and the create-account link, in order', async () => {
    const { container } = await renderRoute('/login')

    expect(screen.getByRole('link', { name: 'Voltcart' })).toBeVisible()
    const heading = screen.getByRole('heading', { level: 1, name: 'Sign in' })
    expect(screen.getByText('Welcome back to Voltcart.')).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeVisible()
    const email = container.querySelector('input[name="email"]')
    const password = container.querySelector('input[name="password"]')
    expect(password).toHaveAttribute('type', 'password')
    const submit = screen.getByRole('button', { name: 'Sign in' })
    const registerLink = screen.getByRole('link', { name: 'Create account' })

    // Screen order: logo and name, fields, button, create-account link.
    expect(heading.compareDocumentPosition(email!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(email!.compareDocumentPosition(password!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(password!.compareDocumentPosition(submit)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(submit.compareDocumentPosition(registerLink)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect((submit as HTMLButtonElement).type).toBe('submit')

    expect((registerLink as HTMLAnchorElement).getAttribute('href')).toContain('/register')
  })

  it('shows an inline error under each empty field and does not call the API', async () => {
    await renderRoute('/login')

    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByText('Enter your email address.')).toBeVisible()
    expect(screen.getByText('Enter your password.')).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInvalid()
    expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeDisabled()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('rejects a badly formed email inline without calling the API', async () => {
    await renderRoute('/login')

    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'maya@nowhere')
    await userEvent.type(passwordField(), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(screen.getByText('Enter a valid email address.')).toBeVisible()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('signs a client in and opens the store home', async () => {
    loginMock.mockResolvedValue(client)
    const { router } = await renderRoute('/login')

    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'maya.keller@example.com')
    await userEvent.type(passwordField(), 'correct-horse')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(loginMock).toHaveBeenCalledWith({
      email: 'maya.keller@example.com',
      password: 'correct-horse',
    })
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })

  it('opens the admin products for an admin sign-in', async () => {
    loginMock.mockResolvedValue(admin)
    const { router } = await renderRoute('/login')

    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'daniel.roth@voltcart.example')
    await userEvent.type(passwordField(), 'admin-pass')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/products'))
  })

  it('redirects a client to the next path from the query string', async () => {
    loginMock.mockResolvedValue(client)
    const { router } = await renderRoute('/login?next=%2Fwishlist')

    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'maya.keller@example.com')
    await userEvent.type(passwordField(), 'correct-horse')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/wishlist'))
  })

  it('shows backend field errors inline under their field', async () => {
    loginMock.mockRejectedValue(
      new ApiError(422, 'These credentials do not match our records.', {
        email: ['These credentials do not match our records.'],
      }),
    )
    await renderRoute('/login')

    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'maya.keller@example.com')
    await userEvent.type(passwordField(), 'wrong-pass')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('These credentials do not match our records.')).toBeVisible()
  })

  it('shows non-field backend failures as a form-level error', async () => {
    loginMock.mockRejectedValue(new ApiError(500, 'Server error'))
    await renderRoute('/login')

    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'maya.keller@example.com')
    await userEvent.type(passwordField(), 'correct-horse')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Server error')
    expect(screen.queryByText('These credentials do not match our records.')).toBeNull()
  })

  it('disables the submit button while the request is pending', async () => {
    pendingMock.value = true
    await renderRoute('/login')

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled()
  })
})

function passwordField(): HTMLElement {
  const input = document.querySelector('input[name="password"]')
  if (!(input instanceof HTMLElement)) throw new Error('password field missing')
  return input
}
