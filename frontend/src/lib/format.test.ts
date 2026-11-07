import { formatPrice } from './format'

it('formats cents as EUR for en-IE', () => {
  expect(formatPrice(129900)).toBe('€1,299.00')
})
