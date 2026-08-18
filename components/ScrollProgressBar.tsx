'use client'

import { usePageProgress } from '@/hooks/useScrollProgress'

/** 1px cyan-gradient reading line across the top of the page. */
export default function ScrollProgressBar() {
  const progress = usePageProgress()

  return (
    <div className="bar" aria-hidden="true">
      <div className="fill" style={{ transform: `scaleX(${progress})` }} />

      <style jsx>{`
        .bar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          z-index: var(--z-progress);
          pointer-events: none;
        }

        .fill {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, var(--cyan), var(--cyan-light));
          transform-origin: left center;
        }
      `}</style>
    </div>
  )
}
