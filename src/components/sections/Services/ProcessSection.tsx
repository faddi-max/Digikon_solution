import { useRef, useState } from 'react'

import { gsap, useGSAP } from '@/lib/motion'

import './ProcessSection.css'

/** Copy read from the Figma "How we work" frame. */
const LABEL = 'How we work'
const TITLE = 'A clear, measured process.'
const INTRO =
  'Every engagement follows four stages. Each one builds on the last, creating a cycle of continuous improvement driven by evidence rather than assumption.'
const STEPS = [
  {
    title: 'Discover',
    text: 'Understand the business, audience, search intent, and opportunities. Audit the current site and competitive landscape to find where value is being left on the table.',
  },
  {
    title: 'Prioritise',
    text: 'Identify technical issues, relevant keywords, and the highest-value improvements. Build a practical roadmap based on effort, relevance, and likely impact.',
  },
  {
    title: 'Improve',
    text: 'Strengthen technical SEO, on-page structure, and content direction. Make every page work harder to communicate value to search engines and visitors.',
  },
  {
    title: 'Learn',
    text: 'Review performance signals and refine the strategy over time. SEO becomes a continuous process of learning and improvement — not a one-off task.',
  },
] as const

/**
 * "A clear, measured process." section, styled with Tailwind utilities (plus one CSS file for
 * the grid mesh).
 *
 * Layout: from 1024px a header (label under the heading's left edge, heading and intro on the
 * right) over a four-column timeline; below that a single column with a vertical timeline.
 * Type scales with the viewport.
 *
 * Interaction: step one is active by default; hovering a step (or tapping it) moves the
 * highlight and the green progress along the line to it.
 *
 * Motion (GSAP, replayed every time the section is entered from either direction): heading
 * lines slide out of masks, the line draws, dots pop in, then each step's number, title and
 * text rise in turn. The grid moves slower than the page. Reduced motion shows the final
 * layout.
 */
