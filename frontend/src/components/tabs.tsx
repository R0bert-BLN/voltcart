import { useId, useState } from 'react'

import { cn } from 'cn'

export interface TabItem {
  /** Stable id for the tab and its panel (panels get `tab-<id>`). */
  id: string
  label: string
  content: React.ReactNode
}

export interface TabsProps {
  items: TabItem[]
  className?: string
}

/** Tabs from the mockup (MK.ui.tabs → .tabs): a tablist with panels, switching
    on click and arrow keys. */
export function Tabs({ items, className }: TabsProps) {
  const baseId = useId()
  const [active, setActive] = useState(items[0]?.id)
  // Returns the next id so the keydown handler can move focus; React state
  // updates are asynchronous, so the handler cannot read the new active.
  const move = (step: 1 | -1): string | undefined => {
    const at = items.findIndex((item) => item.id === active)
    const next = items[(((at + step) % items.length) + items.length) % items.length]
    setActive(next?.id)
    return next?.id
  }
  const onArrow = (step: 1 | -1) => (event: React.KeyboardEvent) => {
    event.preventDefault()
    const next = move(step)
    if (next) document.getElementById(`${baseId}-tab-${next}`)?.focus()
  }

  return (
    <div data-slot="tabs" className={className}>
      <div role="tablist" className="flex border-b">
        {items.map((item) => {
          const isSelected = item.id === active
          return (
            <button
              type="button"
              key={item.id}
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={isSelected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActive(item.id)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') onArrow(1)(event)
                else if (event.key === 'ArrowLeft') onArrow(-1)(event)
              }}
              className={cn(
                'pointer-coarse:min-h-11 min-h-(--control) cursor-pointer px-4 font-normal',
                'border-0 border-b-2 border-b-transparent bg-transparent text-muted-foreground transition-colors',
                'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                isSelected && 'border-b-primary font-medium text-primary',
                !isSelected && 'hover:text-text',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      {items.map((item) => {
        const isSelected = item.id === active
        return (
          <div
            role="tabpanel"
            key={item.id}
            id={`${baseId}-panel-${item.id}`}
            aria-labelledby={`${baseId}-tab-${item.id}`}
            hidden={!isSelected}
          >
            {item.content}
          </div>
        )
      })}
    </div>
  )
}
