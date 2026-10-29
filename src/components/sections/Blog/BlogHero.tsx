import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'

import { useContactOverlay } from '@/components/sections/contact/ContactOverlayContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

import { BLOG_HERO, type BlogHeroData } from './blogHeroData'
import { createBlogSceneState } from './BlogOrbitScene'
import { BlogStage } from './BlogStage'

/** Width of the design the hero was measured from. One `--u` is 1/1332 of the card width. */
const DESIGN_W = 1332

/** Soft green light at the top of the card, behind the illustration. */
const CARD_GLOW =
  'radial-gradient(ellipse calc(440 * var(--u)) calc(300 * var(--u)) at calc(670 * var(--u)) calc(10 * var(--u)), rgb(129 216 112 / 0.26), rgb(129 216 112 / 0.1) 45%, transparent 100%)'

/** The big dark arc under the illustration: two faint bands, top at about y 470. */
const CARD_ARC =
  'radial-gradient(circle calc(400 * var(--u)) at calc(758 * var(--u)) calc(840 * var(--u)), transparent calc(340 * var(--u) - 0.5px), rgb(255 255 255 / 0.035) calc(340 * var(--u)), rgb(255 255 255 / 0.035) calc(370 * var(--u)), rgb(255 255 255 / 0.02) calc(370 * var(--u)), rgb(255 255 255 / 0.02) calc(399.5 * var(--u)), transparent calc(400 * var(--u)))'

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}
function ArrowDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v16M6 14l6 6 6-6" />
    </svg>
  )
}

/**
 * Hero of the Blog page: breadcrumb, label, headline with a marker, copy, two actions, and the
 * dashboard illustration over a Three.js orbit.
 *
 * Layout: a dark card on the page canvas, built like the Automation hero. From `lg` it is the
 * 1920px design scaled as a unit (`--u` = 1/1332 of the card). Below `lg` it is one column:
 * copy, then the illustration, which scales with its own width.
 *
 * Motion (GSAP): one entrance timeline (headline masks, marker draw, cards popping in, orbit
 * fading up), slow idle floats only while on screen, pointer depth on every card and a small
 * parallax on the orbit. Reduced motion shows the finished layout and a still scene.
 */
