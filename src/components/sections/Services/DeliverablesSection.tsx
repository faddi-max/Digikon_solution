import { useRef } from 'react'

import { gsap, useGSAP } from '@/lib/motion'
import type { ServiceDeliverableItem, ServiceDeliverablesData } from './servicesDetailData'

export type { ServiceDeliverableItem, ServiceDeliverablesData }

/** Default copy for the "Clear, actionable deliverables." section. */
const DEFAULT_LABEL = 'What you receive'
const DEFAULT_TITLE = 'Clear, actionable deliverables.'
const DEFAULT_INTRO =
  'Every engagement produces work you can read, question and act on. Each deliverable is written in plain language and tied to a decision it helps you make.'
const DEFAULT_ITEMS: readonly ServiceDeliverableItem[] = [
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
]

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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function DeliverablesSection({ data }: { data?: ServiceDeliverablesData } = {}) {
  const root = useRef<HTMLElement>(null)

  const label = data?.label ?? DEFAULT_LABEL
  const title = data?.title ?? DEFAULT_TITLE
  const intro = data?.intro ?? DEFAULT_INTRO
  const items = data?.items ?? DEFAULT_ITEMS

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
    { scope: root, dependencies: [data] },
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
                {title}
              </span>
            </span>
          </h2>
          <p
            data-dl="label"
            className="flex items-center gap-2.5 text-[13px] leading-[18px] font-medium text-teal-900 lg:col-start-1 lg:row-start-2 lg:mt-[5px]"
          >
            <span aria-hidden="true" className="size-2 bg-green-500" />
            {label}
          </p>
          <p
            data-dl="intro"
            className="max-w-[535px] text-base leading-[1.8] text-ink-muted lg:col-start-2 lg:row-start-2"
          >
            {intro}
          </p>
        </div>

        {/* Deliverables */}
        <ul role="list" className="mt-[clamp(3rem,5.4vw,6.5rem)]">
          {items.map((item) => (
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
