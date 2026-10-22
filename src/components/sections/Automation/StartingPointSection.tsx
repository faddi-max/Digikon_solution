import { useRef } from 'react'

import { ScrollRevealText } from '@/components/motion/ScrollRevealText'
import { CtaButton } from '@/components/ui/CtaButton'
import { useContactOverlay } from '@/components/sections/contact/ContactOverlayContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, useGSAP } from '@/lib/motion'

/**
 * "A practical starting point. Room to scale.": three ways to begin, then a closing banner.
 *
 * Measured from the supplied screenshots (590px wide crops) scaled to the 1148px content
 * width the other sections use (x1.946). Cards: three columns from 900px, the middle one
 * lifted ~10px. Banner: from 900px sizes use design pixels (`--u` is 1/1148 of its width,
 * type keeps a readable floor); below that it stacks with fluid type.
 *
 * Motion (GSAP, once, on scroll): intro fades, heading words rise, cards arrive in turn,
 * banner fades up, ring drifts with scroll. Cards lift on hover (fine pointers). Reduced
 * motion shows the finished section.
 */

const COPY = {
  label: 'Where to begin',
  lead: 'A practical starting point.',
  accent: 'Room to scale.',
  body: 'Start with one clear piece of work. Every option stands on its own and can grow into a connected system when you are ready.',
  banner: {
    lead: 'Give your team a system that',
    accent: 'keeps moving.',
    body: 'Let’s identify one process worth improving and map out a practical way to automate it.',
    cta: 'Talk about your workflow',
  },
}

type Card = {
  id: string
  tone: 'cream' | 'green'
  tag: string
  title: string
  body: string
  points: readonly string[]
  cta: string
  dark?: boolean
}

const CARDS: readonly Card[] = [
  {
    id: 'audit',
    tone: 'cream',
    tag: '01 / Clarity',
    title: 'Workflow audit',
    body: 'For teams that know something should be simpler, but need help identifying where to start.',
    points: ['Process and tool review', 'Opportunity prioritisation', 'Recommended next steps'],
    cta: 'Book an audit',
  },
  {
    id: 'build',
    tone: 'green',
    tag: '02 / Implement',
    title: 'Focused automation build',
    body: 'For one well-defined workflow that needs to be designed, connected, tested, and documented.',
    points: ['Scoped implementation', 'Integration and exception handling', 'Handover and documentation'],
    cta: 'Scope a build',
    dark: true,
  },
  {
    id: 'evolve',
    tone: 'cream',
    tag: '03 / Evolve',
    title: 'Ongoing optimisation',
    body: 'For growing systems that need monitoring, improvements, and new workflows over time.',
    points: ['Iteration and maintenance', 'Performance review', 'Additional workflows'],
    cta: 'Discuss ongoing support',
  },
]

function Tick() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="mt-[0.28em] size-3 flex-none fill-none stroke-teal-900 stroke-[2]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3.5 8.4 3 3 6-6.4" />
    </svg>
  )
}