export function ProcessSection() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const all = (sel: string) => gsap.utils.toArray<HTMLElement>(el.querySelectorAll(sel))
      const one = (sel: string) => el.querySelector<HTMLElement>(sel)

      const label = one('[data-pr="label"]')
      const lines = all('[data-pr="line"]')
      const intro = one('[data-pr="intro"]')
      const tracks = all('[data-pr="track"]')
      const dots = all('[data-pr="dot"]')
      const mesh = one('[data-pr="mesh"]')
      const steps = all('[data-pr="step"]')

      const mm = gsap.matchMedia(el)
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const wide = window.matchMedia('(min-width: 1024px)').matches
        gsap.set(label, { autoAlpha: 0, x: -12 })
        gsap.set(lines, { yPercent: 110 })
        gsap.set(intro, { autoAlpha: 0, y: 18 })
        gsap.set(
          tracks,
          wide ? { scaleX: 0, transformOrigin: '0 50%' } : { scaleY: 0, transformOrigin: '50% 0' },
        )
        gsap.set(dots, { scale: 0 })
        steps.forEach((s) =>
          gsap.set(s.querySelectorAll('[data-pr="num"],[data-pr="name"],[data-pr="text"]'), {
            autoAlpha: 0,
            y: 18,
          }),
        )

        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            trigger: el,
            start: 'top 65%',
            toggleActions: 'restart reset restart reset',
          },
        })
        tl.to(label, { autoAlpha: 1, x: 0, duration: 0.55 }, 0.1)
        tl.to(lines, { yPercent: 0, duration: 0.85, stagger: 0.11 }, 0.15)
        tl.to(intro, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.5)
        tl.to(
          tracks,
          wide
            ? { scaleX: 1, duration: 0.7, stagger: 0.18, ease: 'power2.inOut' }
            : { scaleY: 1, duration: 0.7, stagger: 0.18, ease: 'power2.inOut' },
          0.7,
        )
        tl.to(dots, { scale: 1, duration: 0.45, stagger: 0.18, ease: 'back.out(2)' }, 0.7)
        steps.forEach((s, i) => {
          tl.to(
            s.querySelectorAll('[data-pr="num"],[data-pr="name"],[data-pr="text"]'),
            { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.08 },
            0.85 + i * 0.18,
          )
        })

        // The grid moves a little slower than the page.
        if (mesh) {
          gsap.fromTo(
            mesh,
            { yPercent: -4 },
            {
              yPercent: 4,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        }
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="process-title"
      className="relative isolate z-10 overflow-clip bg-[linear-gradient(180deg,#DDF3D7_0%,#EAF8E7_32%,#F6FCF5_70%,#FFFFFF_100%)] px-[clamp(1rem,0.32rem+2.86vw,5rem)] pt-[clamp(4rem,7.8vw,9.4rem)] pb-[clamp(4rem,8vw,9.7rem)] font-sans text-teal-900"
    >
      <div
        data-pr="mesh"
        aria-hidden="true"
        className="dk-pr__mesh pointer-events-none absolute inset-x-0 -top-[4%] -z-10 h-[108%]"
      />

      <div className="mx-auto max-w-[1336px]">
        {/* Header */}
        <div className="grid gap-y-5 lg:grid-cols-[294px_minmax(0,1fr)] lg:gap-y-6">
          <h2
            id="process-title"
            className="font-display text-[clamp(2rem,1.2rem+2.1vw,3.25rem)] leading-[1.15] font-normal lg:col-start-2 lg:row-start-1"
          >
            <span className="-mx-[0.1em] block overflow-clip px-[0.1em] pb-[0.2em] -mb-[0.2em]">
              <span data-pr="line" className="block">
                {TITLE}
              </span>
            </span>
          </h2>
          <p
            data-pr="label"
            className="flex items-center gap-2.5 text-[13px] leading-[18px] font-medium text-teal-900 lg:col-start-1 lg:row-start-2 lg:mt-[5px]"
          >
            <span aria-hidden="true" className="size-2 bg-green-500" />
            {LABEL}
          </p>
          <p
            data-pr="intro"
            className="max-w-[530px] text-base leading-[1.8] text-ink-muted lg:col-start-2 lg:row-start-2"
          >
            {INTRO}
          </p>
        </div>

        {/* Timeline */}
        <ol role="list" className="mt-[clamp(3rem,5.2vw,6.25rem)] grid gap-0 lg:grid-cols-4">
          {STEPS.map((step, i) => {
            const done = i <= active
            const filled = i < active
            const last = i === STEPS.length - 1
            return (
              <li
                key={step.title}
                data-pr="step"
                onPointerEnter={() => setActive(i)}
                className="group relative pb-10 pl-9 last:pb-0 lg:pr-9 lg:pb-0 lg:pl-0"
              >
                <p data-pr="num" className="mb-2 text-[11px] leading-none text-ink-muted lg:mb-0">
                  0{i + 1}
                </p>

                {/* Dot and the line segment that follows it. */}
                <div className="absolute top-0 bottom-0 left-0 w-4 lg:relative lg:mt-[14px] lg:h-4 lg:w-auto">
                  <span
                    data-pr="track"
                    aria-hidden="true"
                    className={`absolute top-4 bottom-0 left-[7px] w-px bg-teal-900/12 lg:top-1/2 lg:right-0 lg:bottom-auto lg:left-4 lg:h-px lg:w-auto ${last ? 'max-lg:hidden' : ''}`}
                  >
                    <span
                      className={`absolute inset-0 origin-top bg-green-500 transition-transform duration-500 ease-in-out lg:origin-left ${filled ? 'scale-100' : 'max-lg:scale-y-0 lg:scale-x-0'}`}
                    />
                  </span>
                  <span
                    data-pr="dot"
                    aria-hidden="true"
                    className={`relative block size-4 rounded-full border-[1.5px] transition-[background-color,border-color,box-shadow] duration-300 ease-out ${
                      done
                        ? 'border-[#2E7D32] bg-green-500 shadow-[0_0_0_4px_rgba(129,216,112,0.28)]'
                        : 'border-teal-900 bg-white'
                    }`}
                  />
                </div>

                <h3
                  data-pr="name"
                  className="font-display text-[clamp(1.5rem,1.2rem+0.8vw,1.875rem)] leading-[1.2] font-normal max-lg:mt-0 lg:mt-7"
                >
                  {step.title}
                </h3>
                <p
                  data-pr="text"
                  className={`mt-3 max-w-[270px] text-sm leading-[1.8] transition-colors duration-300 ${
                    i === active ? 'text-teal-900' : 'text-ink-muted'
                  }`}
                >
                  {step.text}
                </p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
