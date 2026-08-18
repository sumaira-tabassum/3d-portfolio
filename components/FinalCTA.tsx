import { SUB_TAGLINE } from '@/lib/site'

import CTAButton from './CTAButton'

/** Closing call to action (CLAUDE.md — Final CTA Section). */
export default function FinalCTA() {
  return (
    <section id="contact" className="final-cta">
      <h2 className="final-title">
        Let&apos;s build
        <br />
        something.
      </h2>
      <p className="final-sub">{SUB_TAGLINE}</p>
      <div className="final-button">
        <CTAButton />
      </div>
    </section>
  )
}
