import { useRef } from 'react'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

import chartImg from '@/assets/images/automation-opportunity-chart.png'

const OPPORTUNITY = {
  label: 'The Opportunity',
  lines: ['Less chasing', 'tasks. More'],
  accent: 'meaningful work.',
  paragraphs: [
    'Small manual steps add up: copying data between tools, following up on leads, preparing reports, updating records, or routing requests. Automation connects those steps into a smoother system, so work keeps moving without constant hand-holding.',
    'We start with the way your team already works, then design practical automations around your real processes—not technology for technology’s sake.',
  ],
  steps: [
    { n: '01', t: 'Find friction' },
    { n: '02', t: 'Connect the flow' },
    { n: '03', t: 'Keep improving' },
  ],
} as const

/**
 * "The Opportunity": why automation is worth doing, in a headline, two short paragraphs and a
 * three-step line, over a faint rising chart.
 *
 * Layout: from `lg` it is the 1920px design scaled as a unit (`--u` is 1/1920 of the width;
 * text keeps a readable floor). Below `lg` it is one column: label, headline, copy, steps,
 * with the chart cropped behind the bottom.
 *
 * Motion (GSAP, once, when it scrolls into view): the headline lines rise out of masks, the
 * chart artwork wipes in from the left, and the copy and steps follow. Reduced motion gets
 * the finished page.
 */
