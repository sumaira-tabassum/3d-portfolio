'use client'

import { useEffect, useState } from 'react'

import { AGENCY_NAME } from '@/lib/site'

type Props = {
  /** 0–1 preload progress. */
  progress: number
  /** True once every frame has settled. */
  done: boolean
}

/**
 * Full-screen preloader. The site does not render until 100% of the frames are
 * loaded (CLAUDE.md — Loading Screen), then this fades out over 0.8s.
 */
export default function LoadingScreen({ progress, done }: Props) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!done) return
    // Match the 0.8s fade before removing from the tree.
    const timer = setTimeout(() => setHidden(true), 800)
    return () => clearTimeout(timer)
  }, [done])

  if (hidden) return null

  const percent = Math.round(progress * 100)

  return (
    <div className="loader" data-done={done} role="status" aria-live="polite">
      <div className="mark type-caption">{AGENCY_NAME}</div>

      <div className="track">
        <div className="fill" style={{ transform: `scaleX(${progress})` }} />
      </div>

      <div className="percent">{percent}%</div>

      <style jsx>{`
        .loader {
          position: fixed;
          inset: 0;
          z-index: var(--z-loading);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-deep);
          opacity: 1;
          transition: opacity 0.8s ease;
        }

        .loader[data-done='true'] {
          opacity: 0;
          pointer-events: none;
        }

        .mark {
          font-size: 14px;
          letter-spacing: 6px;
          color: var(--cyan);
          margin-bottom: 32px;
        }

        .track {
          position: relative;
          width: 200px;
          height: 1px;
          background: var(--track);
          overflow: hidden;
        }

        .fill {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, var(--cyan), var(--cyan-light));
          transform-origin: left center;
          transition: transform 0.2s linear;
        }

        .percent {
          font-family: var(--font-inter), sans-serif;
          font-size: 11px;
          font-weight: 300;
          color: var(--cream-muted);
          margin-top: 16px;
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  )
}
