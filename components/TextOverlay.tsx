'use client'

import CTAButton from './CTAButton'

/**
 * Opacity for a section that is visible across [start, end], ramping in over
 * `fadeIn` and out over `fadeOut` (all values in scroll-progress units).
 */
function rangeOpacity(
  p: number,
  start: number,
  end: number,
  fadeIn: number,
  fadeOut: number
) {
  if (p < start || p > end) return 0
  if (fadeIn > 0 && p < start + fadeIn) return (p - start) / fadeIn
  if (fadeOut > 0 && p > end - fadeOut) return (end - p) / fadeOut
  return 1
}

/**
 * A gentle upward drift across the section's visible range: starts slightly
 * low, ends slightly high, level at the midpoint.
 */
function driftY(p: number, start: number, end: number) {
  const t = (p - start) / (end - start)
  return (0.5 - Math.min(1, Math.max(0, t))) * 24
}

type SectionProps = {
  progress: number
  start: number
  end: number
  fadeIn: number
  fadeOut: number
  className: string
  children: React.ReactNode
}

function Section({
  progress,
  start,
  end,
  fadeIn,
  fadeOut,
  className,
  children,
}: SectionProps) {
  const opacity = rangeOpacity(progress, start, end, fadeIn, fadeOut)
  const y = driftY(progress, start, end)

  return (
    <div
      className={`overlay ${className}`}
      style={{
        opacity,
        transform: `translate3d(0, ${y}px, 0)`,
        visibility: opacity <= 0.001 ? 'hidden' : 'visible',
      }}
      aria-hidden={opacity <= 0.001}
    >
      {children}
    </div>
  )
}

/**
 * The four scroll-driven text sections.
 *
 * Ranges are exactly as specified in CLAUDE.md — Text Overlay Specs. The gaps
 * between them (22–30%, 55–60%, 78–84%) are intentional: moments of pure canvas.
 */
export default function TextOverlay({ progress }: { progress: number }) {
  return (
    <div className="overlay-root">
      {/* ---- Section 1 — Intro (0%–22%) ---- */}
      <Section
        progress={progress}
        start={0}
        end={0.22}
        fadeIn={0}
        fadeOut={0.05}
        className="s1"
      >
        <p className="label type-caption">Software Development</p>
        <h1 className="h1 text-gradient">
          Code,
          <br />
          Perfected.
        </h1>
        <p className="sub">No shortcuts. Built right.</p>
      </Section>

      {/* ---- Section 2 — The Build (30%–55%) ---- */}
      <Section
        progress={progress}
        start={0.3}
        end={0.55}
        fadeIn={0.05}
        fadeOut={0.05}
        className="s2"
      >
        <p className="label type-caption">Inside the Process</p>
        <h2 className="h2">
          Structure.
          <br />
          Broken open.
        </h2>
        <p className="sub">Every project, taken apart and rebuilt right.</p>
      </Section>

      {/* ---- Section 3 — The Return (60%–78%) ---- */}
      <Section
        progress={progress}
        start={0.6}
        end={0.78}
        fadeIn={0.04}
        fadeOut={0.05}
        className="s3"
      >
        <p className="label type-caption">Back to Clarity</p>
        <h2 className="h3 text-gradient">
          Clean.
          <br />
          Solid.
          <br />
          Done.
        </h2>
        <p className="sub">Every line earning its place.</p>
      </Section>

      {/* ---- Section 4 — CTA (84%–100%) ---- */}
      <Section
        progress={progress}
        start={0.84}
        end={1}
        fadeIn={0.04}
        fadeOut={0}
        className="s4"
      >
        <h2 className="h4">
          Let&apos;s build
          <br />
          something.
        </h2>
        <p className="sub sub-sm">
          Software development &amp; consulting, done right.
        </p>
        <div className="cta-wrap">
          <CTAButton />
        </div>
      </Section>

      <style jsx>{`
        .overlay-root {
          position: absolute;
          inset: 0;
          z-index: var(--z-overlay);
          pointer-events: none;
        }

        .overlay-root :global(.overlay) {
          position: absolute;
          will-change: opacity, transform;
        }

        /* ---- shared type ---- */
        .label {
          color: var(--cyan);
          margin: 0 0 20px;
        }

        .sub {
          font-family: var(--font-inter), sans-serif;
          font-size: 16px;
          font-weight: 300;
          line-height: 1.85;
          color: var(--cream-muted);
          margin: 24px 0 0;
        }

        .sub-sm {
          font-size: 15px;
        }

        h1,
        h2 {
          font-family: var(--font-space-grotesk), sans-serif;
          margin: 0;
          line-height: 1;
        }

        /* ---- Section 1 — bottom-left ---- */
        .overlay-root :global(.s1) {
          left: 10%;
          bottom: 15%;
          max-width: 80%;
          text-align: left;
        }

        .h1 {
          font-size: clamp(44px, 7vw, 80px);
          font-weight: 300;
          letter-spacing: -1.5px;
          background-image: linear-gradient(135deg, var(--cream), var(--cyan));
        }

        /* ---- Section 2 — top-right ---- */
        .overlay-root :global(.s2) {
          right: 8%;
          top: 18%;
          max-width: 84%;
          text-align: right;
        }

        .h2 {
          font-size: clamp(40px, 6.3vw, 72px);
          font-weight: 400;
          letter-spacing: -1.5px;
          color: var(--cream);
        }

        /* ---- Sections 3 & 4 — perfectly centered ----
           Full-inset flex box rather than left:50% + negative margins: the
           margin arithmetic has to track the clamped width, and the inline
           drift transform would fight a translate(-50%) centering hack. */
        .overlay-root :global(.s3),
        .overlay-root :global(.s4) {
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 5%;
        }

        .h3 {
          font-size: clamp(48px, 7.6vw, 88px);
          font-weight: 300;
          letter-spacing: -2px;
          background-image: linear-gradient(
            135deg,
            var(--cyan) 0%,
            var(--cyan-light) 45%,
            var(--cream) 100%
          );
        }

        .h4 {
          font-family: var(--font-space-grotesk), sans-serif;
          font-size: clamp(48px, 8vw, 92px);
          font-weight: 300;
          letter-spacing: -2px;
          color: var(--cream);
          margin: 0;
          line-height: 1;
        }

        .cta-wrap {
          margin-top: 44px;
          pointer-events: auto;
        }

        @media (max-width: 767px) {
          .overlay-root :global(.s1) {
            left: 7%;
            bottom: 12%;
            max-width: 86%;
          }
          .overlay-root :global(.s2) {
            right: 7%;
            top: 16%;
            max-width: 86%;
          }
          .sub {
            font-size: 15px;
            margin-top: 18px;
          }
          .label {
            margin-bottom: 14px;
            letter-spacing: 3px;
          }
          .cta-wrap {
            margin-top: 32px;
          }
        }
      `}</style>
    </div>
  )
}
