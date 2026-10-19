import { useRef } from 'react'

import gridSrc from '@/assets/images/cta-grid.png'
import { ScrollRevealText } from '@/components/motion/ScrollRevealText'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

import { MISSION, type MissionPart } from './missionData'
import './Mission.css'

function Lead({ parts }: { parts: readonly MissionPart[] }) {
  return (
    <>
      {parts.map((part) => (
        <span key={part.text} className={`dk-mission__tone dk-mission__tone--${part.tone}`}>
          {part.text}
        </span>
      ))}
    </>
  )
}

export function MissionSection() {
  const root = useRef<HTMLElement>(null)

  // Eyebrow, rule and copy settle in once. Reduced motion renders the final state.
  useGSAP(
    () => {
      if (prefersReducedMotion() || !root.current) return

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top 75%',
            toggleActions: 'restart none restart reset',
          },
        })
        .from('[data-mission="eyebrow"]', {
          autoAlpha: 0,
          x: -16,
          duration: 0.6,
          ease: 'power3.out',
        })
        .from(
          '[data-mission="rule"]',
          { scaleY: 0, duration: 1.1, ease: 'power3.inOut' },
          0.1,
        )
        .from(
          '[data-mission="copy"]',
          {
            autoAlpha: 0,
            y: 20,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
          },
          0.7,
        )
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      className="dk-mission"
      aria-labelledby="mission-title"
    >
      <img
        className="dk-mission__grid"
        src={gridSrc}
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        decoding="async"
      />

      <div className="dk-mission__inner">
        <p data-mission="eyebrow" className="dk-mission__eyebrow">
          <span className="dk-mission__eyebrow-dot" aria-hidden="true" />
          {MISSION.eyebrow}
        </p>

        <div className="dk-mission__block">
          <span
            data-mission="rule"
            className="dk-mission__rule"
            aria-hidden="true"
          />

          <h2 id="mission-title" className="dk-mission__headline">
            {MISSION.headlineLines.map((line, i) => (
              <ScrollRevealText
                key={line}
                as="span"
                className="dk-mission__line"
                text={line}
                split="words"
                mode="play"
                accent={i === 1 ? [...MISSION.accent] : []}
                duration={1.1}
                stagger={0.1}
                yOffset={20}
                start="top 85%"
              />
            ))}
          </h2>

          <p data-mission="copy" className="dk-mission__lead">
            <Lead parts={MISSION.lead} />
          </p>
          <p data-mission="copy" className="dk-mission__closing">
            {MISSION.closing}
          </p>
        </div>
      </div>
    </section>
  )
}
