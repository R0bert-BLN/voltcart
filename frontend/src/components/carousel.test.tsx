import userEvent from '@testing-library/user-event'
import { act, render, screen } from '@testing-library/react'

import { Carousel } from '@/components/carousel'

class MockResizeObserver {
  static instances: MockResizeObserver[] = []
  readonly callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
    MockResizeObserver.instances.push(this)
  }

  observe() {}
  disconnect() {}
  unobserve() {}

  trigger() {
    this.callback([], null as unknown as ResizeObserver)
  }
}

// The ResizeObserver callback runs outside React; act() flushes the state
// changes it makes before the next assertion.
const fire = async () => {
  await act(async () => {
    MockResizeObserver.instances.at(-1)?.trigger()
  })
}

describe('Carousel', () => {
  beforeEach(() => {
    MockResizeObserver.instances = []
    vi.stubGlobal('ResizeObserver', MockResizeObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders a named group with the items in the track', () => {
    render(
      <Carousel label="Featured products">
        <div>Item one</div>
        <div>Item two</div>
      </Carousel>,
    )

    expect(screen.getByRole('group', { name: 'Featured products' })).toBeVisible()
    expect(screen.getByText('Item one')).toBeVisible()
    expect(screen.getByText('Item two')).toBeVisible()
  })

  it('hides the arrows while the items fit', () => {
    render(
      <Carousel label="Featured products">
        <div>Item one</div>
      </Carousel>,
    )

    expect(screen.queryByRole('button', { name: 'Previous Featured products' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Next Featured products' })).toBeNull()
  })

  it('shows the arrows and disables them at the ends when the items do not fit', async () => {
    const { container } = render(
      <Carousel label="Featured products">
        <div>Item one</div>
      </Carousel>,
    )

    const track = container.querySelector('[data-slot="carousel-track"]') as HTMLElement
    Object.defineProperty(track, 'scrollWidth', { configurable: true, get: () => 1000 })
    Object.defineProperty(track, 'clientWidth', { configurable: true, get: () => 400 })
    await fire()

    const previous = screen.getByRole('button', { name: 'Previous Featured products' })
    const next = screen.getByRole('button', { name: 'Next Featured products' })
    expect(previous).toBeDisabled()
    expect(next).toBeEnabled()
  })

  it('scrolls by 80% of a view in the arrows direction', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Carousel label="Featured products">
        <div>Item one</div>
      </Carousel>,
    )

    const track = container.querySelector('[data-slot="carousel-track"]') as HTMLElement
    const scrollBy = vi.fn()
    track.scrollBy = scrollBy
    Object.defineProperty(track, 'scrollWidth', { configurable: true, get: () => 1000 })
    Object.defineProperty(track, 'clientWidth', { configurable: true, get: () => 400 })
    await fire()

    await user.click(screen.getByRole('button', { name: 'Next Featured products' }))
    expect(scrollBy).toHaveBeenCalledExactlyOnceWith({ left: 320, behavior: 'smooth' })
  })

  it('jumps without animation when reduced motion is asked for', async () => {
    const user = userEvent.setup()
    const matchMedia = vi.fn().mockReturnValue({ matches: true })
    vi.stubGlobal('matchMedia', matchMedia)
    const { container } = render(
      <Carousel label="Featured products">
        <div>Item one</div>
      </Carousel>,
    )

    const track = container.querySelector('[data-slot="carousel-track"]') as HTMLElement
    const scrollBy = vi.fn()
    track.scrollBy = scrollBy
    Object.defineProperty(track, 'scrollWidth', { configurable: true, get: () => 1000 })
    Object.defineProperty(track, 'clientWidth', { configurable: true, get: () => 400 })
    track.scrollLeft = 100
    await fire()

    await user.click(screen.getByRole('button', { name: 'Previous Featured products' }))
    expect(scrollBy).toHaveBeenCalledExactlyOnceWith({ left: -320, behavior: 'auto' })
  })
})
