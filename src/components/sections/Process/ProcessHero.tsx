import { useRef } from 'react'
import { Link } from 'react-router-dom'

import heroImg from '@/assets/images/process-hero.jpg'
import { gsap, useGSAP } from '@/lib/motion'

const LINES = ['A digital growth', 'process built', 'around'] as const
const ACCENT = 'clear decisions.'
const LEAD =
  'From discovery and strategy to design, development and continuous improvement, we make each step purposeful, collaborative and focused on your business goals.'
const WORDS = LEAD.split(' ')

/** Each line / word sits in a clip so the text rises out of it instead of fading. */
const MASK = '-mx-[0.1em] -mb-[0.2em] block overflow-clip px-[0.1em] pb-[0.2em]'

/**
 * How it works page hero.
 *
 * Layout: 1920 design is 721px tall with the header (90px) above it. The section pulls
 * itself up under the page's header clearance so it starts exactly at the header's bottom
 * edge, then grows with its content on small screens (min-height scales with width).
 * The copy uses the shared `container-page` frame so it lines up with every other section.
 * On desktop the copy block sits high in the frame (75px from the top, as in the design)
 * rather than centred; below lg it is centred with even padding.
 *
 * Motion (GSAP, plays once on load): the photo settles from a slight zoom, breadcrumb and
 * label fade up, headline lines rise out of their masks, the green marker draws under
 * "clear decisions.", then the paragraph reveals word by word. On scroll the photo drifts
 * slower than the page for depth. Reduced motion renders the finished hero, no tweens.
 */
export function ProcessHero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const all = <T extends Element = HTMLElement>(sel: string) =>
        gsap.utils.toArray<T>(el.querySelectorAll(sel))
      const one = <T extends Element = HTMLElement>(sel: string) => el.querySelector<T>(sel)

      const bg = one('[data-ph="bg"]')
      const img = one('[data-ph="img"]')
      const crumbs = one('[data-ph="crumbs"]')
      const label = one('[data-ph="label"]')
      const lines = all('[data-ph="line"]')
      const accent = one('[data-ph="accent"]')
      const words = all('[data-ph="word"]')

      const mm = gsap.matchMedia(el)
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(img, { scale: 1.12 })
        gsap.set([crumbs, label], { autoAlpha: 0, y: 16 })
        gsap.set(lines, { yPercent: 110 })
        gsap.set(words, { yPercent: 110 })
        if (accent) gsap.set(accent, { '--mk': 0 })

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
        tl.to(img, { scale: 1, duration: 2.2, ease: 'power2.out' }, 0)
        tl.to(crumbs, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.15)
        tl.to(label, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.25)
        tl.to(lines, { yPercent: 0, duration: 1, stagger: 0.12, ease: 'power4.out' }, 0.35)
        if (accent) tl.to(accent, { '--mk': 1, duration: 0.8, ease: 'power2.inOut' }, 1.05)
        tl.to(words, { yPercent: 0, duration: 0.8, stagger: 0.018 }, 0.9)

        // The photo moves a little slower than the page.
        if (bg) {
          gsap.fromTo(
            bg,
            { yPercent: -4 },
            {
              yPercent: 6,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
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
      aria-labelledby="process-hero-title"
      className="relative isolate mt-[calc(4.5rem_-_var(--header-content-clearance))] overflow-clip bg-teal-900 font-sans text-white lg:mt-[calc(5.625rem_-_var(--header-content-clearance))]"
    >
      {/* Photo. Taller than the section so it can drift without showing an edge. */}
      <div data-ph="bg" aria-hidden="true" className="absolute inset-x-0 -inset-y-[8%] -z-20">
        <img
          data-ph="img"
          src={heroImg}
          alt=""
          width={2200}
          height={1467}
          decoding="async"
          fetchPriority="high"
          draggable={false}
          className="size-full object-cover object-[60%_40%] select-none"
        />
      </div>

      {/*
        Brand wash. The design keeps the photo readable across the right half, so the teal
        is strongest behind the copy and at the bottom edge, where the light section starts.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: [
            'radial-gradient(40% 90% at 9.82% 29.33%, rgb(129 216 112 / 0.08) 0%, rgb(129 216 112 / 0) 100%)',
            'linear-gradient(90deg, rgb(3 23 29 / 0.78) 0%, rgb(3 23 29 / 0.62) 42%, rgb(3 23 29 / 0.42) 100%)',
            'linear-gradient(180deg, rgb(3 23 29 / 0.12) 0%, rgb(3 23 29 / 0) 30%, rgb(3 23 29 / 0.28) 78%, rgb(3 23 29 / 0.62) 100%)',
          ].join(', '),
        }}
      />

      <div className="container-page flex min-h-[clamp(34rem,37.6vw,45.0625rem)] flex-col justify-center py-16 lg:justify-start lg:pt-[4.6875rem] lg:pb-24">
        <nav aria-label="Breadcrumb" data-ph="crumbs">
          <ol className="m-0 flex list-none flex-wrap items-center gap-3 p-0 text-[0.8125rem] leading-4 font-medium">
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
              className="inline-flex items-center gap-3 text-white before:-mr-1 before:size-1.5 before:rotate-45 before:border-t-[1.5px] before:border-r-[1.5px] before:border-white/50 before:content-['']"
            >
              How it works
            </li>
          </ol>
        </nav>

        <p
          data-ph="label"
          className="mt-9 flex items-center gap-2.5 text-[0.8125rem] leading-[18px] font-medium sm:text-[0.875rem] lg:mt-[3.25rem]"
        >
          <span className="size-2 rounded-[1px] bg-green-500" aria-hidden="true" />
          How it works
        </p>

        <h1
          id="process-hero-title"
          className="font-display mt-5 text-[clamp(2.5rem,1.75rem+3.2vw,4rem)] leading-[1.06] font-normal tracking-[-0.01em] text-white lg:mt-6"
        >
          {LINES.map((line) => (
            <span key={line} className={MASK}>
              <span data-ph="line" className="block">
                {line}
              </span>
            </span>
          ))}
          <span className={MASK}>
            <span data-ph="line" className="block">
              <em
                data-ph="accent"
                className="relative z-0 inline-block pr-[0.1em] pl-[0.06em] italic [--mk:1] after:absolute after:inset-x-0 after:bottom-[0.06em] after:-z-10 after:h-[0.28em] after:origin-left after:scale-x-(--mk) after:bg-green-500 after:content-['']"
              >
                {ACCENT}
              </em>
            </span>
          </span>
        </h1>

        <p className="mt-4 max-w-[32rem] text-base leading-[1.7] font-medium text-white/90 sm:text-[1.0625rem] lg:mt-3.5 lg:text-lg lg:leading-[1.65]">
          {WORDS.map((w, i) => (
            <span key={`${w}-${i}`}>
              <span className="-mb-[0.2em] inline-block overflow-clip pb-[0.2em] align-bottom">
                <span data-ph="word" className="inline-block">
                  {w}
                </span>
              </span>{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
