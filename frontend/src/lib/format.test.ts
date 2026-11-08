import { formatPrice, formatTimestamp } from './format'

it('formats cents as EUR for en-IE', () => {
  expect(formatPrice(129900)).toBe('€1,299.00')
})

it('formats a full ISO timestamp, in UTC, in the mockup short form', () => {
  expect(formatTimestamp('2026-11-12T10:00:00.000Z')).toBe('12 Nov 2026')
})
