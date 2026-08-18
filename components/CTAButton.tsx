'use client'

type Props = {
  href?: string
  children?: React.ReactNode
}

/**
 * The cyan CTA. Used by the scroll overlay (section 4) and the final CTA
 * section. Styling lives in `.cta-button` (app/globals.css) so both instances
 * are guaranteed identical.
 *
 * `data-cursor="cta"` is what the custom cursor watches to grow its ring to 48px.
 */
export default function CTAButton({
  href = '#contact',
  children = 'Start a project →',
}: Props) {
  return (
    <a href={href} className="cta-button" data-cursor="cta">
      {children}
    </a>
  )
}
