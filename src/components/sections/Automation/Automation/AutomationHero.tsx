import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

import { ArrowDown, ArrowRight } from './AutomationIcons'
import { AutomationOutcomes } from './AutomationOutcomes'
import { AutomationStage } from './AutomationStage'
import { createRobotState } from './AutomationHeroScene'
import { AUTOMATION_HERO, type AutomationHeroData } from './automationHeroData'

/** Width of the design the hero was measured from, in px. One `--u` is 1/1332 of the hero width. */
const DESIGN_W = 1332

/**
 * A soft elliptical glow, as a CSS radial gradient. The falloff is a Gaussian, so it matches
 * the blobs fitted to the design, instead of the straight line a two-stop gradient gives.
 * Centre and sigma are in design px; alpha is the peak opacity of the green.
 */
function glow(alpha: number, cx: number, cy: number, sx: number, sy: number) {
  const stops = [0, 0.5, 1, 1.5, 2, 2.5, 3].map((k) => {
    const a = alpha * Math.exp(-(k * k) / 2)
    return `rgb(129 216 112 / ${k === 3 ? 0 : a.toFixed(4)}) ${((k / 3) * 100).toFixed(1)}%`
  })
  const u = (n: number) => `calc(${n} * var(--u))`
  return `radial-gradient(ellipse ${u(sx * 3)} ${u(sy * 3)} at ${u(cx)} ${u(cy)}, ${stops.join(', ')})`
}

const CARD_GLOWS = [
  glow(0.125, 927, 258, 121, 175),
  glow(0.179, 716, 161, 140, 129),
  glow(0.042, 1283, 647, 41, 71),
].join(', ')

/** The big arch under the robot: two bands of green, the inner one stronger. */
const CARD_ARCH =
  'radial-gradient(circle calc(620 * var(--u)) at calc(820 * var(--u)) calc(1030 * var(--u)), transparent calc(560 * var(--u) - 0.5px), rgb(129 216 112 / 0.045) calc(560 * var(--u)), rgb(129 216 112 / 0.045) calc(590 * var(--u)), rgb(129 216 112 / 0.025) calc(590 * var(--u)), rgb(129 216 112 / 0.025) calc(619.5 * var(--u)), transparent calc(620 * var(--u)))'

/**
 * Hero of the Automation & AI service page: breadcrumb, headline with a marker, copy, two
 * actions, the 3D assistant with its status cards, and the outcomes strip.
 *
 * Layout: a dark card on the page canvas. From `lg` it is the 1920px design scaled as a unit
 * (`--u` is one design pixel, so at 1332px wide it is pixel for pixel the design, and every
 * size and gap in between follows the width; body text keeps a readable floor). Below `lg`
 * the card recomposes into one column: copy, then the robot stage, then the strip.
 *
 * Motion (GSAP): one entrance timeline (headline masks, marker draw, the card and rings and
 * lines arriving, the robot waking), then slow idle floats that only run while the hero is
 * on screen. A mouse moves the cards at different depths and makes the robot look at it.
 * Reduced motion gets the finished layout and a still robot.
 *
 * Three.js: AutomationHeroScene draws the robot; this file only feeds it `state`.
 */
