'use client'

import { useEffect, useRef, useState } from 'react'

import { FRAME_COUNT, MOBILE_BREAKPOINT, framePath } from '@/lib/site'

/** Simultaneous image requests. Keeps the progress bar moving in frame order. */
const CONCURRENCY = 10

export type FrameSet = {
  /** Decoded frame images, in playback order. Sparse until `ready`. */
  images: HTMLImageElement[]
  /** 0–1 preload progress. */
  progress: number
  /** True once every frame has settled (loaded or failed). */
  ready: boolean
}

/**
 * Preloads every animation frame before the site is allowed to render
 * (CLAUDE.md — "Site does not render until 100% of frames are preloaded").
 *
 * Frames are kept as HTMLImageElement rather than ImageBitmap on purpose: 302
 * decoded 1920x1074 bitmaps would pin ~2.5GB of memory, whereas the browser is
 * free to evict and re-decode Image elements as the canvas scrubs.
 *
 * On viewports under 768px every 2nd frame is skipped, halving both the
 * download and the decode cost (CLAUDE.md — Performance Rules).
 */
export function useFramePreloader(): FrameSet {
  const [images, setImages] = useState<HTMLImageElement[]>([])
  const [loaded, setLoaded] = useState(0)
  const [total, setTotal] = useState(FRAME_COUNT)
  const [ready, setReady] = useState(false)
  const startedRef = useRef(false)

  useEffect(() => {
    // Strict Mode double-invokes effects in dev: mount -> cleanup -> mount.
    // `startedRef` (a ref, so it survives all three phases on this instance)
    // makes sure the load only ever starts once. It deliberately does NOT pair
    // with a per-run "cancelled" flag: that would let the Strict Mode cleanup
    // silence the in-flight images' onload handlers forever, while the second
    // mount refuses to restart them — net result, real network loads complete
    // but no state update ever fires and the counter freezes at 0%.
    if (startedRef.current) return
    startedRef.current = true

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT
    const step = isMobile ? 2 : 1

    const indices: number[] = []
    for (let i = 1; i <= FRAME_COUNT; i += step) indices.push(i)

    setTotal(indices.length)

    const frames: HTMLImageElement[] = new Array(indices.length)
    let settled = 0
    let cursor = 0

    const startNext = () => {
      const slot = cursor++
      if (slot >= indices.length) return

      const img = new Image()
      frames[slot] = img

      const done = () => {
        settled += 1
        setLoaded(settled)
        if (settled === indices.length) {
          setImages(frames)
          setReady(true)
        } else {
          startNext()
        }
      }

      // A failed frame still counts as settled — one bad file must never leave
      // the loading screen stuck forever.
      img.onload = done
      img.onerror = done
      img.decoding = 'async'
      img.src = framePath(indices[slot])
    }

    for (let i = 0; i < Math.min(CONCURRENCY, indices.length); i++) startNext()
  }, [])

  return {
    images,
    progress: total === 0 ? 1 : loaded / total,
    ready,
  }
}
