import { useRef } from 'react'

import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

import { PolicyCard } from './PolicyCard'
import { PrivacySidebar } from './PrivacySidebar'
import { POLICY_SECTIONS, PRIVACY_PAGE as P } from './privacyData'
import './Privacy.css'

export function PrivacyContend() {
  const root = useRef<HTMLElement>(null)

  // Header rises in once; each card reveals as it enters. Reduced motion: final state.
  useGSAP(
    () => {
      if (prefersReducedMotion() || !root.current) return

      gsap.from('[data-priv="head"]', {
        autoAlpha: 0,
        y: 20,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
      })

      gsap.utils.toArray<HTMLElement>('[data-policy-card]', root.current).forEach((card) => {
        gsap.from(card, {
          autoAlpha: 0,
          y: 24,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="dk-priv" aria-labelledby="privacy-title">
      <div className="dk-priv__inner">
        <header className="dk-priv__head">
          <p className="dk-priv__eyebrow" data-priv="head">
            {P.eyebrow} · {P.updated}
          </p>
          <h1 id="privacy-title" className="dk-priv__title" data-priv="head">
            {P.headingBefore} <em>{P.headingAccent}</em> {P.headingAfter}
          </h1>
        </header>

        <div className="dk-priv__layout">
          <PrivacySidebar
            title={P.sidebarTitle}
            sections={POLICY_SECTIONS}
            legalCenter={P.legalCenter}
          />

          <div className="dk-priv__main">
            <p className="dk-priv__intro">{P.intro}</p>
            <div className="dk-priv__cards">
              {POLICY_SECTIONS.map((s, i) => (
                <PolicyCard key={s.id} section={s} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
