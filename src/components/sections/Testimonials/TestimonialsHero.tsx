import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'

import { ArrowDown, ArrowRight } from '@/components/sections/Automation/AutomationIcons'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

import { TESTIMONIALS_HERO, type TestimonialsHeroData } from './testimonialsHeroData'
import { createTestimonialsState, TestimonialsHeroScene } from './TestimonialsHeroScene'

/** Design width: one `--u` is 1/1332 of the hero, as in AutomationHero. */
const STAGE_W = 640
const STAGE_H = 460

/** Soft elliptical green glow as a CSS radial gradient (Gaussian falloff). */
function glow(alpha: number, cx: number, cy: number, sx: number, sy: number) {
  const stops = [0, 0.5, 1, 1.5, 2, 2.5, 3].map((k) => {
    const a = alpha * Math.exp(-(k * k) / 2)
    return `rgb(129 216 112 / ${k === 3 ? 0 : a.toFixed(4)}) ${((k / 3) * 100).toFixed(1)}%`
  })
  const u = (n: number) => `calc(${n} * var(--u))`
  return `radial-gradient(ellipse ${u(sx * 3)} ${u(sy * 3)} at ${u(cx)} ${u(cy)}, ${stops.join(', ')})`
}

const CARD_GLOWS = [glow(0.2, 760, 60, 220, 150), glow(0.07, 1000, 420, 140, 90)].join(', ')

/** Faint arch under the cards. */
const CARD_ARCH =
  'radial-gradient(circle calc(520 * var(--u)) at calc(860 * var(--u)) calc(900 * var(--u)), transparent calc(470 * var(--u) - 0.5px), rgb(255 255 255 / 0.035) calc(470 * var(--u)), rgb(255 255 255 / 0.035) calc(500 * var(--u)), transparent calc(500 * var(--u)))'

/**
 * Testimonials page hero: breadcrumb, label, headline with a marker, copy, two actions and a
 * Three.js scene of floating review cards.
 *
 * Layout: same recipe as AutomationHero. From `lg` it is a 1332px design scaled as a unit
 * (`--u`); below `lg` it recomposes to one column: copy, then the scene, whose aspect ratio
 * is fixed so the canvas never distorts.
 *
 * Motion (GSAP): one entrance timeline (masked headline lines, marker draw, copy, actions,
 * scene fade), a slight scroll parallax on the stage, and pointer tilt in the scene (mouse and
 * pen only). Reduced motion shows the finished layout and a still scene.
 */
