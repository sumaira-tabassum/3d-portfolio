'use client'

import { useEffect, useRef } from 'react'

/** Ring easing per frame — lands around a ~100ms trail behind the dot. */
const LAG = 0.16

/**
 * Two-part cursor: an 8px cyan dot that tracks exactly, and a 28px cyan ring
 * that trails behind it and grows to 48px over any CTA (CLAUDE.md —
 * Micro-Details).
 *
 * Disabled entirely on coarse pointers so touch devices are not left with a
 * dot parked in a corner.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    document.body.classList.add('custom-cursor-active')

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX = mouseX
    let ringY = mouseY
    let scale = 1
    let targetScale = 1
    let visible = false
    let frame = 0

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      if (!visible) {
        visible = true
        dot.style.opacity = '1'
        ring.style.opacity = '1'
      }

      // 28px ring -> 48px over a CTA.
      const target = e.target as Element | null
      const overCta = !!target?.closest?.('[data-cursor="cta"], .cta-button')
      targetScale = overCta ? 48 / 28 : 1
    }

    const onLeave = () => {
      visible = false
      dot.style.opacity = '0'
      ring.style.opacity = '0'
    }

    const tick = () => {
      ringX += (mouseX - ringX) * LAG
      ringY += (mouseY - ringY) * LAG
      scale += (targetScale - scale) * 0.18

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${scale})`

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.body.classList.remove('custom-cursor-active')
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="ring" aria-hidden="true" />
      <div ref={dotRef} className="dot" aria-hidden="true" />

      <style jsx>{`
        .dot,
        .ring {
          position: fixed;
          top: 0;
          left: 0;
          z-index: var(--z-cursor);
          pointer-events: none;
          opacity: 0;
          border-radius: 50%;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: var(--cyan);
        }

        .ring {
          width: 28px;
          height: 28px;
          border: 1px solid var(--cyan);
        }

        @media (pointer: coarse) {
          .dot,
          .ring {
            display: none;
          }
        }
      `}</style>
    </>
  )
}