/** Outline pill. Opens the contact overlay like every other CTA on the site. */
function OutlineButton({ children }: { children: string }) {
  const contact = useContactOverlay()
  return (
    <a
      href="/contact"
      onClick={(e) => {
        if (!contact.available || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        contact.open()
      }}
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#e4e0d0] bg-[#fffefa] px-6 text-[0.8125rem] leading-none font-semibold text-teal-900 no-underline transition-[background-color,border-color] duration-200 ease-out hover:border-teal-900/40 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-500 motion-reduce:transition-none"
    >
      {children}
    </a>
  )
}

export function StartingPointSection() {
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
        const fades = all('[data-sp="fade"]')
        const cards = all('[data-sp="card"]')
        const banner = all('[data-sp="banner"]')
        const arcs = all('[data-sp="arc"]')

        gsap.set(fades, { autoAlpha: 0, y: 18 })
        gsap.set(cards, { autoAlpha: 0, y: 28 })
        gsap.set(banner, { autoAlpha: 0, y: 32 })

        const intro = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: el, start: 'top 72%', once: true },
        })
        intro
          .to(fades, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.2)
          .to(cards, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0.5)

        const bannerIn = gsap.to(banner, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: banner[0], start: 'top 88%', once: true },
        })

        const drift = arcs.map((a) =>
          gsap.fromTo(
            a,
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: 'none',
              scrollTrigger: { trigger: banner[0], start: 'top bottom', end: 'bottom top', scrub: 0.6 },
            },
          ),
        )

        return () => {
          intro.scrollTrigger?.kill()
          intro.kill()
          bannerIn.scrollTrigger?.kill()
          bannerIn.kill()
          drift.forEach((d) => {
            d.scrollTrigger?.kill()
            d.kill()
          })
        }
      })
    },
    { scope: root, dependencies: [motion] },
  )

  return (
    <section
      ref={root}
      aria-labelledby="automation-start-title"
      className="relative isolate overflow-clip bg-[linear-gradient(180deg,#e9f8e4_0%,#f4fcf1_45%,#ffffff_100%)] px-[clamp(1rem,0.32rem+2.86vw,5rem)] pt-[clamp(4rem,7vw,8.5rem)] pb-[clamp(3rem,6vw,7rem)] font-sans text-teal-900"
    >
      {/* Fine grid fading out downwards. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(180deg,#000_0%,transparent_75%)] bg-[linear-gradient(rgb(3_23_29/0.045)_1px,transparent_1px),linear-gradient(90deg,rgb(3_23_29/0.045)_1px,transparent_1px)] bg-[size:3rem_3rem]"
      />

      <div className="mx-auto max-w-[1148px]">
        {/* Header. */}
        <div className="grid gap-y-5 lg:grid-cols-[clamp(11rem,20%,15rem)_minmax(0,1fr)] lg:gap-x-8">
          <p
            data-sp="fade"
            className="flex items-center gap-2.5 text-[0.875rem] leading-[18px] font-medium lg:mt-3"
          >
            <span className="size-2 rounded-[1px] bg-green-500" aria-hidden="true" />
            {COPY.label}
          </p>
          <div>
            <h2
              id="automation-start-title"
              className="font-display text-[clamp(2rem,1.2rem+2.6vw,3.5rem)] leading-[1.12] font-normal tracking-[-0.01em]"
            >
              <ScrollRevealText
                as="span"
                style={{ display: 'block' }}
                text={COPY.lead}
                split="words"
                mode="play"
                duration={1.2}
                stagger={0.1}
                yOffset={20}
                start="top 85%"
              />
              <ScrollRevealText
                as="span"
                className="text-green-500 italic"
                style={{ display: 'block' }}
                text={COPY.accent}
                split="words"
                mode="play"
                duration={1.2}
                stagger={0.1}
                yOffset={20}
                start="top 85%"
              />
            </h2>
            <p
              data-sp="fade"
              className="mt-4 max-w-[34rem] text-[0.9375rem] leading-[1.7] text-ink-muted sm:text-base"
            >
              {COPY.body}
            </p>
          </div>
        </div>

        {/* Cards. */}
        <ul
          role="list"
          className="mt-[clamp(2rem,4vw,3.5rem)] grid gap-4 min-[900px]:grid-cols-3 min-[900px]:gap-[17px]"
        >
          {CARDS.map((c) => {
            const green = c.tone === 'green'
            return (
              <li
                key={c.id}
                data-sp="card"
                className={`flex flex-col rounded-[1.5rem] border p-7 transition-[translate,box-shadow] duration-300 ease-out motion-reduce:transition-none min-[900px]:p-[clamp(1.5rem,2.4vw,1.875rem)] [@media(hover:hover)]:hover:-translate-y-1.5 [@media(hover:hover)]:hover:shadow-[0_26px_50px_-30px_rgb(3_23_29/0.4)] ${
                  green
                    ? 'border-[#b5e3a9] bg-[#c8ecbf] min-[900px]:-mt-2.5 min-[900px]:mb-1.5'
                    : 'border-[#ebe8d9] bg-[#fffef9]'
                }`}
              >
                <p className="text-[0.625rem] leading-4 font-bold tracking-[0.12em] text-teal-900/70 uppercase">
                  {c.tag}
                </p>
                <h3 className="mt-5 text-[clamp(1.375rem,1.1rem+0.6vw,1.5625rem)] leading-[1.2] font-bold tracking-[-0.025em]">
                  {c.title}
                </h3>
                <p
                  className={`mt-3.5 max-w-[22rem] text-[0.8125rem] leading-[1.6] ${
                    green ? 'text-teal-900/65' : 'text-ink-muted'
                  }`}
                >
                  {c.body}
                </p>
                <ul role="list" className="mt-6 grid gap-3">
                  {c.points.map((p) => (
                    <li key={p} className="flex gap-2.5 text-[0.8125rem] leading-[1.5] text-teal-900/85">
                      <Tick />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-7">
                  {c.dark ? (
                    <CtaButton href="/contact" className="min-h-11 px-6 text-[0.8125rem]">
                      {c.cta}
                    </CtaButton>
                  ) : (
                    <OutlineButton>{c.cta}</OutlineButton>
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        {/* Closing banner. */}
        <div className="@container mt-[clamp(2.5rem,5vw,4rem)]">
          <div
            data-sp="banner"
            className="relative isolate overflow-clip rounded-[1.5rem] bg-[#e0f5d8] [--u:calc(100cqw/1148)] px-6 py-10 sm:px-10 sm:py-12 min-[900px]:u-rounded-28 min-[900px]:u-min-h-309 min-[900px]:u-pl-132 min-[900px]:u-pr-60 min-[900px]:p-0 min-[900px]:flex min-[900px]:items-center"
          >
            {/* Green deepens toward the bottom right; a soft light sits top left. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_75%_130%_at_100%_100%,#7fd56e_0%,rgb(127_213_110/0.55)_38%,rgb(127_213_110/0)_75%),radial-gradient(60%_90%_at_10%_0%,rgb(255_255_255/0.45),transparent_70%)]"
            />
            {/* Soft ring, top right. */}
            <span
              data-sp="arc"
              aria-hidden="true"
              className="pointer-events-none absolute -z-10 box-border rounded-full border-solid border-white/20"
              style={{
                left: 'calc(708 * var(--u))',
                top: 'calc(-96 * var(--u))',
                width: 'calc(312 * var(--u))',
                height: 'calc(312 * var(--u))',
                borderWidth: 'calc(58 * var(--u))',
              }}
            />

            <div className="grid w-full items-center gap-8 min-[900px]:grid-cols-[calc(547*var(--u))_minmax(0,1fr)] min-[900px]:gap-0">
              <p className="text-[clamp(2rem,1.2rem+3.4vw,2.75rem)] leading-[1.08] font-medium tracking-[-0.035em] min-[900px]:u-text-56 min-[900px]:max-w-[calc(520*var(--u))] min-[900px]:text-wrap! [--tf:34px]">
                {COPY.banner.lead}{' '}
                <em className="font-display font-normal tracking-[-0.01em] text-[#7cd16b] italic">
                  {COPY.banner.accent}
                </em>
              </p>
              <div className="max-w-[24rem] min-[900px]:max-w-none">
                <p className="text-[0.875rem] leading-[1.65] text-teal-900/80 min-[900px]:u-w-352 min-[900px]:u-text-14 min-[900px]:text-wrap! [--tf:14px]">
                  {COPY.banner.body}
                </p>
                <CtaButton href="/contact" className="mt-5 min-h-12 min-[900px]:u-mt-22">
                  {COPY.banner.cta}
                </CtaButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}