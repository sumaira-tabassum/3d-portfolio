'use client'

import { useEffect, useRef } from 'react'

import FinalCTA from '@/components/FinalCTA'
import LoadingScreen from '@/components/LoadingScreen'
import ProcessQuote from '@/components/ProcessQuote'
import ScrollCanvas from '@/components/ScrollCanvas'
import ServicesSection from '@/components/ServicesSection'
import TextOverlay from '@/components/TextOverlay'
import WorkSection from '@/components/WorkSection'
import { useFramePreloader } from '@/hooks/useFramePreloader'
import { useSectionProgress } from '@/hooks/useScrollProgress'
import { SCROLL_HEIGHT_VH } from '@/lib/site'

export default function Home() {
  const sectionRef = useRef<HTMLElement>(null)
  const { value: progress, subscribe } = useSectionProgress(sectionRef)
  const { images, progress: loadProgress, ready } = useFramePreloader()

  // The scroll ticker mounts before the stage exists, so its first reading is
  // taken against a null ref. Once the stage is in the DOM, nudge it to
  // re-measure — otherwise progress stays pinned at 0 until the first scroll.
  useEffect(() => {
    if (ready) window.dispatchEvent(new Event('scroll'))
  }, [ready])

  return (
    <>
      <LoadingScreen progress={loadProgress} done={ready} />

      {/* Nothing below renders until every frame is preloaded. */}
      {ready && (
        <main id="top" className="page-fade-in">
          <section
            ref={sectionRef}
            className="scroll-stage"
            style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
          >
            <div className="sticky-frame">
              <ScrollCanvas images={images} subscribe={subscribe} />
              <TextOverlay progress={progress} />
            </div>
          </section>

          <ServicesSection />
          <ProcessQuote />
          <WorkSection />
          <FinalCTA />
        </main>
      )}

      <style jsx>{`
        .scroll-stage {
          position: relative;
          width: 100%;
          background: var(--bg-deep);
        }

        .sticky-frame {
          position: sticky;
          top: 0;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: var(--bg-deep);
        }
      `}</style>
    </>
  )
}
