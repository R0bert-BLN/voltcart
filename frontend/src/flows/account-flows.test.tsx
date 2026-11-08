/**
 * Module 1 Account, end to end: the two screens, the account menu that leads
 * into them and the signed-in state that comes out of them. Only the HTTP
 * layer (`apiRequest`) is stubbed, so the real query hooks, the real router
 * and the real shell are exercised.
 */
import type { UserData } from '@/api/generated/types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getToken, setToken } from '@/api/client'
import { routeTree } from '@/routeTree.gen'

const apiRequest = vi.hoisted(() => vi.fn())

vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>()
  return { ...actual, apiRequest }
})

const maya: UserData = {
  id: 1,
  role: 'client',
  name: 'Maya Keller',
  email: 'maya.keller@example.com',
  phone: null,
}

/** Answers the module's endpoints the way the backend does; anything else fails. */
const stubApi = (user: UserData, token = 'test-token') => {
  apiRequest.mockImplementation(async (path: string, options: { method?: string } = {}) => {
    const method = options.method ?? 'GET'
    if (method === 'POST' && path === '/login') return { token, user }
    if (method === 'POST' && path === '/register') return { token, user }
    if (method === 'POST' && path === '/logout') return undefined
    if (path === '/me') return user
    if (path === '/cart') return { lines: [], subtotalCents: 0 }
    if (path === '/wishlist') return []
    throw new Error(`unexpected API call: ${method} ${path}`)
  })
}

const renderApp = async (path: string, signedInAs?: UserData) => {
  // Like the app: a fresh query client per session, optional signed-in user.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  if (signedInAs !== undefined) {
    queryClient.setQueryData(['me'], signedInAs)
    setToken('signed-in-token')
  }
  const history = createMemoryHistory({ initialEntries: [path] })
  const router = createRouter({ routeTree, history, context: { queryClient } })
  await router.load()

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { router }
}

const inputField = (name: string): HTMLElement => {
  const input = document.querySelector(`input[name="${name}"]`)
  if (!(input instanceof HTMLElement)) throw new Error(`${name} field missing`)
  return input
}

const openAccountMenu = async () => {
  await userEvent.click(screen.getByRole('button', { name: /^Account/ }))
}

beforeEach(() => {
  localStorage.clear()
  apiRequest.mockReset()
})

describe('account flows', () => {
  it('walks the module in order and back without calling the API', async () => {
    stubApi(maya)
    const { router } = await renderApp('/')

    // Into the module: the guest account menu opens at the sign-in screen.
    await openAccountMenu()
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sign in' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible(),
    )

    // Next screen: the create-account link.
    await userEvent.click(screen.getByRole('link', { name: 'Create account' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/register'))
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Create account' })).toBeVisible(),
    )

    // Back between screens: the sign-in link.
    await userEvent.click(screen.getByRole('link', { name: 'Sign in' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))

    // Out of the module: the brand returns the guest to the store home.
    await userEvent.click(screen.getByRole('link', { name: 'Voltcart' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(screen.getByRole('button', { name: 'Account' })).toBeVisible()
    expect(apiRequest).not.toHaveBeenCalled()
  })

  it('signs a client in from the menu and lands on the store as that user', async () => {
    stubApi(maya)
    const { router } = await renderApp('/')

    await openAccountMenu()
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sign in' }))
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible())

    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), maya.email)
    await userEvent.type(inputField('password'), 'correct-horse')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(apiRequest).toHaveBeenCalledWith('/login', {
      method: 'POST',
      body: { email: maya.email, password: 'correct-horse' },
    })
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(getToken()).toBe('test-token')

    // The menu now greets the user and offers sign out, no sign-in items.
    await openAccountMenu()
    const menu = screen.getByRole('menu')
    expect(within(menu).getByText(maya.name)).toBeVisible()
    expect(within(menu).getByRole('menuitem', { name: 'Sign out' })).toBeVisible()
    expect(within(menu).queryByRole('menuitem', { name: 'Sign in' })).toBeNull()
  })

  it('creates an account from the menu and signs the new account in', async () => {
    stubApi(maya)
    const { router } = await renderApp('/')

    await openAccountMenu()
    await userEvent.click(screen.getByRole('menuitem', { name: 'Create account' }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Create account' })).toBeVisible(),
    )

    await userEvent.type(screen.getByRole('textbox', { name: 'Full name' }), maya.name)
    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), maya.email)
    await userEvent.type(inputField('password'), 'correct-horse')
    await userEvent.type(inputField('confirm'), 'correct-horse')
    await userEvent.click(screen.getByRole('checkbox', { name: /terms of sale/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    // The hook maps the confirmation onto Laravel's password_confirmation.
    expect(apiRequest).toHaveBeenCalledWith('/register', {
      method: 'POST',
      body: {
        name: maya.name,
        email: maya.email,
        password: 'correct-horse',
        password_confirmation: 'correct-horse',
        terms: true,
      },
    })
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(getToken()).toBe('test-token')
    // The store home shows the toast; query it by slot, not the role.
    await waitFor(() =>
      expect(document.querySelector('[data-slot="toast"]')).toHaveTextContent(
        'Welcome to Voltcart, Maya.',
      ),
    )

    await openAccountMenu()
    expect(within(screen.getByRole('menu')).getByText(maya.name)).toBeVisible()
  })

  it('signs out from the account menu and returns to the guest state', async () => {
    stubApi(maya)
    const { router } = await renderApp('/', maya)

    await openAccountMenu()
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }))

    expect(apiRequest).toHaveBeenCalledWith('/logout', { method: 'POST' })
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(getToken()).toBeNull()

    // Guest again: the menu offers the way into the module instead.
    await openAccountMenu()
    const menu = screen.getByRole('menu')
    expect(within(menu).getByRole('menuitem', { name: 'Sign in' })).toBeVisible()
    expect(within(menu).getByRole('menuitem', { name: 'Create account' })).toBeVisible()
    expect(within(menu).queryByRole('menuitem', { name: 'Sign out' })).toBeNull()
  })
})
