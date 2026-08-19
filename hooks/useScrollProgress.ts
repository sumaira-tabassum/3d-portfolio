'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)

type TickSubscriber = (value: number) => void

/**
 * Shared rAF-driven scroll ticker.
 *
 * Every consumer reads scroll position inside one animation frame rather than
 * doing layout work in the scroll event itself. Never setInterval
 * (CLAUDE.md — Performance Rules).
 *
 * Besides the React state value (for consumers like text overlays, where a
 * render+commit hop is cheap and imperceptible), this exposes `subscribe` —
 * a way to be notified synchronously inside the SAME rAF callback that
 * computed the value, before React even schedules a render. ScrollCanvas
 * uses this to paint in the same frame the scroll was measured in, instead
 * of waiting a full extra rAF hop for a prop to arrive via React's commit +
 * passive-effect cycle.
 */
function useScrollTicker(read: () => number) {
  const [value, setValue] = useState(0)
  const readRef = useRef(read)
  readRef.current = read
  const progressRef = useRef(0)
  const subscribersRef = useRef<Set<TickSubscriber>>(new Set())

  useEffect(() => {
    let frame = 0
    let queued = false
    let last = -1

    const tick = () => {
      queued = false
      const next = readRef.current()
      progressRef.current = next
      // Notify imperative subscribers synchronously, in this same rAF
      // callback — no second rAF hop, no React commit gating the paint.
      subscribersRef.current.forEach((fn) => fn(next))
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

  // Stable identity — safe to use as a useEffect dependency in subscribers.
  const subscribe = useCallback((fn: TickSubscriber) => {
    subscribersRef.current.add(fn)
    fn(progressRef.current) // deliver the current value immediately
    return () => {
      subscribersRef.current.delete(fn)
    }
  }, [])

  return { value, subscribe }
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
  const { value } = useScrollTicker(() => {
    const scrollable = document.body.scrollHeight - window.innerHeight
    if (scrollable <= 0) return 0
    return clamp01(window.scrollY / scrollable)
  })
  return value
}

/** True once the page has scrolled past `threshold` pixels. */
export function useScrolledPast(threshold: number) {
  const { value } = useScrollTicker(() => (window.scrollY > threshold ? 1 : 0))
  return value === 1
}