export function AutomationHero({ data = AUTOMATION_HERO }: { data?: AutomationHeroData }) {
  const root = useRef<HTMLElement>(null)
  const robot = useMemo(createRobotState, [])
  const motion = !useMediaQuery('(prefers-reduced-motion: reduce)')

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const q = <T extends Element = HTMLElement>(sel: string) => el.querySelector<T>(sel)
      const all = <T extends Element = HTMLElement>(sel: string) =>
        gsap.utils.toArray<T>(el.querySelectorAll(sel))

      const crumbs = q('[data-ah="crumbs"]')
      const label = q('[data-ah="label"]')
      const lines = all('[data-ah="line"]')
      const accent = q('[data-ah="accent"]')
      const body = q('[data-ah="body"]')
      const actions = all('[data-ah="action"]')
      const assurance = q('[data-ah="assurance"]')

      const card = q('[data-ah="card"]')
      const stage = q('[data-ah="stage"]')
      const rings = all<SVGGeometryElement>('[data-ah="ring"]')
      const pad = q('[data-ah="pad"]')
      const depths = all('[data-ah="depth"]')
      const floats = all('[data-ah="float"]')
      const signals = all('[data-ah="signal"]')
      const core = q('[data-ah="core"]')
      const strip = q('[data-ah="strip"]')
      const outcomes = all('[data-ah="outcome"]')

      const connectors = all<SVGGeometryElement>('[data-ah="signal-line"]')

      const mm = gsap.matchMedia(el)

      mm.add('(prefers-reduced-motion: reduce)', () => {
        // Everything stays in its finished state. The scene draws one still frame.
        robot.intro = 1
        robot.wake?.()
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // ---- start state ----
        gsap.set([crumbs, label, body, assurance, ...actions], { autoAlpha: 0, y: 18 })
        gsap.set(lines, { yPercent: 110 })
        if (accent) gsap.set(accent, { '--mk': 0 })
        gsap.set(rings, { strokeDasharray: 1, strokeDashoffset: 1 })
        gsap.set(connectors, { strokeDasharray: 1, strokeDashoffset: 1 })
        gsap.set(signals, { autoAlpha: 0, y: 26, scale: 0.9, transformOrigin: '50% 100%' })
        gsap.set([core, pad], { autoAlpha: 0 })
        gsap.set(outcomes, { autoAlpha: 0, y: 18 })
        if (strip) gsap.set(strip, { autoAlpha: 0, y: 24 })
        robot.intro = 0

        let visible = true

        // ---- idle: floats, kept in step so the glow under the robot follows it ----
        const idle = gsap.timeline({ paused: true })
        idle.fromTo(
          robot,
          { float: -1 },
          {
            float: 1,
            duration: 3.2,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            onUpdate: () => robot.wake?.(),
          },
          0,
        )
        if (pad) {
          idle.fromTo(
            pad,
            { scaleX: 1, opacity: 1 },
            { scaleX: 0.86, opacity: 0.6, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 },
            0,
          )
        }
        floats.forEach((f, i) => {
          idle.to(
            f,
            {
              y: i % 2 ? 7 : -7,
              duration: 3.6 + i * 0.7,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            },
            i * 0.4,
          )
        })

        // ---- entrance ----
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
        tl.to([crumbs, label], { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0)
        tl.to(lines, { yPercent: 0, duration: 0.85, stagger: 0.11 }, 0.15)
        if (accent) tl.to(accent, { '--mk': 1, duration: 0.75, ease: 'power2.inOut' }, 0.85)
        tl.to(body, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.6)
        tl.to(actions, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0.75)
        tl.to(assurance, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.95)

        tl.to(rings, { strokeDashoffset: 0, duration: 1.6, stagger: 0.15, ease: 'power2.inOut' }, 0.3)
        tl.to(robot, { intro: 1, duration: 1.3, ease: 'power2.out', onUpdate: () => robot.wake?.() }, 0.35)
        tl.to(pad, { autoAlpha: 1, duration: 0.9 }, 0.7)
        tl.to(
          signals,
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.18, ease: 'back.out(1.6)' },
          0.8,
        )
        tl.to(connectors, { strokeDashoffset: 0, duration: 0.9, stagger: 0.12, ease: 'power2.out' }, 1.1)
        tl.to(core, { autoAlpha: 1, duration: 0.7 }, 1.4)

        tl.call(() => {
          if (visible) idle.play()
        })

        // The strip is below the card: it arrives as it scrolls into view.
        const reveal = strip
          ? ScrollTrigger.create({
              trigger: strip,
              start: 'top 94%',
              once: true,
              onEnter: () => {
                gsap.to(strip, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' })
                gsap.to(outcomes, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.6,
                  stagger: 0.09,
                  delay: 0.15,
                  ease: 'power3.out',
                })
              },
            })
          : null

        // ---- idle only while the hero is on screen ----
        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            visible = self.isActive
            if (!tl.isActive() && tl.progress() === 1) idle.paused(!visible)
          },
        })

        // ---- scroll parallax: the stage drifts up slightly against the card ----
        if (stage) {
          gsap.to(stage, {
            yPercent: -4,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
          })
        }

        // ---- pointer: cards at different depths, robot looks toward it ----
        let teardown = () => {}
        if (card) {
          const move = depths.map((d) => ({
            x: gsap.quickTo(d, 'x', { duration: 0.9, ease: 'power3.out' }),
            y: gsap.quickTo(d, 'y', { duration: 0.9, ease: 'power3.out' }),
            depth: Number(d.dataset.depth ?? 0),
          }))
          const onMove = (e: PointerEvent) => {
            if (e.pointerType === 'touch') return
            const r = card.getBoundingClientRect()
            const nx = ((e.clientX - r.left) / r.width - 0.5) * 2
            const ny = ((e.clientY - r.top) / r.height - 0.5) * 2
            robot.px = gsap.utils.clamp(-1, 1, nx)
            robot.py = gsap.utils.clamp(-1, 1, ny)
            robot.wake?.()
            // Scale by the card, so the drift is the same share of the layout at any width.
            const k = r.width / DESIGN_W
            for (const m of move) {
              m.x(-nx * m.depth * k)
              m.y(-ny * m.depth * 0.6 * k)
            }
          }
          const onLeave = () => {
            robot.px = 0
            robot.py = 0
            robot.wake?.()
            for (const m of move) {
              m.x(0)
              m.y(0)
            }
          }
          card.addEventListener('pointermove', onMove)
          card.addEventListener('pointerleave', onLeave)
          teardown = () => {
            card.removeEventListener('pointermove', onMove)
            card.removeEventListener('pointerleave', onLeave)
          }
        }

        return () => {
          st.kill()
          reveal?.kill()
          teardown()
          robot.px = 0
          robot.py = 0
        }
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="automation-hero-title"
      className="relative isolate -mt-(--header-content-clearance) overflow-clip bg-white px-(--gutter) pt-[calc(var(--header-content-clearance)+1.5rem)] pb-[clamp(2.5rem,5vw,6rem)] [--gutter:clamp(1rem,0.32rem+2.86vw,5rem)]"
    >
      {/* Page canvas: pale green wash and the same technical grid as the other service heroes. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(46%_62%_at_0%_26%,rgb(129_216_112/0.17),transparent_72%),radial-gradient(40%_52%_at_90%_6%,rgb(129_216_112/0.12),transparent_72%),linear-gradient(180deg,#fdfefd_0%,#f7fbf6_62%,#fff_100%)] before:absolute before:inset-0 before:bg-[linear-gradient(rgb(3_23_29/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(3_23_29/0.05)_1px,transparent_1px)] before:bg-[length:40px_40px] before:content-['']"
      />

      <div className="@container mx-auto w-full max-w-[1332px]">
        <div className="[--u:calc(100cqw/1332)]">
          <div
            data-ah="card"
            className="lg:u-rounded-32 lg:u-min-h-752 relative isolate overflow-clip rounded-[1.5rem] bg-teal-900 text-white"
          >
            {/* Card background: green light behind the robot, and the arch under it. */}
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

            <div className="relative z-10 pt-8 pr-6 pb-2 pl-6 sm:pt-10 sm:pr-10 sm:pl-10 lg:u-pl-66 lg:u-pt-93 lg:max-w-[calc(580*var(--u))] lg:pr-0 lg:pb-0">
              <nav aria-label="Breadcrumb" data-ah="crumbs">
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
                data-ah="label"
                className="mt-8 flex items-center gap-2.5 text-[0.875rem] leading-[18px] font-medium lg:u-mt-51 lg:u-text-[13.6] lg:u-leading-18 [--tf:13px]"
              >
                <span className="size-2 rounded-[1px] bg-green-500 lg:u-size-8" aria-hidden="true" />
                {data.label}
              </p>

              <h1
                id="automation-hero-title"
                className="font-display mt-5 text-[clamp(2.5rem,11vw,3.75rem)] leading-[1.13] font-normal tracking-[-0.005em] lg:u-mt-22.5 lg:u-text-64 lg:u-leading-68 [--tf:38px]"
              >
                {data.lines.map((line) => (
                  <span key={line} className="-mx-[0.1em] -mb-[0.2em] block overflow-clip px-[0.1em] pb-[0.2em]">
                    <span data-ah="line" className="block">
                      {line}
                    </span>
                  </span>
                ))}
                <span className="-mx-[0.1em] -mb-[0.2em] block overflow-clip px-[0.1em] pb-[0.2em]">
                  <span data-ah="line" className="block">
                    <em
                      data-ah="accent"
                      className="relative z-0 inline-block px-[0.09em] italic [--mk:1] after:absolute after:inset-x-0 after:bottom-[-0.085em] after:-z-10 after:h-[0.3125em] after:origin-left after:scale-x-(--mk) after:bg-green-500 after:content-['']"
                    >
                      {data.accent}
                    </em>
                  </span>
                </span>
              </h1>

              <p
                data-ah="body"
                className="mt-6 max-w-[32.5rem] text-[1rem] leading-[1.65] font-medium text-[#647174] lg:text-wrap! lg:u-mt-24 lg:u-text-18 lg:u-leading-[29.7] lg:max-w-[calc(520*var(--u))] [--tf:15px]"
              >
                {data.body}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-[1.125rem] gap-y-4 lg:u-mt-26.5 lg:u-gap-18">
                <Link
                  to={data.primary.to}
                  data-ah="action"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-green-500 pr-[1.4375rem] pl-[1.5625rem] text-[0.9375rem] leading-none font-semibold text-teal-900 no-underline transition-[background-color,transform] duration-200 ease-out hover:-translate-y-px hover:bg-green-300 lg:u-h-53 lg:u-text-[15.5] [--tf:14px] lg:pr-[calc(23*var(--u))] lg:pl-[calc(25*var(--u))] lg:u-gap-8 min-h-11"
                >
                  {data.primary.label}
                  <ArrowRight className="size-[22px] flex-none transition-transform duration-200 ease-out group-hover:translate-x-[3px]" />
                </Link>
                <a
                  href={data.secondary.href}
                  data-ah="action"
                  className="group relative inline-flex items-center gap-2.5 border-b border-green-500 pt-1 pb-1.5 after:absolute after:inset-x-0 after:-inset-y-3 after:content-[''] text-[0.9375rem] leading-[18px] font-medium text-white no-underline transition-[border-color,color] duration-200 ease-out hover:border-green-300 lg:u-text-[15.5] lg:u-gap-8 [--tf:14px]"
                >
                  {data.secondary.label}
                  <ArrowDown className="size-[18px] flex-none transition-transform duration-200 ease-out group-hover:translate-y-[3px]" />
                </a>
              </div>

              <div
                data-ah="assurance"
                className="mt-8 flex items-center gap-3 lg:u-mt-44.5 lg:u-gap-12"
              >
                <span className="flex" aria-hidden="true">
                  <span className="size-[22px] rounded-full bg-[linear-gradient(180deg,#cabf8f,#99a075)] lg:u-size-22.5" />
                  <span className="-ml-1 size-[22px] rounded-full bg-[linear-gradient(180deg,#a7bd97,#749173)] ring-2 ring-teal-900 lg:u-size-22.5 lg:-ml-[calc(4.2*var(--u))]" />
                  <span className="-ml-1 size-[22px] rounded-full bg-[linear-gradient(180deg,#a1b993,#708d70)] ring-2 ring-teal-900 lg:u-size-22.5 lg:-ml-[calc(4.2*var(--u))]" />
                </span>
                <p className="text-[0.75rem] leading-4 font-normal text-[#657770] lg:u-text-[10.25] lg:u-leading-14 [--tf:10px]">
                  {data.assurance}
                </p>
              </div>
            </div>

            <div className="relative z-0 mt-6 px-4 pb-8 sm:px-8 lg:absolute lg:u-top-150 lg:u-left-575 lg:u-w-700 lg:mt-0 lg:p-0">
              <AutomationStage data={data} state={robot} motion={motion} />
            </div>
          </div>

          <div className="mt-5 lg:u-mt-60">
            <AutomationOutcomes outcomes={data.outcomes} />
          </div>
        </div>
      </div>
    </section>
  )
}
