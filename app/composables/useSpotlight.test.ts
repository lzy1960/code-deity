import { afterEach, describe, expect, it, vi } from 'vitest'
import { useSpotlight } from './useSpotlight'

function setRect(el: Element, rect: Partial<DOMRect>) {
  const fullRect = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    right: (rect.left ?? 0) + (rect.width ?? 0),
    bottom: (rect.top ?? 0) + (rect.height ?? 0),
    x: rect.left ?? 0,
    y: rect.top ?? 0,
    toJSON: () => {},
    ...rect,
  } as DOMRect
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(fullRect)
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('useSpotlight', () => {
  it('forwards onboarding clicks to the smallest visible target under the pointer', () => {
    document.body.innerHTML = `
      <div id="outer" data-onboarding="code-area">
        <div id="inner" data-onboarding="code-area"></div>
      </div>
    `

    const outer = document.querySelector('#outer')!
    const inner = document.querySelector('#inner')!
    setRect(outer, { top: 10, left: 10, width: 400, height: 400, right: 410, bottom: 410 })
    setRect(inner, { top: 80, left: 80, width: 200, height: 200, right: 280, bottom: 280 })

    const outerClick = vi.fn()
    const innerClick = vi.fn((event: MouseEvent) => event.stopPropagation())
    outer.addEventListener('click', outerClick)
    inner.addEventListener('click', innerClick)

    const { update, forwardClickIfInsideSpotlight } = useSpotlight()
    update('[data-onboarding="code-area"]', true)

    const forwarded = forwardClickIfInsideSpotlight(
      new MouseEvent('click', { clientX: 120, clientY: 120 }),
      '[data-onboarding="code-area"]',
    )

    expect(forwarded).toBe(true)
    expect(innerClick).toHaveBeenCalledTimes(1)
    expect(outerClick).not.toHaveBeenCalled()
  })
})
