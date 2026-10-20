import { useRef, type ReactNode } from 'react'

import networkBg from '@/assets/images/automation-network-bg.png'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

/**
 * "Design the system. Then let it flow.": how an automation engagement runs, as four steps
 * on one line.
 *
 * Design: 1920 x 853.78, 170px padding above and below. From 1280px it is the 1920px design
 * scaled as a unit (`--u` is 1/1920 of the width, text keeps a readable floor) and the section
 * grows with its content. Below that it is one column (two from `sm`) with the steps hanging
 * off a vertical rail.
 *
 * Motion (GSAP, one ticker while on screen): on scroll the heading rises word by word, the
 * line draws across and each step's dot lights as it arrives. After that a pulse of light
 * travels the line, lifting each step as it passes, so the section reads as a flow. The
 * background picture eases up and drifts with scroll and the pointer. Reduced motion shows
 * the finished section.
 */

const STEPS: readonly { n: string; tag: string; title: string; body: string; icon: 'find' | 'design' | 'connect' | 'measure' }[] = [
  {
    n: '01',
    tag: 'Understand',
    title: 'Find the friction',
    body: 'We map repetitive tasks, handoffs and bottlenecks to find the work that consumes valuable attention.',
    icon: 'find',
  },
  {
    n: '02',
    tag: 'Design',
    title: 'Design the flow',
    body: 'We choose the right triggers, rules, integrations and human checkpoints for your process.',
    icon: 'design',
  },
  {
    n: '03',
    tag: 'Connect',
    title: 'Build & connect',
    body: 'We connect the tools your team uses and test the workflow against real-world use.',
    icon: 'connect',
  },
  {
    n: '04',
    tag: 'Refine',
    title: 'Measure & improve',
    body: 'We track the flow, handle exceptions and improve the system as your business changes.',
    icon: 'measure',
  },
]

const COPY = {
  label: 'How we make it work',
  lead: ['Design', 'the', 'system.'],
  accent: ['Then', 'let', 'it', 'flow.'],
  body: 'From the first process map to ongoing refinement, we make automation understandable, useful, and maintainable.',
} as const

const ICONS: Record<(typeof STEPS)[number]['icon'], ReactNode> = {
  find: (
    <>
      <circle cx="11" cy="11" r="5.5" />
      <path d="m15.2 15.2 4 4" />
    </>
  ),
  design: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.6" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" />
      <path d="M10.5 7.2h3.3a2.7 2.7 0 0 1 2.7 2.7v3.6" />
    </>
  ),
  connect: (
    <>
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 6.8 12.4 5.4a3.4 3.4 0 0 1 4.8 4.8L15.8 11.6M13 17.2l-1.4 1.4a3.4 3.4 0 0 1-4.8-4.8L8.2 12.4" />
    </>
  ),
  measure: (
    <>
      <path d="M4 17.5 9.5 12l3.5 3.5L20 8.5" />
      <path d="M15 8.5h5v5" />
    </>
  ),
}

