
import { useRef } from 'react'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, useGSAP } from '@/lib/motion'

const TEAM_PRINCIPLES = [
  {
    number: '01',
    title: 'Stay curious',
    description:
      'Ask better questions, keep learning, and look beyond the obvious answer.',
  },
  {
    number: '02',
    title: 'Make it meaningful',
    description:
      'Connect every idea to a real need, a clear purpose, and a useful outcome.',
  },
  {
    number: '03',
    title: 'Build together',
    description:
      'Share knowledge early, respect different perspectives, and make progress visible.',
  },
]

export function TeamPrinciples() {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  )

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return

      const eyebrow = section.querySelector('[data-team="eyebrow"]')
      const heading = section.querySelector('[data-team="heading"]')
      const description = section.querySelector(
        '[data-team="description"]',
      )

      const rows = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll('[data-team="row"]'),
      )

      const mm = gsap.matchMedia(section)

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set([eyebrow, heading, description, ...rows], {
          clearProps: 'all',
        })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set([eyebrow, heading, description], {
          autoAlpha: 0,
          y: 14,
        })

        gsap.set(rows, {
          autoAlpha: 0,
          y: 16,
        })

        const timeline = gsap.timeline({
          defaults: {
            ease: 'power3.out',
          },
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            once: true,
          },
        })

        timeline
          .to(eyebrow, {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
          })
          .to(
            heading,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
            },
            '-=0.2',
          )
          .to(
            description,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
            },
            '-=0.35',
          )
          .to(
            rows,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.13,
            },
            '-=0.2',
          )

        return () => {
          timeline.scrollTrigger?.kill()
          timeline.kill()
        }
      })

      return () => mm.revert()
    },
    {
      scope: sectionRef,
      dependencies: [reducedMotion],
    },
  )

  return (
    <section
      ref={sectionRef}
      aria-labelledby="team-principles-title"
      className="bg-white px-5 py-12 sm:px-8 sm:py-16 lg:py-20"
    >
      <div className="mx-auto grid w-full max-w-[1080px] grid-cols-1 gap-10 sm:grid-cols-[0.85fr_1.5fr] sm:gap-12 lg:gap-[88px]">
        {/* Left column: introduction */}
        <div className="min-w-0">
          <p
            data-team="eyebrow"
            className="mb-3 flex items-center gap-2 text-[12px] leading-4 font-medium text-[#102328]"
          >
            <span
              aria-hidden="true"
              className="h-1 w-1 shrink-0 rounded-[1px] bg-[#81d870]"
            />
            How we Work
          </p>

          <h2
            id="team-principles-title"
            data-team="heading"
            className="font-display m-0 max-w-[400px] text-[clamp(2.5rem,4.3vw,3.5rem)] leading-[1.02] font-normal tracking-[-0.055em] text-[#102328]"
          >
            Good work is a
            <br />
            team sport.
          </h2>

          <p
            data-team="description"
            className="mt-4 max-w-[340px] text-[13px] leading-[1.65] text-[#536164]"
          >
            The best outcomes happen when different disciplines share
            context, challenge assumptions, and stay focused on the same
            goal.
          </p>
        </div>

        {/* Right column: working principles */}
        <div
          aria-label="Our working principles"
          className="min-w-0 self-start border-t border-[#e5e8e7]"
        >
          {TEAM_PRINCIPLES.map((principle) => (
            <article
              key={principle.number}
              data-team="row"
              className="grid min-h-[72px] grid-cols-[24px_minmax(0,1fr)] items-center gap-3 border-b border-[#e5e8e7] py-4 sm:min-h-[80px]"
            >
              <span className="text-[10px] leading-none font-medium text-[#65c957]">
                {principle.number}
              </span>

              <div className="min-w-0">
                <h3 className="m-0 text-[14px] leading-[1.4] font-semibold tracking-[-0.02em] text-[#102328]">
                  {principle.title}
                </h3>

                <p className="mt-1 text-[11px] leading-[1.6] text-[#899193]">
                  {principle.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