export function TestimonialsHero({ data = TESTIMONIALS_HERO }: { data?: TestimonialsHeroData }) {
  const root = useRef<HTMLElement>(null)
  const state = useMemo(createTestimonialsState, [])
  const motion = !useMediaQuery('(prefers-reduced-motion: reduce)')

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const q = (s: string) => el.querySelector<HTMLElement>(s)
      const all = (s: string) => gsap.utils.toArray<HTMLElement>(el.querySelectorAll(s))

      const crumbs = q('[data-th="crumbs"]')
      const label = q('[data-th="label"]')
      const lines = all('[data-th="line"]')
      const accent = q('[data-th="accent"]')
      const body = q('[data-th="body"]')
      const actions = all('[data-th="action"]')
      const card = q('[data-th="card"]')
      const stage = q('[data-th="stage"]')

      const mm = gsap.matchMedia(el)

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set([crumbs, label, body, ...actions], { autoAlpha: 0, y: 18 })
        gsap.set(lines, { yPercent: 110 })
        if (accent) gsap.set(accent, { '--mk': 0 })
        gsap.set(stage, { autoAlpha: 0 })

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
        tl.to([crumbs, label], { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0)
        tl.to(lines, { yPercent: 0, duration: 0.85, stagger: 0.11 }, 0.15)
        if (accent) tl.to(accent, { '--mk': 1, duration: 0.75, ease: 'power2.inOut' }, 0.8)
        tl.to(body, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.55)
        tl.to(actions, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0.7)
        tl.to(stage, { autoAlpha: 1, duration: 0.6 }, 0.2)

        // Stage drifts up slightly against the card.
        if (stage) {
          gsap.to(stage, {
            yPercent: -4,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
          })
        }

        const onMove = (e: PointerEvent) => {
          if (e.pointerType === 'touch' || !card) return
          const r = card.getBoundingClientRect()
          state.px = gsap.utils.clamp(-1, 1, ((e.clientX - r.left) / r.width) * 2 - 1)
          state.py = gsap.utils.clamp(-1, 1, ((e.clientY - r.top) / r.height) * 2 - 1)
          state.on = 1
        }
        const onLeave = () => {
          state.on = 0
        }
        card?.addEventListener('pointermove', onMove)
        card?.addEventListener('pointerleave', onLeave)

        return () => {
          card?.removeEventListener('pointermove', onMove)
          card?.removeEventListener('pointerleave', onLeave)
          state.on = 0
          ScrollTrigger.refresh()
        }
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="testimonials-hero-title"
      className="relative isolate -mt-(--header-content-clearance) overflow-clip bg-white px-(--gutter) pt-[calc(var(--header-content-clearance)+1.5rem)] pb-[clamp(2.5rem,5vw,6rem)] [--gutter:clamp(1rem,0.32rem+2.86vw,5rem)]"
    >
      {/* Page canvas: pale green wash and the shared technical grid. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(46%_62%_at_0%_26%,rgb(129_216_112/0.17),transparent_72%),radial-gradient(40%_52%_at_90%_6%,rgb(129_216_112/0.12),transparent_72%),linear-gradient(180deg,#fdfefd_0%,#f7fbf6_62%,#fff_100%)] before:absolute before:inset-0 before:bg-[linear-gradient(rgb(3_23_29/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(3_23_29/0.05)_1px,transparent_1px)] before:bg-[length:40px_40px] before:content-['']"
      />

      <div className="@container mx-auto w-full max-w-[1332px]">
        <div className="[--u:calc(100cqw/1332)]">
          <div
            data-th="card"
            className="lg:u-rounded-32 lg:u-min-h-610 relative isolate overflow-clip rounded-[1.5rem] bg-teal-900 text-white"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
              style={{ backgroundImage: `${CARD_ARCH}, ${CARD_GLOWS}` }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 lg:hidden"
              style={{
                backgroundImage:
                  'radial-gradient(70% 38% at 70% 62%, rgb(129 216 112 / 0.17), transparent 100%), radial-gradient(60% 30% at 20% 12%, rgb(129 216 112 / 0.11), transparent 100%)',
              }}
            />

            <div className="relative z-10 pt-8 pr-6 pb-2 pl-6 sm:pt-10 sm:pr-10 sm:pl-10 lg:u-pl-66 lg:u-pt-93 lg:max-w-[calc(600*var(--u))] lg:pr-0 lg:pb-0">
              <nav aria-label="Breadcrumb" data-th="crumbs">
                <ol className="m-0 flex list-none flex-wrap items-center gap-3 p-0 text-[0.8125rem] leading-4 font-medium lg:u-gap-10.5 lg:u-text-[13.6] lg:u-leading-16 [--tf:13px]">
                  <li>
                    <Link
                      to="/"
                      className="-my-3.5 inline-block py-3.5 text-green-500 no-underline transition-colors duration-200 hover:text-green-300"
                    >
                      Home
                    </Link>
                  </li>
                  <li
                    aria-current="page"
                    className="inline-flex items-center gap-3 text-white before:size-1.5 before:-mr-1 before:rotate-45 before:border-t-[1.5px] before:border-r-[1.5px] before:border-white/50 before:content-[''] lg:u-gap-18.5"
                  >
                    {data.crumb}
                  </li>
                </ol>
              </nav>

              <p
                data-th="label"
                className="mt-8 flex items-center gap-2.5 text-[0.875rem] leading-[18px] font-medium lg:u-mt-51 lg:u-text-[13.6] lg:u-leading-18 [--tf:13px]"
              >
                <span className="size-2 rounded-[1px] bg-green-500 lg:u-size-8" aria-hidden="true" />
                {data.label}
              </p>

              <h1
                id="testimonials-hero-title"
                className="font-display mt-5 text-[clamp(2.5rem,11vw,3.75rem)] leading-[1.13] font-normal tracking-[-0.005em] lg:u-mt-22.5 lg:u-text-64 lg:u-leading-68 [--tf:38px]"
              >
                <span className="-mx-[0.1em] -mb-[0.2em] block overflow-clip px-[0.1em] pb-[0.2em]">
                  <span data-th="line" className="block">
                    {data.line}
                  </span>
                </span>
                <span className="-mx-[0.1em] -mb-[0.2em] block overflow-clip px-[0.1em] pb-[0.2em]">
                  <span data-th="line" className="block">
                    <em
                      data-th="accent"
                      className="relative z-0 inline-block px-[0.09em] italic [--mk:1] after:absolute after:inset-x-0 after:bottom-[-0.085em] after:-z-10 after:h-[0.3125em] after:origin-left after:scale-x-(--mk) after:bg-green-500 after:content-['']"
                    >
                      {data.accent}
                    </em>
                  </span>
                </span>
              </h1>

              {/* white/65 on teal-900 passes AA; the brand grey #647174 does not at this size. */}
              <p
                data-th="body"
                className="mt-6 max-w-[32.5rem] text-[1rem] leading-[1.65] font-medium text-white/65 lg:text-wrap! lg:u-mt-24 lg:u-text-18 lg:u-leading-[29.7] lg:max-w-[calc(520*var(--u))] [--tf:15px]"
              >
                {data.body}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-[1.125rem] gap-y-4 lg:u-mt-26.5 lg:u-gap-18">
                <a
                  href={data.primary.href}
                  data-th="action"
                  className="group inline-flex h-12 min-h-11 items-center gap-2 rounded-full bg-green-500 pr-[1.4375rem] pl-[1.5625rem] text-[0.9375rem] leading-none font-semibold text-teal-900 no-underline transition-[background-color,transform] duration-200 ease-out hover:-translate-y-px hover:bg-green-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:u-h-53 lg:u-text-[15.5] lg:pr-[calc(23*var(--u))] lg:pl-[calc(25*var(--u))] lg:u-gap-8 [--tf:14px]"
                >
                  {data.primary.label}
                  <ArrowRight className="size-[22px] flex-none transition-transform duration-200 ease-out group-hover:translate-x-[3px]" />
                </a>
                <Link
                  to={data.secondary.to}
                  data-th="action"
                  className="group relative inline-flex items-center gap-2.5 border-b border-green-500 pt-1 pb-1.5 text-[0.9375rem] leading-[18px] font-medium text-white no-underline transition-[border-color,color] duration-200 ease-out after:absolute after:inset-x-0 after:-inset-y-3 after:content-[''] hover:border-green-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-500 lg:u-text-[15.5] lg:u-gap-8 [--tf:14px]"
                >
                  {data.secondary.label}
                  <ArrowDown className="size-[18px] flex-none transition-transform duration-200 ease-out group-hover:translate-y-[3px]" />
                </Link>
              </div>
            </div>

            <div className="relative z-0 mt-6 px-4 pb-8 sm:px-8 lg:absolute lg:u-top-70 lg:u-left-640 lg:u-w-640 lg:mt-0 lg:p-0">
              <div
                role="img"
                aria-label={data.illustrationLabel}
                data-th="stage"
                className="relative mx-auto w-full max-w-[640px]"
                style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }}
              >
                <TestimonialsHeroScene state={state} motion={motion} className="absolute inset-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
