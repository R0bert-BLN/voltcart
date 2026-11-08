import { render, screen } from '@testing-library/react'

import { ProductCell } from '@/components/product-cell'
import type { ProductData } from '@/api/generated/types'

const product = {
  id: 'p1',
  name: 'Aster Air 14',
  categoryId: 'laptops',
} as Pick<ProductData, 'id' | 'name' | 'categoryId'>

describe('ProductCell', () => {
  it('renders the thumbnail image, name and sub line', () => {
    render(
      <ProductCell product={product} href="/catalog/p1" sub="€1,149.00" />,
    )

    expect(screen.getByRole('img', { name: 'Aster Air 14' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Aster Air 14' })).toHaveAttribute(
      'href',
      '/catalog/p1',
    )
    expect(screen.getByText('€1,149.00')).toBeVisible()
  })

  it('omits the sub line and the link until they are given', () => {
    render(<ProductCell product={product} />)

    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.queryByText('€1,149.00')).toBeNull()
    expect(screen.getByText('Aster Air 14')).toBeVisible()
  })
})
