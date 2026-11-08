import { render, screen } from '@testing-library/react'

import { FilterCheck } from '@/components/filter-check'
import { FilterGroup } from '@/components/filter-group'

describe('FilterGroup', () => {
  it('labels the check rows it wraps with the legend', () => {
    render(
      <FilterGroup title="Delivery methods">
        <FilterCheck name="deliveryIds" value="standard" label="Standard courier" />
      </FilterGroup>,
    )

    const group = screen.getByRole('group', { name: 'Delivery methods' })
    expect(group.tagName).toBe('FIELDSET')
    expect(screen.getByRole('checkbox', { name: 'Standard courier' })).toBeVisible()
  })
})
