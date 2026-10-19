import { useRef } from 'react'

import { gsap, useGSAP } from '@/lib/motion'

/**
 * Copy for the "Clear, actionable deliverables." section.
 *
 * The supplied screenshot is too small to read the label, the intro and the five descriptions,
 * so those seven pieces of text are written here to fit the layout. The heading and the five
 * titles are as read from the design. Replace them with the Figma copy; nothing else changes.
 */
const LABEL = 'What you receive'
const TITLE = 'Clear, actionable deliverables.'
const INTRO =
  'Every engagement produces work you can read, question and act on. Each deliverable is written in plain language and tied to a decision it helps you make.'
const ITEMS = [
  {
    title: 'Search opportunity mapping',
    text: 'A clear view of where demand exists, what your audience is searching for, and which opportunities are worth pursuing first.',
  },
  {
    title: 'Technical & on-page SEO review',
    text: 'A review of site structure, speed, indexing and on-page elements, with every finding explained in plain language.',
  },
  {
    title: 'Prioritised improvement roadmap',
    text: 'An ordered plan of improvements, weighed by effort, relevance and likely impact.',
  },
  {
    title: 'Content & keyword direction',
    text: 'Guidance on the topics, pages and keywords that should shape what you publish next.',
  },
  {
    title: 'Performance measurement & reporting',
    text: 'Regular reporting on search performance, what changed, and what we will do next.',
  },
] as const

function Check() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

/**
 * "Clear, actionable deliverables." section, styled with Tailwind utilities only.
 *
 * Layout: a 1240px column. From 1024px the header has the label on the left and the heading and
 * intro on the right, over a list of five rows (tick, title, description in a right-hand column)
 * divided by hairlines. Below 1024px each row stacks the description under the title.
 *
 * Note on the design: in the reference the tick sits at the bottom-left of each row, away from
 * the title. It is aligned with the title here, which reads as the intended pairing; move the
 * `lg:mt-*` on the tick if the Figma position is wanted.
 *
 * Motion (GSAP, replayed every time the section is entered from either direction): heading
 * lines slide out of masks, the intro follows, then each divider draws and its row rises in
 * turn with the tick popping. Rows respond to hover: the title shifts, the tick fills green and
 * the divider darkens. Reduced motion shows the final layout.
 */
export function DeliverablesSection() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const all = (sel: string) => gsap.utils.toArray<HTMLElement>(el.querySelectorAll(sel))
      const one = (sel: string) => el.querySelector<HTMLElement>(sel)

      const label = one('[data-dl="label"]')
      const lines = all('[data-dl="line"]')
      const intro = one('[data-dl="intro"]')
      const rules = all('[data-dl="rule"]')
      const ticks = all('[data-dl="tick"]')
      const bodies = all('[data-dl="body"]')

      const mm = gsap.matchMedia(el)
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(label, { autoAlpha: 0, x: -12 })
        gsap.set(lines, { yPercent: 110 })
        gsap.set(intro, { autoAlpha: 0, y: 18 })
        gsap.set(rules, { scaleX: 0, transformOrigin: '0 50%' })
        gsap.set(ticks, { scale: 0 })
        gsap.set(bodies, { autoAlpha: 0, y: 20 })

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
        tl.to(rules, { scaleX: 1, duration: 0.8, stagger: 0.12, ease: 'power2.inOut' }, 0.7)
        tl.to(bodies, { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.12 }, 0.85)
        tl.to(ticks, { scale: 1, duration: 0.45, stagger: 0.12, ease: 'back.out(2.2)' }, 0.95)
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="deliverables-title"
      className="relative isolate z-10 overflow-clip bg-[#F7FBF5] px-[clamp(1rem,0.32rem+2.86vw,5rem)] pt-[clamp(4rem,7.5vw,9rem)] pb-[clamp(4rem,8.7vw,10.5rem)] font-sans text-teal-900"
    >
      <div className="mx-auto max-w-[1240px]">
        {/* Header */}
        <div className="grid gap-y-5 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-y-5">
          <h2
            id="deliverables-title"
            className="font-display text-[clamp(2rem,1.2rem+2.1vw,3.25rem)] leading-[1.15] font-normal lg:col-start-2 lg:row-start-1"
          >
            <span className="-mx-[0.1em] block overflow-clip px-[0.1em] pb-[0.2em] -mb-[0.2em]">
              <span data-dl="line" className="block">
                {TITLE}
              </span>
            </span>
          </h2>
          <p
            data-dl="label"
            className="flex items-center gap-2.5 text-[13px] leading-[18px] font-medium text-teal-900 lg:col-start-1 lg:row-start-2 lg:mt-[5px]"
          >
            <span aria-hidden="true" className="size-2 bg-green-500" />
            {LABEL}
          </p>
          <p
            data-dl="intro"
            className="max-w-[535px] text-base leading-[1.8] text-ink-muted lg:col-start-2 lg:row-start-2"
          >
            {INTRO}
          </p>
        </div>

        {/* Deliverables */}
        <ul role="list" className="mt-[clamp(3rem,5.4vw,6.5rem)]">
          {ITEMS.map((item) => (
            <li key={item.title} className="group relative">
              <span
                data-dl="rule"
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-teal-900/10 transition-colors duration-200 group-hover:bg-teal-900/30"
              />
              <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-x-5 gap-y-3 py-8 lg:grid-cols-[36px_minmax(0,1fr)_minmax(0,453px)] lg:gap-x-[clamp(2rem,3.3vw,3.9rem)] lg:gap-y-0 lg:pt-[clamp(1.75rem,2.2vw,2.7rem)] lg:pb-[clamp(2rem,6.2vw,7.5rem)]">
                <span
                  data-dl="tick"
                  aria-hidden="true"
                  className="row-span-1 flex size-9 items-center justify-center rounded-full border border-teal-900/10 bg-white text-[#2E7D32] transition-[background-color,color,border-color] duration-200 ease-out group-hover:border-green-500 group-hover:bg-green-500 group-hover:text-teal-900 lg:mt-[clamp(0.5rem,1.1vw,1.3rem)]"
                >
                  <Check />
                </span>
                <h3 className="self-center font-display text-[clamp(1.5rem,1.2rem+0.8vw,1.875rem)] leading-[1.2] font-normal transition-transform duration-200 ease-out group-hover:translate-x-1.5 lg:mt-[clamp(0.5rem,1.1vw,1.3rem)]">
                  {item.title}
                </h3>
                <p
                  data-dl="body"
                  className="col-start-2 max-w-[453px] text-sm leading-[1.8] text-ink-muted lg:col-start-3 lg:row-start-1 lg:-mt-1"
                >
                  {item.text}
                </p>
              </div>
            </li>
          ))}
          <li aria-hidden="true" className="h-px bg-teal-900/10" />
        </ul>
      </div>
    </section>
  )
}
