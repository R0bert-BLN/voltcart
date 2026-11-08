import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { Pagination } from '@/components/pagination'

describe('Pagination', () => {
  it('renders one static button per page with the current page marked', () => {
    render(<Pagination current={2} total={4} />)

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toHaveTextContent('1')
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: '3' })).not.toHaveAttribute('aria-current')
    expect(screen.queryByRole('button', { name: '5' })).not.toBeInTheDocument()
  })

  it('disables previous on the first page and next on the last', () => {
    render(<Pagination current={1} total={3} />)

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()
  })

  it('disables next on the last page', () => {
    render(<Pagination current={3} total={3} />)

    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('fires onPageChange with the clicked page and with a page step', async () => {
    const user = userEvent.setup()
    const pages: number[] = []
    render(<Pagination current={2} total={4} onPageChange={(page) => pages.push(page)} />)

    await user.click(screen.getByRole('button', { name: '3' }))
    await user.click(screen.getByRole('button', { name: 'Next page' }))

    expect(pages).toEqual([3, 3])
  })
})
