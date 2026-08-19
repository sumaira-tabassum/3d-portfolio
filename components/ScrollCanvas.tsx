'use client'

import { useCallback, useEffect, useRef } from 'react'

/** Absolute ceiling regardless of source resolution or device DPR. */
const MAX_DPR = 2

type Props = {
  images: HTMLImageElement[]
  /**
   * Subscribe to scroll progress (0–1), notified synchronously inside the
   * shared scroll rAF tick — see hooks/useScrollProgress.ts. Deliberately not
   * a `progress` prop: reacting to a prop via useEffect costs a full extra
   * rAF hop plus a React render/commit cycle between the scroll event and
   * the resulting paint, which reads as sluggish scrubbing. Subscribing lets
   * this component draw in the very same frame the scroll was measured in.
   */
  subscribe: (fn: (progress: number) => void) => () => void
}

/**
 * Sticky full-viewport canvas that scrubs the frame sequence from scroll
 * position, with the cool cyan radial glow (CLAUDE.md — "non-negotiable").
 *
 * The glow (CLAUDE.md — "non-negotiable") is a real layer *behind* the
 * canvas. The source frames aren't simple "object on flat black" — the
 * metallic bracket's own material shading (dark reflective valleys, gradient
 * highlights) spans the *same* luminance range as the video's ambient
 * background vignette, so anything that treats "dark" as "background" also
 * eats into the object itself:
 *   1. `mix-blend-mode: screen` on the canvas lightened the vignette into a
 *      visible, non-circular blob (the video's own background isn't flat).
 *   2. Per-pixel luminance keying removed the vignette, but couldn't
 *      distinguish it from the object's own dark shading — the bracket came
 *      out flat and washed out.
 *
 * The fix that avoids both: never touch the video's pixels. The canvas draws
 * fully opaque, at full contrast, exactly as sourced. The glow is a separate
 * div layered *on top* of the canvas in `screen` blend mode, so it never
 * reduces the object's contrast and never competes with the video's own
 * vignette shape.
 */
export default function ScrollCanvas({ images, subscribe }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastDrawn = useRef(-1)
  const lastProgress = useRef(0)

  /** Draw one frame using manual object-fit: cover math. */
  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const img = images[index]
      if (!img?.complete || img.naturalWidth === 0) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Canvas 2D defaults imageSmoothingQuality to 'low' (HTML spec). Since
      // object-fit: cover's scale factor is almost never exactly 1.0, every
      // single drawImage here scales the source — so the default quietly ran
      // every frame through the cheapest resampling filter available.
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      const cw = canvas.width
      const ch = canvas.height
      const iw = img.naturalWidth
      const ih = img.naturalHeight

      ctx.clearRect(0, 0, cw, ch)

      const scale = Math.max(cw / iw, ch / ih)
      const w = iw * scale
      const h = ih * scale
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)

      lastDrawn.current = index
    },
    [images]
  )

  const frameFor = useCallback(
    (p: number) =>
      Math.min(
        images.length - 1,
        Math.max(0, Math.round(p * (images.length - 1)))
      ),
    [images.length]
  )

  // Size the backing store to the viewport, then repaint. Tried capping this
  // to the source frames' own resolution to avoid upscaling on high-DPI
  // displays, but that measurably softened rendering on common windowed
  // high-DPI setups (backing store dropped to ~44% of native pixel count in
  // testing) — not worth trading sharpness for a fill-rate saving. Native
  // device pixel density wins here.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || images.length === 0) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const vw = window.innerWidth
      const vh = window.innerHeight

      canvas.width = Math.round(vw * dpr)
      canvas.height = Math.round(vh * dpr)
      canvas.style.width = `${vw}px`
      canvas.style.height = `${vh}px`
      // Resizing clears the surface — force a repaint at the new size.
      lastDrawn.current = -1
      drawFrame(frameFor(lastProgress.current))
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [images, drawFrame, frameFor])

  // Draw synchronously inside the shared scroll ticker's own rAF callback —
  // no extra rAF, no idle loop. This only ever runs when the ticker's tick()
  // fires, which only happens after a scroll/resize event.
  useEffect(() => {
    if (images.length === 0) return

    return subscribe((p) => {
      lastProgress.current = p
      const index = frameFor(p)
      if (index === lastDrawn.current) return
      drawFrame(index)
    })
  }, [subscribe, images.length, drawFrame, frameFor])

  return (
    <>
      {/* Layer 1 — the frame sequence, fully opaque, full contrast. */}
      <canvas ref={canvasRef} aria-hidden="true" />

      {/* Layer 2 — the cool cyan emanation, screened on top so it never
          reduces the object's contrast. */}
      <div className="canvas-glow" aria-hidden="true" />

      <style jsx>{`
        canvas {
          position: absolute;
          inset: 0;
          z-index: var(--z-canvas);
          display: block;
          width: 100%;
          height: 100%;
          background: transparent;
        }

        .canvas-glow {
          position: absolute;
          inset: 0;
          z-index: calc(var(--z-canvas) + 1);
          /* Bug (found via pixel diff): circle at center with no explicit
             size defaults to farthest-corner sizing — on a 1366x768 viewport
             that puts the transparent stop ~470px out, so the glow washed
             over roughly 70-80% of the screen, including the object itself,
             instead of staying a quiet, focused emanation (CLAUDE.md). An
             explicit, viewport-independent radius keeps it a tight halo
             around the object at any screen size. */
          background: radial-gradient(
            circle clamp(160px, 28vmin, 320px) at center,
            var(--cyan-glow) 0%,
            transparent 100%
          );
          mix-blend-mode: screen;
          pointer-events: none;
        }
      `}</style>
    </>
  )
}
