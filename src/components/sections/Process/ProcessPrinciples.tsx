import { useRef, type CSSProperties } from 'react'

import { gsap, useGSAP } from '@/lib/motion'

/** Each line sits in a clip so it rises out of it instead of fading. */
const MASK = '-mx-[0.1em] -mb-[0.2em] block overflow-clip px-[0.1em] pb-[0.2em]'

/**
 * Faint teal grid with a dot at every crossing. Cells are 134px at 1920 and shrink with
 * the viewport (never below 72px); the pattern is centred so it stays symmetric.
 */
const GRID = {
  '--cell': 'clamp(4.5rem, 7vw, 8.4rem)',
  backgroundImage: [
    'radial-gradient(circle at 1px 1px, rgb(3 23 29 / 0.16) 0 1.5px, transparent 2px)',
    'linear-gradient(90deg, rgb(3 23 29 / 0.09) 1px, transparent 1px)',
    'linear-gradient(180deg, rgb(3 23 29 / 0.09) 1px, transparent 1px)',
  ].join(', '),
  backgroundSize: 'var(--cell) var(--cell)',
  backgroundPosition: 'calc(50% - 1px) calc(var(--cell) * -0.58)',
} as CSSProperties

/**
 * How it works: "The Principles" intro, directly below the hero.
 *
 * Layout: label in a narrow left column, editorial two-line statement to its right (the
 * statement starts 256px into the content frame on desktop, label vertically centred on
 * it). Below lg the label stacks above the statement. The soft green light sits just past
 * the end of the first line, level with the second, and moves inside the frame on small
 * screens so it never causes overflow.
 *
 * Motion (GSAP + ScrollTrigger, plays once when the section enters): the grid fades in,
 * label fades up, both lines rise out of their masks, "flexibility" warms from teal to
 * DigiKon green, then the light blooms and keeps a slow, low-contrast breathing pulse.
 * While scrolling through the section the light drifts slightly for depth. Reduced motion
 * renders the finished state with no tweens and no pulse.
 */
export function ProcessPrinciples() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const one = (sel: string) => el.querySelector<HTMLElement>(sel)

      const grid = one('[data-pp="grid"]')
      const label = one('[data-pp="label"]')
      const lines = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-pp="line"]'))
      const accent = one('[data-pp="accent"]')
      const glow = one('[data-pp="glow"]')

      const mm = gsap.matchMedia(el)
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(grid, { autoAlpha: 0 })
        gsap.set(label, { autoAlpha: 0, y: 16 })
        gsap.set(lines, { yPercent: 110 })
        gsap.set(accent, { color: 'var(--color-teal-900)' })
        gsap.set(glow, { autoAlpha: 0, scale: 0.4 })

        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: el, start: 'top 75%', once: true },
        })
        tl.to(grid, { autoAlpha: 1, duration: 1.2, ease: 'power1.out' }, 0)
        tl.to(label, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.1)
        tl.to(lines, { yPercent: 0, duration: 1, stagger: 0.14, ease: 'power4.out' }, 0.15)
        tl.to(accent, { color: 'var(--color-green-500)', duration: 0.7, ease: 'power1.inOut' }, 0.75)
        tl.to(glow, { autoAlpha: 1, scale: 1, duration: 1.1, ease: 'expo.out' }, 0.85)
        // The pulse is a separate infinite tween so it doesn't hold the timeline open.
        tl.add(() => {
          gsap.to(glow, { scale: 1.18, opacity: 0.75, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 })
        })

        if (glow) {
          gsap.fromTo(
            glow,
            { y: 24 },
            {
              y: -24,
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
      aria-labelledby="process-principles-title"
      className="relative isolate overflow-clip bg-white font-sans text-teal-900"
    >
      {/* Light green wash, strongest at the top centre where it meets the hero. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          backgroundImage: [
            'radial-gradient(55% 75% at 50% 0%, rgb(178 238 158 / 0.24) 0%, rgb(178 238 158 / 0) 100%)',
            'linear-gradient(180deg, rgb(178 238 158 / 0.26) 0%, rgb(178 238 158 / 0.12) 45%, rgb(178 238 158 / 0) 88%)',
          ].join(', '),
        }}
      />
      <div data-pp="grid" aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={GRID} />

      <div className="container-page grid gap-6 py-20 sm:py-24 lg:grid-cols-[16.75rem_minmax(0,1fr)] lg:items-center lg:gap-0 lg:pt-[6.25rem] lg:pb-[6.75rem]">
        <p data-pp="label" className="flex items-center gap-2.5 text-[0.8125rem] leading-[18px] font-medium">
          <span className="size-2 rounded-[1px] bg-green-500" aria-hidden="true" />
          The Principles
        </p>

        <h2
          id="process-principles-title"
          className="font-display relative text-[clamp(2rem,1.1rem+3vw,3.875rem)] leading-[1.1] font-normal tracking-[-0.005em] lg:w-fit"
        >
          <span className={MASK}>
            <span data-pp="line" className="block">
              Enough structure to reduce risk.
            </span>
          </span>
          <span className={MASK}>
            <span data-pp="line" className="block">
              Enough{' '}
              <span data-pp="accent" className="text-green-500">
                flexibility
              </span>{' '}
              to learn.
            </span>
          </span>

          <span
            data-pp="glow"
            aria-hidden="true"
            className="pointer-events-none absolute top-[calc(1.7em_-_3.75rem)] right-1 -z-10 size-[7.5rem] rounded-full bg-[radial-gradient(circle,rgb(129_216_112/0.95)_0%,rgb(129_216_112/0.55)_32%,rgb(129_216_112/0)_70%)] blur-[8px] lg:-right-10 xl:-right-[5.25rem]"
          />
        </h2>
      </div>
    </section>
  )
}
