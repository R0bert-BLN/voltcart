export const optionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value !== '' ? value : undefined

export const optionalPage = (value: unknown): number | undefined => {
  const page = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  return Number.isInteger(page) && page > 1 ? page : undefined
}

export const optionalOneOf = <T extends string>(value: unknown, allowed: readonly T[]): T | undefined =>
  allowed.find((candidate) => candidate === value)

export const parseNextSearch = (search: Record<string, unknown>): { next?: string } => {
  const next = optionalString(search.next)
  return next?.startsWith('/') && !next.startsWith('//') ? { next } : {}
}

export const splitIds = (value: string | undefined): string[] =>
  (value ?? '').split(',').filter(Boolean)
