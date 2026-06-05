import { ref, type Ref } from 'vue'

export interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

/**
 * Highlights a target element by computing its bounding rect (clamped against the bottom sheet).
 * 抽自 index.vue 中两个几乎相同的 updateSpotlight / updateCodeRushSpotlight 实现。
 */
export function useSpotlight() {
  const spotlightRect = ref<SpotlightRect | null>(null)

  const getVisibleTargets = (selector: string): Element[] => {
    return Array.from(document.querySelectorAll(selector))
      .filter(el => {
        const rect = el.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
      })
  }

  const getSmallestVisibleTarget = (selector: string): Element | null => {
    const targets = getVisibleTargets(selector)
    targets.sort((a, b) => {
      const aRect = a.getBoundingClientRect()
      const bRect = b.getBoundingClientRect()
      return (aRect.width * aRect.height) - (bRect.width * bRect.height)
    })
    return targets[0] ?? null
  }

  const update = (selector: string | undefined, active: boolean) => {
    if (!selector || !active) {
      spotlightRect.value = null
      return
    }
    const el = getSmallestVisibleTarget(selector)
    if (el) {
      const rect = el.getBoundingClientRect()
      let { top, left, width, height } = rect
      // Clamp height so spotlight doesn't extend behind the bottom sheet
      const bottomSheet = document.querySelector('.bottom-sheet')
      if (bottomSheet) {
        const bsTop = bottomSheet.getBoundingClientRect().top
        if (top < bsTop && top + height > bsTop) {
          height = bsTop - top
        }
      }
      spotlightRect.value = { top, left, width, height }
      return
    }
    spotlightRect.value = null
  }

  const clear = () => {
    spotlightRect.value = null
  }

  /** Forwards a click on the overlay to the underlying element when the click lands on the spotlight area. */
  const forwardClickIfInsideSpotlight = (e: MouseEvent, targetSelector: string): boolean => {
    if (!spotlightRect.value) return false
    const r = spotlightRect.value
    const p = 8
    const inside = e.clientX >= r.left - p && e.clientX <= r.left + r.width + p &&
        e.clientY >= r.top - p && e.clientY <= r.top + r.height + p
    if (!inside) return false

    const targetsUnderPointer = getVisibleTargets(targetSelector)
      .filter(el => {
        const rect = el.getBoundingClientRect()
        return e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom
      })
      .sort((a, b) => {
        const aRect = a.getBoundingClientRect()
        const bRect = b.getBoundingClientRect()
        return (aRect.width * aRect.height) - (bRect.width * bRect.height)
      })

    const targets = targetsUnderPointer.length > 0 ? targetsUnderPointer : getVisibleTargets(targetSelector)
    for (const el of targets) {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: e.clientX, clientY: e.clientY }))
        return true
      }
    }
    return false
  }

  return { spotlightRect: spotlightRect as Ref<SpotlightRect | null>, update, clear, forwardClickIfInsideSpotlight }
}