export function BlogHero({ data = BLOG_HERO }: { data?: BlogHeroData }) {
  const root = useRef<HTMLElement>(null)
  const scene = useMemo(createBlogSceneState, [])
  const motion = !useMediaQuery('(prefers-reduced-motion: reduce)')
  const contact = useContactOverlay()

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const q = <T extends Element = HTMLElement>(s: string) => el.querySelector<T>(s)
      const all = <T extends Element = HTMLElement>(s: string) => gsap.utils.toArray<T>(el.querySelectorAll(s))

      const crumbs = q('[data-bh="crumbs"]')
      const label = q('[data-bh="label"]')
      const lines = all('[data-bh="line"]')
      const accent = q('[data-bh="accent"]')
      const body = q('[data-bh="body"]')
      const actions = all('[data-bh="action"]')
      const card = q('[data-bh="hero-card"]')
      const stage = q('[data-bh="stage"]')
      const cards = all('[data-bh="card"]')
      const depths = all('[data-bh="depth"]')
      const floats = all('[data-bh="float"]')
      const spark = q('[data-bh="spark"]')

      const mm = gsap.matchMedia(el)

      mm.add('(prefers-reduced-motion: reduce)', () => {
        scene.intro = 1
        scene.invalidate?.()
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set([crumbs, label, body, ...actions], { autoAlpha: 0, y: 18 })
        gsap.set(lines, { yPercent: 110 })
        if (accent) gsap.set(accent, { '--mk': 0 })
        gsap.set(cards, { autoAlpha: 0, y: 28, scale: 0.9, transformOrigin: '50% 100%' })
        gsap.set(spark, { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 100%' })
        scene.intro = 0

        let visible = true

        // Idle: slow float, only while the hero is on screen.
        const idle = gsap.timeline({ paused: true })
        floats.forEach((f, i) => {
          idle.to(
            f,
            { y: i % 2 ? 6 : -6, duration: 3.4 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1 },
            i * 0.3,
          )
        })

        // Entrance.
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
        tl.to([crumbs, label], { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0)
        tl.to(lines, { yPercent: 0, duration: 0.85, stagger: 0.11 }, 0.15)
        if (accent) tl.to(accent, { '--mk': 1, duration: 0.75, ease: 'power2.inOut' }, 0.85)
        tl.to(body, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.6)
        tl.to(actions, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0.75)
        tl.to(scene, { intro: 1, duration: 1.4, ease: 'power2.out', onUpdate: () => scene.invalidate?.() }, 0.3)
        tl.to(cards, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.09, ease: 'back.out(1.5)' }, 0.5)
        tl.to(spark, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, 1.2)
        tl.call(() => {
          if (visible) idle.play()
        })

        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            visible = self.isActive
            if (!tl.isActive() && tl.progress() === 1) idle.paused(!visible)
          },
        })

        // Scroll: the illustration drifts up a little against the card.
        if (stage) {
          gsap.to(stage, {
            yPercent: -4,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
          })
        }

        // Pointer: cards at different depths, the orbit tilts. Mouse and pen only.
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
            scene.px = gsap.utils.clamp(-1, 1, nx)
            scene.py = gsap.utils.clamp(-1, 1, ny)
            scene.invalidate?.()
            const k = r.width / DESIGN_W
            for (const m of move) {
              m.x(-nx * m.depth * 0.6 * k)
              m.y(-ny * m.depth * 0.4 * k)
            }
          }
          const onLeave = () => {
            scene.px = 0
            scene.py = 0
            scene.invalidate?.()
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
          teardown()
          scene.px = 0
          scene.py = 0
        }
      })
    },
    { scope: root },
  )

  const mask = '-mx-[0.1em] -mb-[0.2em] block overflow-clip px-[0.1em] pb-[0.2em]'

  return (
    <section
      ref={root}
      aria-labelledby="blog-hero-title"
      className="relative isolate -mt-(--header-content-clearance) overflow-clip bg-white px-(--gutter) pt-[calc(var(--header-content-clearance)+1.5rem)] pb-[clamp(2.5rem,5vw,6rem)] [--gutter:clamp(1rem,0.32rem+2.86vw,5rem)]"
    >
      {/* Page canvas: pale green wash, as on the other heroes. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(46%_62%_at_0%_26%,rgb(129_216_112/0.2),transparent_72%),radial-gradient(40%_52%_at_92%_30%,rgb(129_216_112/0.22),transparent_72%),linear-gradient(180deg,#fdfefd_0%,#f7fbf6_62%,#fff_100%)]"
      />

      <div className="@container mx-auto w-full max-w-[1332px]">
        <div className="[--u:calc(100cqw/1332)]">
          <div
            data-bh="hero-card"
            className="lg:u-rounded-32 lg:u-min-h-606 relative isolate overflow-clip rounded-[1.5rem] bg-teal-900 text-white"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
              style={{ backgroundImage: `${CARD_ARC}, ${CARD_GLOW}` }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 lg:hidden"
              style={{
                backgroundImage:
                  'radial-gradient(70% 36% at 60% 58%, rgb(129 216 112 / 0.2), transparent 100%), radial-gradient(60% 24% at 20% 8%, rgb(129 216 112 / 0.1), transparent 100%)',
              }}
            />

            <div className="relative z-10 pt-8 pr-6 pb-2 pl-6 sm:pt-10 sm:pr-10 sm:pl-10 lg:u-pl-65 lg:u-pt-90 lg:max-w-[calc(640*var(--u))] lg:pr-0 lg:pb-0">
              <nav aria-label="Breadcrumb" data-bh="crumbs">
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
                    className="inline-flex items-center gap-3 text-white before:-mr-1 before:size-1.5 before:rotate-45 before:border-t-[1.5px] before:border-r-[1.5px] before:border-white/50 before:content-[''] lg:u-gap-18.5"
                  >
                    {data.crumb}
                  </li>
                </ol>
              </nav>

              <p
                data-bh="label"
                className="mt-8 flex items-center gap-2.5 text-[0.875rem] leading-[18px] font-medium lg:u-mt-52 lg:u-text-[13.6] lg:u-leading-18 [--tf:13px]"
              >
                <span className="size-2 rounded-[1px] bg-green-500 lg:u-size-8" aria-hidden="true" />
                {data.label}
              </p>

              <h1
                id="blog-hero-title"
                className="font-display mt-4 text-[clamp(2.5rem,11vw,3.75rem)] leading-[1.13] font-normal tracking-[-0.005em] lg:u-mt-12 lg:u-text-64 lg:u-leading-88 [--tf:38px]"
              >
               <span className={mask}>
  <span data-bh="line" className="block lg:whitespace-nowrap">
    {data.line}
  </span>
</span>
                <span className={mask}>
                  <span data-bh="line" className="block">
                    <em
                      data-bh="accent"
                      className="relative z-0 inline-block pr-[0.09em] italic [--mk:1] after:absolute after:inset-x-0 after:bottom-[-0.085em] after:-z-10 after:h-[0.3125em] after:origin-left after:scale-x-(--mk) after:bg-green-500 after:content-['']"
                    >
                      {data.accent}
                    </em>
                  </span>
                </span>
              </h1>

              <p
                data-bh="body"
                className="mt-6 max-w-[32.5rem] text-[1rem] leading-[1.65] font-medium text-white/55 lg:text-wrap! lg:u-mt-6 lg:u-text-18 lg:u-leading-[29.7] lg:max-w-[calc(520*var(--u))] [--tf:15px]"
              >
                {data.body}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-[1.125rem] gap-y-4 lg:u-mt-31 lg:u-gap-18">
                <a
                  href={data.primary.href}
                  data-bh="action"
                  className="group inline-flex h-12 min-h-11 items-center gap-2 rounded-full bg-green-500 pr-[1.4375rem] pl-[1.5625rem] text-[0.9375rem] leading-none font-semibold text-teal-900 no-underline transition-[background-color,transform] duration-200 ease-out hover:-translate-y-px hover:bg-green-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:u-h-55 lg:u-text-[15.5] lg:u-gap-8 lg:pr-[calc(23*var(--u))] lg:pl-[calc(25*var(--u))] [--tf:14px]"
                >
                  {data.primary.label}
                  <ArrowRight className="size-[20px] flex-none transition-transform duration-200 ease-out group-hover:translate-x-[3px]" />
                </a>
                <a
                  href="/contact"
                  data-bh="action"
                  onClick={(e) => {
                    if (!contact.available || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                    e.preventDefault()
                    contact.open()
                  }}
                  className="group relative inline-flex items-center gap-2.5 border-b border-white/80 pt-1 pb-1.5 text-[0.9375rem] leading-[18px] font-medium text-white no-underline transition-[border-color,color] duration-200 ease-out after:absolute after:inset-x-0 after:-inset-y-3 after:content-[''] hover:border-green-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-500 lg:u-text-[15.5] lg:u-gap-8 [--tf:14px]"
                >
                  {data.secondary.label}
                  <ArrowDown className="size-[16px] flex-none transition-transform duration-200 ease-out group-hover:translate-y-[3px]" />
                </a>
              </div>
            </div>

            <div className="relative z-0 mt-6 px-4 pb-8 sm:px-8 lg:absolute lg:u-top-130 lg:u-left-700 lg:u-w-560 lg:mt-0 lg:p-0">
              <BlogStage state={scene} motion={motion} label={data.illustrationLabel} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}