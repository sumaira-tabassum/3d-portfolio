/**
 * Full-page film grain (CLAUDE.md — Micro-Details).
 *
 * The noise is an inline feTurbulence SVG encoded as a data URI (see `.grain`
 * in app/globals.css), so it costs zero network requests and cannot flash in
 * late. Server component — no interactivity needed.
 */
export default function Grain() {
  return <div className="grain" aria-hidden="true" />
}
