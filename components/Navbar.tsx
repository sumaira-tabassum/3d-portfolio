'use client'

import { useScrolledPast } from '@/hooks/useScrollProgress'
import { AGENCY_NAME } from '@/lib/site'

const LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
]

/**
 * Fixed navbar — transparent at rest, solid + blurred past 100px
 * (CLAUDE.md — Navbar).
 */
export default function Navbar() {
  const scrolled = useScrolledPast(100)

  return (
    <header className="nav" data-scrolled={scrolled}>
      <a className="brand" href="#top">
        {AGENCY_NAME}
      </a>

      <nav className="links">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
        <a className="pill" href="#contact" data-cursor="cta">
          Let&apos;s Talk
        </a>
      </nav>

      <style jsx>{`
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: var(--z-nav);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 48px;
          background: transparent;
          backdrop-filter: none;
          transition: background 0.3s ease, backdrop-filter 0.3s ease;
        }

        .nav[data-scrolled='true'] {
          background: var(--nav-scrolled);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .brand {
          font-family: var(--font-inter), sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: var(--cream);
          text-decoration: none;
        }

        .links {
          display: flex;
          align-items: center;
          gap: 36px;
        }

        .links a {
          font-family: var(--font-inter), sans-serif;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 2px;
          color: var(--cream-muted);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .links a:hover {
          color: var(--cyan);
        }

        /* Matched on .links a.pill so it outranks .links a on its own
           specificity rather than leaning on !important. */
        .links a.pill {
          border: 1px solid var(--cyan);
          color: var(--cyan);
          padding: 8px 20px;
          border-radius: 2px;
          text-transform: uppercase;
          transition: background 0.3s ease, color 0.3s ease;
        }

        .links a.pill:hover {
          background: var(--cyan);
          color: var(--bg-deep);
        }

        @media (max-width: 900px) {
          .nav {
            padding: 20px 24px;
          }
          .links {
            gap: 20px;
          }
        }

        /* Below 640px the three text links crowd the pill — keep the pill,
           which is the one that actually converts. */
        @media (max-width: 640px) {
          .links a:not(.pill) {
            display: none;
          }
        }
      `}</style>
    </header>
  )
}
