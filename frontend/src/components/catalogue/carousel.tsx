import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import { Icon } from '@/components/ui/icon'
import { cn } from 'cn'

export interface CarouselProps extends React.ComponentProps<'div'> {
  /** Accessible name of the row, as in "Featured products"; it also forms
      the arrow labels ("Previous Featured products"). */
  label: string
  children: ReactNode
}

const arrowClass =
  'grid size-(--control) shrink-0 cursor-pointer place-items-center rounded-[var(--radius-md)] bg-transparent text-text outline-none transition-colors hover:bg-surface-2 focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:size-11 disabled:cursor-not-allowed disabled:text-text-muted disabled:opacity-50 disabled:bg-transparent'

/** Carousel from the mockup (MK.ui.carousel → .carousel): one scrolling row
    with previous and next arrow buttons that appear only when the items do
    not fit, disable at the ends, and scroll by 80% of a view. */
export function Carousel({ label, children, className, ...props }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const previousRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const [overflows, setOverflows] = useState(false)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(true)

  const update = useCallback(() => {
    const track = trackRef.current
    const previous = previousRef.current
    const next = nextRef.current
    if (!track || !previous || !next) return

    // Measured without the arrows, or they would keep themselves on (mockup):
    // taking their width away might just make the items fit again.
    previous.hidden = true
    next.hidden = true
    const max = track.scrollWidth - track.clientWidth
    const left = track.scrollLeft
    const overflow = max > 1

    setOverflows(overflow)
    setAtStart(left <= 1)
    setAtEnd(left >= max - 1)
    // Mirror the values the states render, so a render that bails out cannot
    // leave the imperative hiding of the measurement behind.
    previous.hidden = !overflow
    next.hidden = !overflow
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    update()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    observer?.observe(track)
    track.addEventListener('scroll', update, { passive: true })

    return () => {
      observer?.disconnect()
      track.removeEventListener('scroll', update)
    }
  }, [update])

  const step = (direction: -1 | 1) => () => {
    const track = trackRef.current
    if (!track) return
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <div
      role="group"
      aria-label={label}
      data-slot="carousel"
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      <button
        ref={previousRef}
        type="button"
        aria-label={`Previous ${label}`}
        hidden={!overflows}
        disabled={atStart}
        onClick={step(-1)}
        className={arrowClass}
      >
        <Icon name="ChevronLeft" aria-hidden="true" />
      </button>
      <div
        ref={trackRef}
        data-slot="carousel-track"
        className="-m-1 flex-1 grid grid-flow-col auto-cols-[minmax(var(--tile-w),1fr)] gap-3 min-w-0 overflow-x-auto p-1 snap-x snap-proximity [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:snap-start"
      >
        {children}
      </div>
      <button
        ref={nextRef}
        type="button"
        aria-label={`Next ${label}`}
        hidden={!overflows}
        disabled={atEnd}
        onClick={step(1)}
        className={arrowClass}
      >
        <Icon name="ChevronRight" aria-hidden="true" />
      </button>
    </div>
  )
}