export function OpportunitySection() {
  const root = useRef<HTMLElement>(null)
  const motion = !useMediaQuery('(prefers-reduced-motion: reduce)')

  useGSAP(
    () => {
      const el = root.current
      if (!el || !motion) return
      const all = <T extends Element = HTMLElement>(sel: string) =>
        gsap.utils.toArray<T>(el.querySelectorAll(sel))

      const mm = gsap.matchMedia(el)
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const fades = all('[data-op="fade"]')
        const lines = all('[data-op="line-mask"]')
        const chart = all('[data-op="chart"]')
        const rule = all('[data-op="rule"]')
        const steps = all('[data-op="step"]')

        gsap.set(fades, { autoAlpha: 0, y: 20 })
        gsap.set(lines, { yPercent: 110 })
        // The chart is wiped in from the left, like a line being drawn.
        gsap.set(chart, { clipPath: 'inset(0% 100% 0% 0%)', autoAlpha: 0 })
        gsap.set(rule, { scaleX: 0, transformOrigin: '0% 50%' })
        gsap.set(steps, { autoAlpha: 0, y: 16 })

        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          paused: true,
        })
        tl.to(fades[0], { autoAlpha: 1, y: 0, duration: 0.55 }, 0)
        tl.to(lines, { yPercent: 0, duration: 0.85, stagger: 0.1 }, 0.1)
        tl.to(chart, { autoAlpha: 1, duration: 0.6, ease: 'power1.out' }, 0.2)
        tl.to(chart, { clipPath: 'inset(0% 0% 0% 0%)', duration: 2.1, ease: 'power2.inOut' }, 0.2)
        tl.to(fades.slice(1), { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.55)
        tl.to(rule, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, 0.9)
        tl.to(steps, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.12 }, 1.05)

        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top 78%',
          once: true,
          onEnter: () => tl.play(),
        })

        return () => {
          st.kill()
          tl.kill()
        }
      })
    },
    { scope: root, dependencies: [motion] },
  )

  return (
    <section
      ref={root}
      aria-labelledby="automation-opportunity-title"
      className="@container relative overflow-clip bg-white"
    >
      <div className="relative [--u:calc(100cqw/1920)] px-5 py-16 sm:px-10 sm:py-20 lg:max-[1439px]:px-16 lg:max-[1439px]:py-24 min-[1440px]:u-h-659 min-[1440px]:p-0">
        <div
          data-op="chart"
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] lg:h-full"
        >
          {/* The artwork is only a faint texture: 13% opacity, as designed. */}
          <img
            src={chartImg}
            alt=""
            width={2000}
            height={672}
            decoding="async"
            loading="lazy"
            className="size-full object-cover object-[right_bottom] opacity-[0.13]"
          />
        </div>

        <div className="max-[1439px]:mx-auto lg:max-[1439px]:grid lg:max-[1439px]:max-w-[76rem] lg:max-[1439px]:grid-cols-[1fr_1.15fr] lg:max-[1439px]:grid-rows-[auto_1fr] lg:max-[1439px]:gap-x-16 min-[1440px]:contents">
          <p
            data-op="fade"
            className="lg:max-[1439px]:col-start-1 lg:max-[1439px]:row-start-1 flex items-center gap-2.5 text-[0.9375rem] leading-5 font-medium text-teal-900 min-[1440px]:absolute min-[1440px]:u-top-210 min-[1440px]:u-left-344 min-[1440px]:u-gap-10 min-[1440px]:u-text-16 min-[1440px]:u-leading-20 [--tf:13px]"
          >
            <span className="size-2 rounded-[1px] bg-green-500 min-[1440px]:u-size-8" aria-hidden="true" />
            {OPPORTUNITY.label}
          </p>

          <h2
            id="automation-opportunity-title"
            className="lg:max-[1439px]:col-start-1 lg:max-[1439px]:row-start-2 font-display mt-5 text-[clamp(2.25rem,9.5vw,3.5rem)] lg:max-[1439px]:text-[2.75rem] leading-[1.15] font-normal tracking-[-0.005em] text-teal-900 min-[1440px]:absolute min-[1440px]:u-top-249 min-[1440px]:u-left-344 min-[1440px]:mt-0 min-[1440px]:u-w-460 min-[1440px]:u-text-54 min-[1440px]:u-leading-61 min-[1440px]:text-wrap! [--tf:30px]"
          >
            {OPPORTUNITY.lines.map((line) => (
              <span key={line} className="-mx-[0.1em] -mb-[0.2em] block overflow-clip px-[0.1em] pb-[0.2em]">
                <span data-op="line-mask" className="block min-[1440px]:whitespace-nowrap">
                  {line}
                </span>
              </span>
            ))}
            <span className="-mx-[0.1em] -mb-[0.2em] block overflow-clip px-[0.1em] pb-[0.2em]">
              <span data-op="line-mask" className="block min-[1440px]:whitespace-nowrap">
                <em className="text-green-500 italic">{OPPORTUNITY.accent}</em>
              </span>
            </span>
          </h2>

          <div className="mt-8 lg:max-[1439px]:col-start-2 lg:max-[1439px]:row-span-2 lg:max-[1439px]:row-start-1 lg:max-[1439px]:mt-0 min-[1440px]:contents">
            <div
              data-op="fade"
              className="max-w-[40rem] text-[1rem] leading-[1.7] font-medium text-teal-900/80 min-[1440px]:absolute min-[1440px]:u-top-170 min-[1440px]:u-left-912 min-[1440px]:u-w-604 min-[1440px]:max-w-none min-[1440px]:u-text-[17.8] min-[1440px]:u-leading-29 min-[1440px]:text-wrap! [--tf:13px]"
            >
              {OPPORTUNITY.paragraphs.map((text) => (
                <p key={text} className="min-[1440px]:text-wrap!">
                  {text}
                </p>
              ))}
            </div>

            <div
              data-op="rule"
              aria-hidden="true"
              className="mt-8 h-0.5 max-w-[40rem] bg-[linear-gradient(90deg,rgb(129_216_112/0.7),rgb(129_216_112/0.25)_70%,rgb(129_216_112/0.08))] min-[1440px]:absolute min-[1440px]:u-top-399 min-[1440px]:u-left-912 min-[1440px]:mt-0 min-[1440px]:u-w-592 min-[1440px]:u-h-2 min-[1440px]:max-w-none"
            />

            <ol className="mt-8 grid max-w-[40rem] grid-cols-3 gap-4 min-[1440px]:absolute min-[1440px]:u-top-440 min-[1440px]:u-left-912 min-[1440px]:mt-0 min-[1440px]:max-w-none min-[1440px]:u-w-624 min-[1440px]:u-gap-0">
              {OPPORTUNITY.steps.map((step) => (
                <li key={step.n} data-op="step">
                  <span className="font-display block text-[1.5rem] leading-none text-teal-900 min-[1440px]:u-text-26 [--tf:20px]">
                    {step.n}
                  </span>
                  <span className="mt-2.5 block text-[0.8125rem] leading-4 font-medium text-teal-900/70 min-[1440px]:u-mt-14 min-[1440px]:u-text-12.5 min-[1440px]:u-leading-16 [--tf:12px]">
                    {step.t}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}