export function ProcessSection() {
  const root = useRef<HTMLElement>(null)
  const motion = !useMediaQuery('(prefers-reduced-motion: reduce)')

  useGSAP(
    () => {
      const el = root.current
      if (!el || !motion) return
      const all = <T extends Element = HTMLElement>(sel: string) =>
        gsap.utils.toArray<T>(el.querySelectorAll(sel))
      const one = <T extends Element = HTMLElement>(sel: string) => el.querySelector<T>(sel)

      const mm = gsap.matchMedia(el)
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const wide = window.matchMedia('(min-width: 1280px)').matches
        const bg = one('[data-pr="bg"]')
        const words = all('[data-pr="word"]')
        const accent = all('[data-pr="accent"]')
        const fades = all('[data-pr="fade"]')
        const rail = one('[data-pr="rail"]')
        const dots = all('[data-pr="dot"]')
        const halos = all('[data-pr="halo"]')
        const tags = all('[data-pr="tag"]')
        const stepItems = all('[data-pr="step"]')
        const comet = one('[data-pr="comet"]')

        gsap.set(bg, { autoAlpha: 0, scale: 1.08 })
        gsap.set(words, { yPercent: 115 })
        gsap.set(fades, { autoAlpha: 0, y: 18 })
        gsap.set(rail, { scaleX: wide ? 0 : 1, scaleY: wide ? 1 : 0, transformOrigin: wide ? '0% 50%' : '50% 0%' })
        gsap.set(dots, { scale: 0, transformOrigin: '50% 50%' })
        gsap.set(stepItems, { autoAlpha: 0, y: 22 })
        gsap.set(comet, { autoAlpha: 0 })

        let armed = false
        let visible = false
        const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
        const setBg = bg
          ? { x: gsap.quickSetter(bg, 'x', 'px') as (v: number) => void, y: gsap.quickSetter(bg, 'y', 'px') as (v: number) => void }
          : null
        const setComet = comet ? (gsap.quickSetter(comet, 'x', 'px') as (v: number) => void) : null
        const setCometY = comet ? (gsap.quickSetter(comet, 'y', 'px') as (v: number) => void) : null
        let railW = 0
        let railH = 0
        const measure = () => {
          const r = rail?.getBoundingClientRect()
          railW = r?.width ?? 0
          railH = r?.height ?? 0
        }
        measure()
        const ro = new ResizeObserver(measure)
        if (rail) ro.observe(rail)
        const frac = dots.map((_, i) => i / (STEPS.length - 1))

        const tick = (time: number, deltaMs: number) => {
          const dt = Math.min(deltaMs, 50) / 1000
          const k = 1 - Math.exp(-dt * 4)
          pointer.x += (pointer.tx - pointer.x) * k
          pointer.y += (pointer.ty - pointer.y) * k
          setBg?.x(pointer.x * -14)
          setBg?.y(pointer.y * -10)
          if (!armed) return

          // A pulse travels the line and lifts each step as it passes.
          const cycle = 8
          const p = ((time % cycle) / cycle) * 1.25 - 0.1 // runs a little past both ends
          if (wide) setComet?.(p * railW)
          else setCometY?.(p * railH)
          dots.forEach((d, i) => {
            const near = Math.max(0, 1 - Math.abs(p - frac[i]) / 0.16)
            gsap.set(d, { scale: 1 + 0.5 * near })
            if (halos[i]) (halos[i] as HTMLElement).style.opacity = String(0.25 + 0.75 * near)
            if (tags[i]) (tags[i] as HTMLElement).style.opacity = String(0.55 + 0.45 * near)
          })
          if (comet) comet.style.opacity = String(Math.max(0, Math.min(1, Math.sin(Math.PI * Math.min(1, Math.max(0, (p + 0.1) / 1.25))) * 3)))
        }

        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          paused: true,
          onComplete: () => {
            armed = true
            if (visible) gsap.ticker.add(tick)
          },
        })
        tl.to(bg, { autoAlpha: 1, scale: 1, duration: 2.2, ease: 'power2.out' }, 0)
        tl.to(fades[0], { autoAlpha: 1, y: 0, duration: 0.55 }, 0.1)
        tl.to(words, { yPercent: 0, duration: 0.85, stagger: 0.06 }, 0.15)
        tl.to(fades.slice(1), { autoAlpha: 1, y: 0, duration: 0.6 }, 0.7)
        tl.to(rail, wide ? { scaleX: 1, duration: 1.6, ease: 'power2.inOut' } : { scaleY: 1, duration: 1.6, ease: 'power2.inOut' }, 0.8)
        tl.to(dots, { scale: 1, duration: 0.5, stagger: 0.4, ease: 'back.out(3)' }, 0.9)
        tl.to(stepItems, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.4 }, 1.0)
        if (accent.length) {
          tl.fromTo(
            accent,
            { textShadow: '0 0 0px rgba(129,216,112,0)' },
            { textShadow: '0 0 28px rgba(129,216,112,0.55)', duration: 0.6, yoyo: true, repeat: 1, stagger: 0.05, ease: 'sine.inOut' },
            0.9,
          )
        }

        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top 70%',
          end: 'bottom top',
          onEnter: () => tl.play(),
          onToggle: (self) => {
            visible = self.isActive
            gsap.ticker.remove(tick)
            if (visible && armed) gsap.ticker.add(tick)
          },
        })
        const scrub = bg
          ? gsap.fromTo(
              bg.querySelector('img'),
              { yPercent: -4 },
              { yPercent: 4, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
            )
          : null

        const onMove = (e: PointerEvent) => {
          if (e.pointerType === 'touch') return
          const r = el.getBoundingClientRect()
          pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
          pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2
        }
        const onLeave = () => {
          pointer.tx = 0
          pointer.ty = 0
        }
        el.addEventListener('pointermove', onMove)
        el.addEventListener('pointerleave', onLeave)

        return () => {
          el.removeEventListener('pointermove', onMove)
          el.removeEventListener('pointerleave', onLeave)
          gsap.ticker.remove(tick)
          ro.disconnect()
          st.kill()
          scrub?.scrollTrigger?.kill()
          tl.kill()
        }
      })
    },
    { scope: root, dependencies: [motion] },
  )

  return (
    <section
      ref={root}
      aria-labelledby="automation-process-title"
      className="@container relative isolate overflow-clip bg-[linear-gradient(165deg,#03171d_0%,#1c2e33_85%,#0d3f3b_100%)] text-white"
    >
      {/* A soft green light in the top right corner. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_24%_42%_at_100%_0%,rgb(129_216_112/0.1),transparent)]"
      />
      {/* The network picture, at 15% in soft light, bigger than the section so it can drift. */}
      <div data-pr="bg" aria-hidden="true" className="pointer-events-none absolute -inset-[3%] -z-10 mix-blend-soft-light">
        <img
          src={networkBg}
          alt=""
          width={1672}
          height={941}
          loading="lazy"
          decoding="async"
          className="size-full object-cover opacity-15"
        />
      </div>

      <div className="[--u:calc(100cqw/1920)] max-[1279px]:px-5 max-[1279px]:py-16 sm:max-[1279px]:px-10 sm:max-[1279px]:py-20 min-[1280px]:u-min-h-[853.78] min-[1280px]:u-pl-349 min-[1280px]:u-pr-349 min-[1280px]:u-pt-170 min-[1280px]:pb-[calc(170*var(--u))]">
        {/* Heading row. */}
        <div className="min-[1280px]:flex">
          <p
            data-pr="fade"
            className="flex items-center gap-2.5 text-[0.9375rem] leading-5 font-semibold min-[1280px]:u-w-272 min-[1280px]:flex-none min-[1280px]:u-mt-51 min-[1280px]:u-gap-10 min-[1280px]:u-text-[17.8] min-[1280px]:u-leading-20 [--tf:13px]"
          >
            <span className="size-2 rounded-full bg-green-500 shadow-[0_0_10px_rgb(129_216_112/0.8)] min-[1280px]:u-size-8" aria-hidden="true" />
            {COPY.label}
          </p>
          <div className="mt-5 min-[1280px]:mt-0">
            <h2
              id="automation-process-title"
              className="font-display text-[clamp(2.1rem,8.6vw,3.25rem)] leading-[1.13] font-normal tracking-[-0.005em] min-[1280px]:u-text-[55.2] min-[1280px]:text-wrap! [--tf:30px]"
            >
              {COPY.lead.map((w) => (
                <span key={w}>
                  <span className="-mx-[0.1em] -mb-[0.2em] inline-block overflow-clip px-[0.1em] pb-[0.2em] align-bottom">
                    <span data-pr="word" className="inline-block">
                      {w}
                    </span>
                  </span>{' '}
                </span>
              ))}
              {COPY.accent.map((w, i) => (
                <span key={w}>
                  <span className="-mx-[0.1em] -mb-[0.2em] inline-block overflow-clip px-[0.1em] pb-[0.2em] align-bottom">
                    <span data-pr="word" className="inline-block">
                      <em data-pr="accent" className="text-green-500 italic">
                        {w}
                      </em>
                    </span>
                  </span>
                  {i < COPY.accent.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h2>
            <p
              data-pr="fade"
              className="mt-4 max-w-[34rem] text-[1rem] leading-[1.7] font-medium text-white/55 min-[1280px]:u-mt-13.5 min-[1280px]:u-w-530 min-[1280px]:max-w-none min-[1280px]:u-text-[17.8] min-[1280px]:leading-[1.63] min-[1280px]:text-wrap! [--tf:14px]"
            >
              {COPY.body}
            </p>
          </div>
        </div>

        {/* The line and its steps. */}
        <ol className="relative mt-10 grid gap-10 pl-8 sm:max-[1279px]:grid-cols-2 min-[1280px]:mt-0 min-[1280px]:u-mt-88.5 min-[1280px]:u-w-1192 min-[1280px]:grid-cols-4 min-[1280px]:gap-0 min-[1280px]:pl-0">
          {/* Rail: vertical on small screens, horizontal from lg. */}
          <li
            aria-hidden="true"
            className="pointer-events-none absolute top-1 bottom-1 left-[0.3125rem] w-px min-[1280px]:inset-x-0 min-[1280px]:top-[5.5px] min-[1280px]:bottom-auto min-[1280px]:left-0 min-[1280px]:h-px min-[1280px]:w-auto"
          >
            <span data-pr="rail" className="absolute inset-0 bg-[linear-gradient(180deg,rgb(129_216_112/0.5),rgb(129_216_112/0.12))] min-[1280px]:bg-[linear-gradient(90deg,rgb(129_216_112/0.55),rgb(129_216_112/0.28)_55%,rgb(129_216_112/0.1))]" />
            <span
              data-pr="comet"
              className="absolute -top-[9px] -left-[9px] size-5 rounded-full bg-[radial-gradient(closest-side,rgb(200_255_190/0.95),rgb(129_216_112/0.35)_55%,transparent)] min-[1280px]:-top-[9px]"
              style={{ filter: 'blur(0.5px)' }}
            />
          </li>

          {STEPS.map((s) => (
            <li key={s.n} className="relative min-[1280px]:u-pr-40">
              <span
                aria-hidden="true"
                className="absolute top-[0.2rem] -left-8 grid size-3 place-items-center min-[1280px]:relative min-[1280px]:top-auto min-[1280px]:left-auto min-[1280px]:u-size-11"
              >
                <span data-pr="halo" className="absolute -inset-1.5 rounded-full bg-green-500/25 blur-[5px]" />
                <span data-pr="dot" className="relative size-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgb(129_216_112/0.9)] min-[1280px]:u-size-11" />
              </span>
              <div data-pr="step">
                <p
                  data-pr="tag"
                  className="text-[0.6875rem] leading-4 font-semibold tracking-[0.14em] text-[#8fa59f] uppercase min-[1280px]:u-mt-21 min-[1280px]:u-text-[11] min-[1280px]:leading-[1.27] [--tf:10px]"
                >
                  {s.n} / {s.tag}
                </p>
                <span className="mt-4 grid size-11 place-items-center rounded-full border border-green-500/25 bg-green-500/15 min-[1280px]:u-mt-37.5 min-[1280px]:u-size-43">
                  <svg viewBox="0 0 24 24" className="size-[44%]" fill="none" stroke="#81d870" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {ICONS[s.icon]}
                  </svg>
                </span>
                <h3 className="font-display mt-4 text-[1.5rem] leading-[1.25] font-normal min-[1280px]:u-mt-17.5 min-[1280px]:u-text-25 min-[1280px]:leading-[1.2] [--tf:19px]">
                  {s.title}
                </h3>
                <p className="mt-2 max-w-[22rem] text-[0.875rem] leading-[1.6] font-medium text-white/50 min-[1280px]:u-mt-16 min-[1280px]:u-w-236 min-[1280px]:max-w-none min-[1280px]:u-text-[13.5] min-[1280px]:leading-[1.6] [--tf:12px]">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}