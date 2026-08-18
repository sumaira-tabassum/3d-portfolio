'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)

/**
 * Shared rAF-driven scroll ticker.
 *
 * Every consumer reads scroll position inside one animation frame rather than
 * doing layout work in the scroll event itself. Never setInterval
 * (CLAUDE.md — Performance Rules).
 */
function useScrollTicker(read: () => number) {
  const [value, setValue] = useState(0)
  const readRef = useRef(read)
  readRef.current = read

  useEffect(() => {
    let frame = 0
    let queued = false
    let last = -1

    const tick = () => {
      queued = false
      const next = readRef.current()
      // Only re-render when the value actually moves.
      if (next !== last) {
        last = next
        setValue(next)
      }
    }

    const onScroll = () => {
      if (queued) return
      queued = true
      frame = requestAnimationFrame(tick)
    }

    tick()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return value
}

/**
 * Progress (0–1) through a tall section that contains a sticky child.
 *
 * The sticky child is pinned for exactly (sectionHeight - viewportHeight) of
 * scroll, so that distance is the full 0–1 range of the animation.
 */
export function useSectionProgress(ref: RefObject<HTMLElement>) {
  return useScrollTicker(() => {
    const el = ref.current
    if (!el) return 0

    const rect = el.getBoundingClientRect()
    const scrollable = rect.height - window.innerHeight
    if (scrollable <= 0) return 0

    return clamp01(-rect.top / scrollable)
  })
}

/**
 * Progress (0–1) through the entire document.
 * Formula per CLAUDE.md: scrollY / (scrollHeight - innerHeight).
 */
export function usePageProgress() {
  return useScrollTicker(() => {
    const scrollable = document.body.scrollHeight - window.innerHeight
    if (scrollable <= 0) return 0
    return clamp01(window.scrollY / scrollable)
  })
}

/** True once the page has scrolled past `threshold` pixels. */
export function useScrolledPast(threshold: number) {
  const value = useScrollTicker(() => (window.scrollY > threshold ? 1 : 0))
  return value === 1
}
