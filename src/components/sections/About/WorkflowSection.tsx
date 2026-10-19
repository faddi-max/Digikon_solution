import { useRef, useState } from 'react'

import gridSrc from '@/assets/images/cta-grid.png'
import { ScrollRevealText } from '@/components/motion/ScrollRevealText'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

import { WORKFLOW } from './workflowData'
import './Workflow.css'

export function WorkflowSection() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState<number>(WORKFLOW.initialActive)

  // Eyebrow, connecting lines, nodes and step copy settle in once. Reduced motion shows the final state.
  useGSAP(
    () => {
      if (prefersReducedMotion() || !root.current) return

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top 70%',
            toggleActions: 'restart none restart reset',
          },
        })
        .from('[data-flow="eyebrow"]', {
          autoAlpha: 0,
          x: -16,
          duration: 0.6,
          ease: 'power3.out',
        })
        .from(
          '[data-flow="line"]',
          { scaleX: 0, duration: 0.9, stagger: 0.18, ease: 'power2.inOut' },
          0.3,
        )
        .from(
          '[data-flow="node"]',
          {
            autoAlpha: 0,
            scale: 0.6,
            duration: 0.6,
            stagger: 0.18,
            ease: 'back.out(1.6)',
          },
          0.3,
        )
        .from(
          '[data-flow="copy"]',
          {
            autoAlpha: 0,
            y: 20,
            duration: 0.7,
            stagger: 0.18,
            ease: 'power3.out',
          },
          0.5,
        )
        .from(
          '[data-flow="base"]',
          { scaleX: 0, duration: 1.2, ease: 'power2.inOut' },
          0.9,
        )
    },
    { scope: root },
  )

  return (
    <section ref={root} className="dk-flow" aria-label={WORKFLOW.eyebrow}>
      <div className="dk-flow__bg" aria-hidden="true">
        <img
          className="dk-flow__grid"
          src={gridSrc}
          alt=""
          draggable={false}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="dk-container dk-flow__inner">
        <header className="dk-flow__head">
          <p data-flow="eyebrow" className="dk-flow__eyebrow">
            <span className="dk-flow__eyebrow-dot" aria-hidden="true" />
            {WORKFLOW.eyebrow}
          </p>
          <ScrollRevealText
            as="h2"
            className="dk-flow__heading"
            text={WORKFLOW.heading}
            split="words"
            mode="play"
            accent={[...WORKFLOW.accent]}
            duration={1.1}
            stagger={0.08}
            yOffset={20}
            start="top 85%"
          />
        </header>

        <ol className="dk-flow__steps">
          {WORKFLOW.steps.map((step, i) => (
            <li
              key={step.id}
              className="dk-flow__step"
              data-active={i === active}
              onPointerEnter={() => setActive(i)}
            >
              <span data-flow="line" className="dk-flow__line" aria-hidden="true" />
              <button
                type="button"
                data-flow="node"
                className="dk-flow__node"
                aria-label={`Step ${step.no}: ${step.title}`}
                aria-current={i === active ? 'step' : undefined}
                onClick={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                <span className="dk-flow__no">{step.no}</span>
              </button>
              <div data-flow="copy" className="dk-flow__copy">
                <h3 className="dk-flow__title">{step.title}</h3>
                <p className="dk-flow__body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <span data-flow="base" className="dk-flow__base" aria-hidden="true" />
      </div>
    </section>
  )
}
