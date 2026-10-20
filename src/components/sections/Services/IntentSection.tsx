import { useCallback, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

import mintGrid from '@/assets/images/team/soft-mint-grid-overlay.png'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

import { createOrbitState, IntentOrbitScene } from './IntentOrbitScene'
import './IntentSection.css'
import type { ServiceIntentData } from './servicesDetailData'

export type { ServiceIntentData }

/** Default copy read from the Figma "Connecting intent to value" frame. */
const DEFAULT_LABEL = 'Connecting intent to value'
const DEFAULT_LINES = ['Discover the opportunities', 'hiding in every search.'] as const
const DEFAULT_BODY =
  'Behind every search query is a person with intent. Some are researching. Some are comparing. Some are ready to act. We help you understand these signals and position your business to meet people at each stage of their journey — with the right content, on the right pages, at the right time.'

const DEFAULT_CHIPS = [
  { label: 'Visibility', x: -315, y: -117, depth: 14 },
  { label: 'Qualified traffic', x: 402, y: -80, depth: 10 },
  { label: 'Leads', x: -359, y: 118, depth: 12 },
  { label: 'Business growth', x: 311, y: 107, depth: 16 },
] as const

/** Dots drawn by the CSS fallback only; the WebGL scene animates its own. */
const FALLBACK_DOTS = [
  { x: 38, y: -273 },
  { x: -157, y: 168 },
  { x: 177, y: 210 },
] as const

const DESIGN_WIDE = 1200
const DESIGN_NARROW = 760

export function IntentSection({ data }: { data?: ServiceIntentData } = {}) {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const wide = useMediaQuery('(min-width: 900px)')
  const motion = useMediaQuery('(prefers-reduced-motion: no-preference)')
  const [gl, setGl] = useState<'pending' | 'ok' | 'fail'>('pending')
  const designWidth = wide ? DESIGN_WIDE : DESIGN_NARROW

  const label = data?.label ?? DEFAULT_LABEL
  const lines = data?.lines ?? DEFAULT_LINES
  const body = data?.body ?? DEFAULT_BODY
  const chips = data?.chips ?? DEFAULT_CHIPS

  // Shared with the scene; created once. Reduced motion starts at the finished state.
  const orbit = useMemo(() => createOrbitState(motion ? 0 : 1), [motion])

  // Scale the design frame to the stage width.
  useLayoutEffect(() => {
    const el = stage.current
    if (!el) return
    el.style.setProperty('--dwn', String(designWidth))
    const fit = () => {
      const s = Math.min(1, el.clientWidth / designWidth)
      el.style.setProperty('--s', String(s))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [designWidth])

  const onStatus = useCallback((s: 'ok' | 'fail') => setGl(s), [])

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const all = (sel: string) => gsap.utils.toArray<HTMLElement>(el.querySelectorAll(sel))
      const one = (sel: string) => el.querySelector<HTMLElement>(sel)

      const label = one('[data-io="label"]')
      const lines = all('[data-io="line"]')
      const body = one('[data-io="body"]')
      const pills = all('[data-io="pill"]')
      const floats = all('[data-io="float"]')
      const shifts = all('[data-io="shift"]')
      const shadow = one('[data-io="shadow"]')
      const mesh = one('[data-io="mesh"]')
      const visual = one('[data-io="visual"]')

      const mm = gsap.matchMedia(el)

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        orbit.intro = 0
        gsap.set(label, { autoAlpha: 0, x: -12 })
        gsap.set(lines, { yPercent: 110 })
        gsap.set(body, { autoAlpha: 0, y: 18 })
        gsap.set(pills, { autoAlpha: 0, y: 14, scale: 0.86 })
        gsap.set(shadow, { autoAlpha: 0 })

        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          // Plays on every entry, scrolling down or back up; resets when the section leaves.
          scrollTrigger: {
            trigger: el,
            start: 'top 65%',
            toggleActions: 'restart reset restart reset',
          },
        })
        tl.to(orbit, {
          intro: 1,
          duration: 1.5,
          ease: 'power2.out',
          onUpdate: () => orbit.invalidate?.(),
        })
        tl.to(shadow, { autoAlpha: 1, duration: 1.1 }, 0.1)
        tl.to(pills, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1 }, 0.55)
        tl.to(label, { autoAlpha: 1, x: 0, duration: 0.55 }, 0.8)
        tl.to(lines, { yPercent: 0, duration: 0.85, stagger: 0.11 }, 0.9)
        tl.to(body, { autoAlpha: 1, y: 0, duration: 0.7 }, 1.3)

        // The grid moves a little slower than the page.
        if (mesh) {
          gsap.fromTo(
            mesh,
            { yPercent: -3 },
            {
              yPercent: 3,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        }

        // Chips drift while the section is on screen. Each uses its own layer so none of this
        // fights the entrance or the pointer movement.
        const drifts = floats.map((f, i) =>
          gsap.to(f, {
            y: i % 2 ? 6 : -6,
            duration: 3 + i * 0.45,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            paused: true,
          }),
        )
        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => drifts.forEach((d) => d.paused(!self.isActive)),
        })

        // Pointer: chips shift against it (depth), and the scene tilts. Mouse and pen only.
        const moves = shifts.map((s) => ({
          x: gsap.quickTo(s, 'x', { duration: 0.8, ease: 'power3.out' }),
          y: gsap.quickTo(s, 'y', { duration: 0.8, ease: 'power3.out' }),
          depth: Number(s.dataset.depth ?? 10),
        }))
        const onMove = (e: PointerEvent) => {
          if (e.pointerType === 'touch' || !visual) return
          const r = visual.getBoundingClientRect()
          const px = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1))
          const py = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1))
          orbit.px = px
          orbit.py = py
          moves.forEach((m) => {
            m.x(-px * m.depth)
            m.y(-py * m.depth * 0.7)
          })
          orbit.invalidate?.()
        }
        const onLeave = () => {
          orbit.px = 0
          orbit.py = 0
          moves.forEach((m) => {
            m.x(0)
            m.y(0)
          })
          orbit.invalidate?.()
        }
        el.addEventListener('pointermove', onMove)
        el.addEventListener('pointerleave', onLeave)

        return () => {
          el.removeEventListener('pointermove', onMove)
          el.removeEventListener('pointerleave', onLeave)
          st.kill()
          drifts.forEach((d) => d.kill())
        }
      })
    },
    { scope: root, dependencies: [orbit, data] },
  )

  return (
    <section
      ref={root}
      aria-labelledby="intent-title"
      className="relative isolate z-10 overflow-clip bg-teal-900 bg-[radial-gradient(circle_min(1500px,130vw)_at_0_0,rgba(129,216,112,0.5)_0%,rgba(129,216,112,0.37)_17%,rgba(129,216,112,0.21)_36%,rgba(129,216,112,0.12)_60%,rgba(129,216,112,0.04)_95%,rgba(129,216,112,0)_100%),radial-gradient(ellipse_70%_80%_at_100%_100%,#1C2E33_0%,rgba(28,46,51,0)_100%)] px-[clamp(1rem,0.32rem+2.86vw,5rem)] pt-[clamp(3rem,5.2vw,6.25rem)] pb-[clamp(4.5rem,8.4vw,10rem)] font-sans text-white"
    >
      {/* Backgrounds: teal grid mesh at 20%, mint tech grid at 5%. */}
      <div
        data-io="mesh"
        aria-hidden="true"
        className="dk-io__mesh pointer-events-none absolute inset-x-0 -top-[4%] -z-10 h-[108%] opacity-20"
      />
      <img
        src={mintGrid}
        alt=""
        aria-hidden="true"
        decoding="async"
        loading="lazy"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-5 select-none"
      />

      {/* Picture. The canvas is decoration; the labels are real HTML. */}
      <div ref={stage} className="dk-io" data-io="visual-wrap">
        <div data-io="visual" className="dk-io__visual">
          <div className="dk-io__design" aria-hidden="true">
            <div data-io="shadow" className="dk-io__shadow" />
            {gl === 'fail' && (
              <>
                <div className="dk-io__fb-ring" />
                <div className="dk-io__fb-pill" />
                <div className="dk-io__fb-sphere" />
                {FALLBACK_DOTS.map((d) => (
                  <span
                    key={`${d.x}${d.y}`}
                    className="dk-io__fb-dot"
                    style={{ left: `calc(50% + ${d.x}px)`, top: `${278 + d.y}px` }}
                  />
                ))}
              </>
            )}
          </div>
          <IntentOrbitScene
            state={orbit}
            motion={motion}
            designWidth={designWidth}
            onStatus={onStatus}
          />
        </div>

        <ul role="list" className="dk-io__chips" aria-label="Service core value drivers">
          {chips.map((c) => (
            <li
              key={c.label}
              className="dk-io__chip"
              style={{ '--x': c.x, '--y': c.y } as CSSProperties}
            >
              <span data-io="shift" data-depth={c.depth} className="inline-flex">
                <span data-io="float" className="inline-flex">
                  <span data-io="pill" className="dk-io__pill">
                    {c.label}
                  </span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-6 max-w-[812px]">
        <p
          data-io="label"
          className="flex items-center gap-2.5 text-[13px] leading-[18px] font-medium text-green-500"
        >
          <span aria-hidden="true" className="size-2 bg-green-500" />
          {label}
        </p>

        <h2
          id="intent-title"
          className="mt-[clamp(1.25rem,2.4vw,2.4rem)] font-display text-[clamp(2rem,1.2rem+2.1vw,3.25rem)] leading-[1.135] font-normal"
        >
          {lines.map((line) => (
            <span
              key={line}
              className="-mx-[0.1em] block overflow-clip px-[0.1em] pb-[0.2em] -mb-[0.2em]"
            >
              <span data-io="line" className="block">
                {line}
              </span>
            </span>
          ))}
        </h2>

        <p
          data-io="body"
          className="mt-[clamp(1.25rem,2vw,1.9rem)] max-w-[770px] text-base leading-[1.8] text-white/75"
        >
          {body}
        </p>
      </div>
    </section>
  )
}
