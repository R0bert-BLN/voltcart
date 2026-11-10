const EMPTY_STATE_ACTION = '[data-slot="empty"] a'

export const removeButtonSelector = (id: string): string => `[data-remove="${id}"]`

export function focusAfterPaint(selector: string): void {
  requestAnimationFrame(() => document.querySelector<HTMLElement>(selector)?.focus())
}

export function focusAfterRemoval(
  remainingIds: string[],
  removedIndex: number,
  selectorFor: (id: string) => string,
): void {
  const next = remainingIds[Math.min(removedIndex, remainingIds.length - 1)]
  focusAfterPaint(next === undefined ? EMPTY_STATE_ACTION : selectorFor(next))
}

export function focusField(name: string, options: { select?: boolean } = {}): void {
  const field = document.querySelector<HTMLInputElement>(
    `[data-slot=product-form] [name="${name}"]`,
  )
  field?.focus()
  if (options.select) field?.select()
}
