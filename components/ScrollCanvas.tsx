'use client'

import { useCallback, useEffect, useRef } from 'react'

/** Cap the backing store at 2x — beyond that the cost buys nothing visible. */
const MAX_DPR = 2

type Props = {
  images: HTMLImageElement[]
  /** 0–1 progress through the scroll section. */
  progress: number
}

/**
 * Sticky full-viewport canvas that scrubs the frame sequence from scroll
 * position, with the cool cyan radial glow (CLAUDE.md — "non-negotiable").
 *
 * Two earlier approaches to the glow both failed, and both failed for the
 * same underlying reason: the source frames aren't simple "object on flat
 * black" — the metallic bracket's own material shading (dark reflective
 * valleys, gradient highlights) spans the *same* luminance range as the
 * video's ambient background vignette, so anything that treats "dark" as
 * "background" also eats into the object itself:
 *   1. `mix-blend-mode: screen` on the canvas lightened the vignette into a
 *      visible, non-circular blob (the video's own background isn't flat).
 *   2. Per-pixel luminance keying removed the vignette, but couldn't
 *      distinguish it from the object's own dark shading — the bracket came
 *      out flat and washed out.
 *
 * The fix that avoids both: never touch the video's pixels. The canvas draws
 * fully opaque, at full contrast, exactly as sourced. The glow is a separate
 * div layered *on top* of the canvas in `screen` blend mode. Screen mode is
 * close to a no-op on already-bright pixels (so the object's contrast is
 * untouched) while gently lifting dark areas toward cyan (delivering the
 * ambient glow) — and because it's one clean CSS gradient shape applied
 * uniformly, it never interacts pixel-by-pixel with the video's own vignette,
 * so there's no second competing shape to create a blob.
 */
export default function ScrollCanvas({ images, progress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastDrawn = useRef(-1)
  const rafRef = useRef(0)

  /** Draw one frame using manual object-fit: cover math. */
  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const img = images[index]
      if (!img?.complete || img.naturalWidth === 0) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

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

  // Size the backing store to the viewport, then repaint.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || images.length === 0) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      // Resizing clears the surface — force a repaint at the new size.
      lastDrawn.current = -1
      drawFrame(frameFor(progress))
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
    // `progress` is read imperatively here; re-running on every scroll tick
    // would needlessly re-measure the viewport.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, drawFrame, frameFor])

  // Repaint when the integer frame changes. The scroll source is already
  // rAF-throttled; this schedules one more frame so the draw lands on a paint
  // boundary rather than mid-layout. No permanent loop, no setInterval.
  useEffect(() => {
    if (images.length === 0) return

    const index = frameFor(progress)
    if (index === lastDrawn.current) return

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => drawFrame(index))

    return () => cancelAnimationFrame(rafRef.current)
  }, [progress, images.length, drawFrame, frameFor])

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
          background: radial-gradient(
            circle at center,
            var(--cyan-glow) 0%,
            transparent 60%
          );
          mix-blend-mode: screen;
          pointer-events: none;
        }
      `}</style>
    </>
  )
}
