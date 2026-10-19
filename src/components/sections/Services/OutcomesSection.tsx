import { useRef, type ReactNode } from 'react'

import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

/** Copy read from the Figma "Outcomes" frame. */
const LABEL = 'Outcomes'
const TITLE = 'What meaningful SEO delivers.'
const INTRO =
  'When search is done well, improvement compounds. Each stage of progress creates the conditions for the next — building a channel that sustains itself over time.'
const ITEMS = [
  {
    title: 'Visibility',
    text: 'Your pages appear where your audience is actively searching.',
    icon: (
      <>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  {
    title: 'Qualified traffic',
    text: 'The right visitors arrive with genuine intent to engage.',
    icon: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M16 4.6a3.2 3.2 0 0 1 0 6.2M18 14.3c1.8.8 3 2.6 3 4.7" />
      </>
    ),
  },
  {
    title: 'Leads',
    text: 'Visitors convert to enquiries and meaningful interactions.',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M3.5 7l8.5 6 8.5-6" />
      </>
    ),
  },
  {
    title: 'Business growth',
    text: 'Search becomes a reliable, compounding channel for revenue.',
    icon: (
      <>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M15 7h6v6" />
      </>
    ),
  },
] as const

/**
 * "What meaningful SEO delivers." section, styled with Tailwind utilities only.
 *
 * Layout: a 1240px column. From 1024px the header has the label on the left and the heading
 * and intro on the right, over four centred columns separated by green arrows. From 640px
 * the columns become 2 x 2; below that a single column. Type scales with the viewport.
 *
 * Motion (GSAP, replayed every time the section is entered from either direction): label and
 * heading lines slide out of masks, the intro follows, then each column rises in turn with its
 * icon popping and the separator dots appearing. Icons lift and glow on hover. A green glow
 * in the corner breathes while the section is on screen. Reduced motion shows the final layout.
 */
export function OutcomesSection() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const all = (sel: string) => gsap.utils.toArray<HTMLElement>(el.querySelectorAll(sel))
      const one = (sel: string) => el.querySelector<HTMLElement>(sel)

      const label = one('[data-oc="label"]')
      const lines = all('[data-oc="line"]')
      const intro = one('[data-oc="intro"]')
      const items = all('[data-oc="item"]')
      const icons = all('[data-oc="icon"]')
      const seps = all('[data-oc="sep"]')
      const glow = one('[data-oc="glow"]')

      const mm = gsap.matchMedia(el)
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(label, { autoAlpha: 0, x: -12 })
        gsap.set(lines, { yPercent: 110 })
        gsap.set(intro, { autoAlpha: 0, y: 18 })
        gsap.set(items, { autoAlpha: 0, y: 22 })
        gsap.set(icons, { scale: 0.6 })
        gsap.set(seps, { autoAlpha: 0, scale: 0 })

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
        tl.to(items, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.14 }, 0.8)
        tl.to(icons, { scale: 1, duration: 0.6, stagger: 0.14, ease: 'back.out(2)' }, 0.8)
        tl.to(seps, { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.14 }, 1.0)

        // The corner glow breathes, but only while the section is on screen.
        if (glow) {
          const breathe = gsap.to(glow, {
            scale: 1.25,
            opacity: 0.6,
            duration: 3,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            paused: true,
          })
          const st = ScrollTrigger.create({
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => breathe.paused(!self.isActive),
          })
          return () => st.kill()
        }
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="outcomes-title"
      className="relative isolate z-10 overflow-clip bg-[linear-gradient(180deg,#03171D_0%,#1A2F34_52%,#123A3A_100%)] bg-teal-900 px-[clamp(1rem,0.32rem+2.86vw,5rem)] pt-[clamp(4rem,8.07vw,10rem)] pb-[clamp(4rem,8vw,9.6rem)] lg:px-[15.83vw] font-sans text-white"
    >
      {/* Corner glow, top right. */}
      <span
        data-oc="glow"
        aria-hidden="true"
        className="pointer-events-none absolute -top-[18%] -right-[8%] -z-10 size-[min(520px,70vw)] rounded-full bg-[radial-gradient(closest-side,rgba(129,216,112,0.22),rgba(129,216,112,0))]"
      />

      <div className="mx-auto max-w-[1312px]">
        {/* Header */}
        <div className="grid gap-y-5 lg:grid-cols-[22.3%_minmax(0,1fr)] lg:gap-y-[clamp(1rem,1.25vw,1.5rem)]">
          <h2
            id="outcomes-title"
            className="font-display text-[clamp(2rem,2.708vw,3.25rem)] leading-[1.15] font-normal lg:col-start-2 lg:row-start-1"
          >
            <span className="-mx-[0.1em] block overflow-clip px-[0.1em] pb-[0.2em] -mb-[0.2em]">
              <span data-oc="line" className="block">
                {TITLE}
              </span>
            </span>
          </h2>
          <p
            data-oc="label"
            className="flex items-center gap-2.5 text-[13px] leading-[18px] font-medium text-green-500 lg:col-start-1 lg:row-start-2 lg:mt-[3px]"
          >
            <span aria-hidden="true" className="size-2 bg-green-500" />
            {LABEL}
          </p>
          <p
            data-oc="intro"
            className="max-w-[560px] text-base leading-[1.875] text-white/70 lg:col-start-2 lg:row-start-2"
          >
            {INTRO}
          </p>
        </div>

        {/* Outcomes */}
        <ul
          role="list"
          className="mx-auto mt-[clamp(3rem,6.98vw,8.4rem)] grid max-w-[1280px] gap-x-0 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0"
        >
          {ITEMS.map((item, i) => (
            <li key={item.title} data-oc="item" className="group relative px-3 text-center">
              <span
                data-oc="icon"
                aria-hidden="true"
                className="mx-auto flex size-[clamp(2.75rem,2.917vw,3.5rem)] items-center justify-center rounded-full border border-green-500/30 bg-[#2E7D32]/35 text-green-500 transition-[transform,box-shadow,background-color] duration-200 ease-out group-hover:-translate-y-1 group-hover:bg-[#2E7D32]/55 group-hover:shadow-[0_8px_24px_-6px_rgba(129,216,112,0.45)]"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {item.icon as ReactNode}
                </svg>
              </span>
              <h3 className="mt-[clamp(1.25rem,1.5625vw,1.875rem)] font-display text-[clamp(1.25rem,1.25vw,1.5rem)] leading-[1.25] font-normal">
                {item.title}
              </h3>
              <p className="mx-auto mt-[clamp(0.75rem,0.9375vw,1.125rem)] max-w-[195px] text-[13px] leading-[1.85] text-white/60 lg:text-xs lg:leading-[1.9]">
                {item.text}
              </p>
              {i < ITEMS.length - 1 && (
                <svg
                  data-oc="sep"
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute top-[clamp(2.25rem,4.74vw,5.7rem)] right-0 hidden size-5 translate-x-1/2 text-green-500 lg:block"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}