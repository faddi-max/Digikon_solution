import { useRef, type ReactNode } from 'react'

import networkBg from '@/assets/images/automation-network-bg.png'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

/**
 * "Less friction at every point of the process.": what better systems unlock, as three
 * outcome cards on a dark green field.
 *
 * Design: 1920 x 659 (min 584.51). From 1280px it is the 1920px design scaled as a unit
 * (`--u` is 1/1920 of the width). The field is the linear gradient #C8F0BE > #03171D >
 * #2E7D32 at 80%, with the network picture over it at 13% in overlay. Below 1280px the
 * heading, the paragraph and the cards stack (three across from 900px).
 *
 * Motion (GSAP, nothing runs off screen): on scroll the picture settles in, the heading rises
 * word by word, the cards arrive in turn and each corner glow swells to full. Afterwards the
 * glows breathe, a soft ring pulses out from each icon, and the picture drifts with the
 * pointer. Cards lift on hover. Reduced motion shows the finished section.
 */

const COPY = {
  label: 'What better systems unlock',
  lead: ['Less', 'friction', 'at', 'every'],
  accent: ['point', 'of', 'the', 'process.'],
  body: 'Automation is most valuable when it makes work simpler for people and more consistent for the business.',
}

const CARDS: readonly { title: string; body: string; icon: 'time' | 'check' | 'eye' }[] = [
  {
    title: 'Give time back',
    body: 'Reduce repetitive data entry, reminders, and manual handoffs so teams can focus on higher-value work.',
    icon: 'time',
  },
  {
    title: 'Improve consistency',
    body: 'Every request follows the same rules, so results stop depending on who is on shift or how busy the day is.',
    icon: 'check',
  },
  {
    title: 'See work more clearly',
    body: 'Each step is logged and visible, so you can see where work waits, who owns it and what happens next.',
    icon: 'eye',
  },
]

const ICONS: Record<(typeof CARDS)[number]['icon'], ReactNode> = {
  time: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8v4.2l2.6 1.6" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="m8.8 12.2 2.2 2.2 4.3-4.6" />
    </>
  ),
  eye: (
    <>
      <path d="M3.5 12s3-5.5 8.5-5.5S20.5 12 20.5 12 17.5 17.5 12 17.5 3.5 12 3.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
}

export function UnlockSection() {
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
        const bg = one('[data-un="bg"]')
        const words = all('[data-un="word"]')
        const fades = all('[data-un="fade"]')
        const cards = all('[data-un="card"]')
        const glows = all('[data-un="glow"]')
        const icons = all('[data-un="icon"]')

        gsap.set(bg, { autoAlpha: 0, scale: 1.08 })
        gsap.set(words, { yPercent: 115 })
        gsap.set(fades, { autoAlpha: 0, y: 18 })
        gsap.set(cards, { autoAlpha: 0, y: 28 })
        gsap.set(glows, { scale: 0.4 })
        gsap.set(icons, { scale: 0.6, autoAlpha: 0 })

        const entrance = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: el, start: 'top 72%', once: true },
        })
        entrance
          .to(bg, { autoAlpha: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 0)
          .to(words, { yPercent: 0, duration: 0.75, stagger: 0.05 }, 0.1)
          .to(fades, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.35)
          .to(cards, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0.5)
          .to(glows, { scale: 1, duration: 1.1, stagger: 0.12, ease: 'power2.out' }, 0.6)
          .to(icons, { scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(2)' }, 0.8)

        // Living details, only while the section is on screen.
        const loops: gsap.core.Animation[] = []
        glows.forEach((g, i) => {
          const breathe = gsap.timeline({ repeat: -1, yoyo: true, paused: true, delay: i * 0.4 })
          breathe.to(g, { scale: 1.08, opacity: 0.85, duration: 2.4 + i * 0.3, ease: 'sine.inOut' })
          loops.push(breathe)
        })
        all('[data-un="pulse"]').forEach((r, i) => {
          loops.push(
            gsap.fromTo(
              r,
              { scale: 1, autoAlpha: 0.7 },
              { scale: 1.55, autoAlpha: 0, duration: 2.2, ease: 'power2.out', repeat: -1, repeatDelay: 0.6, delay: i * 0.5, paused: true },
            ),
          )
        })

        const visible = ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => loops.forEach((l) => (self.isActive ? l.play() : l.pause())),
        })

        // The picture follows the pointer a little.
        const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
        const setX = bg ? gsap.quickTo(bg, 'x', { duration: 1.2, ease: 'power3.out' }) : null
        const setY = bg ? gsap.quickTo(bg, 'y', { duration: 1.2, ease: 'power3.out' }) : null
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          setX?.(((e.clientX - r.left) / r.width - 0.5) * -26)
          setY?.(((e.clientY - r.top) / r.height - 0.5) * -16)
        }
        if (fine) el.addEventListener('pointermove', onMove)

        return () => {
          if (fine) el.removeEventListener('pointermove', onMove)
          visible.kill()
          loops.forEach((l) => l.kill())
          entrance.scrollTrigger?.kill()
          entrance.kill()
        }
      })
    },
    { scope: root, dependencies: [motion] },
  )

  return (
    <section
      ref={root}
      aria-labelledby="automation-unlock-title"
      className="@container relative isolate overflow-clip bg-[linear-gradient(161deg,#7aa282_0%,#03171d_38%,#5a9a5e_100%)] text-white"
    >
      {/* The network picture: 13%, overlay, a little larger than the section so it can drift. */}
      <div data-un="bg" aria-hidden="true" className="pointer-events-none absolute -inset-[2%] -z-10 mix-blend-overlay">
        <img
          src={networkBg}
          alt=""
          width={1672}
          height={941}
          loading="lazy"
          decoding="async"
          className="size-full object-cover opacity-[0.13]"
        />
      </div>

      <div className="[--u:calc(100cqw/1920)] max-[1279px]:px-5 max-[1279px]:py-16 sm:max-[1279px]:px-10 sm:max-[1279px]:py-20 min-[1280px]:u-min-h-[584.51] min-[1280px]:pb-[calc(99*var(--u))] min-[1280px]:pt-[calc(103*var(--u))]">
        {/* Heading row. */}
        <div className="min-[1280px]:u-pl-290">
          <p
            data-un="fade"
            className="flex items-center gap-2.5 text-[0.9375rem] leading-5 font-semibold min-[1280px]:u-gap-10 min-[1280px]:u-text-[17.8] min-[1280px]:u-leading-20 [--tf:13px]"
          >
            <span className="size-2 rounded-full bg-green-500 shadow-[0_0_10px_rgb(129_216_112/0.8)] min-[1280px]:u-size-8" aria-hidden="true" />
            {COPY.label}
          </p>
          <div className="mt-5 min-[1280px]:flex min-[1280px]:u-mt-21">
            <h2
              id="automation-unlock-title"
              className="font-display text-[clamp(2.1rem,8.6vw,3.25rem)] leading-[1.13] font-normal tracking-[-0.005em] min-[1280px]:u-w-669 min-[1280px]:flex-none min-[1280px]:u-text-[50.2] min-[1280px]:leading-[1.32] min-[1280px]:text-wrap! [--tf:30px]"
            >
              {COPY.lead.map((w) => (
                <span key={w}>
                  <span className="-mx-[0.1em] -mb-[0.2em] inline-block overflow-clip px-[0.1em] pb-[0.2em] align-bottom">
                    <span data-un="word" className="inline-block">
                      {w}
                    </span>
                  </span>{' '}
                </span>
              ))}
              <br className="hidden min-[1280px]:block" />
              {COPY.accent.map((w, i) => (
                <span key={w}>
                  <span className="-mx-[0.1em] -mb-[0.2em] inline-block overflow-clip px-[0.1em] pb-[0.2em] align-bottom">
                    <span data-un="word" className="inline-block">
                      <em className="text-green-500 italic">{w}</em>
                    </span>
                  </span>
                  {i < COPY.accent.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h2>
            <p
              data-un="fade"
              className="mt-4 max-w-[34rem] text-[1rem] leading-[1.7] font-medium text-white/60 min-[1280px]:u-mt-34.5 min-[1280px]:u-w-597 min-[1280px]:max-w-none min-[1280px]:u-text-[17.8] min-[1280px]:leading-[1.63] min-[1280px]:text-wrap! [--tf:14px]"
            >
              {COPY.body}
            </p>
          </div>
        </div>

        {/* The three outcomes. */}
        <ul className="mt-10 grid gap-4 min-[900px]:max-[1279px]:grid-cols-3 min-[1280px]:u-mt-34 min-[1280px]:u-pl-359 min-[1280px]:grid-cols-[repeat(3,calc(387*var(--u)))] min-[1280px]:gap-[calc(16*var(--u))]">
          {CARDS.map((c, i) => (
            <li
              key={c.title}
              data-un="card"
              className="group relative flex flex-col overflow-clip rounded-[1.25rem] bg-white p-6 text-[#03171d] shadow-[0_20px_40px_-26px_rgb(0_0_0/0.6)] transition-[transform,box-shadow] duration-300 ease-out will-change-transform hover:-translate-y-1.5 hover:shadow-[0_28px_50px_-24px_rgb(0_0_0/0.7)] min-[1280px]:u-min-h-253 min-[1280px]:rounded-[calc(24*var(--u))] min-[1280px]:pt-[calc(28*var(--u))] min-[1280px]:pr-[calc(26*var(--u))] min-[1280px]:pb-[calc(37*var(--u))] min-[1280px]:pl-[calc(26*var(--u))]"
            >
              {/* The corner glow: a soft ring of green around the top right corner. */}
              <div
                data-un="glow"
                aria-hidden="true"
                className="pointer-events-none absolute -top-[7.5rem] -right-[7.5rem] size-60 bg-[radial-gradient(circle_closest-side,transparent_0%,transparent_58%,rgb(133_218_116/0.95)_77%,transparent_96%)] transition-transform duration-500 ease-out group-hover:scale-110 min-[1280px]:-top-[calc(120*var(--u))] min-[1280px]:-right-[calc(120*var(--u))] min-[1280px]:size-[calc(240*var(--u))]"
                style={{ transformOrigin: '50% 50%' }}
              />
              <span
                data-un="icon"
                className="relative grid size-11 place-items-center rounded-full bg-[#c0ecb8] min-[1280px]:size-[max(40px,calc(46*var(--u)))]"
              >
                <span data-un="pulse" aria-hidden="true" className="absolute inset-0 rounded-full border border-[#81d870] opacity-0" />
                <svg viewBox="0 0 24 24" aria-hidden="true" className="relative size-[46%] fill-none stroke-[#03171d] stroke-[1.7]" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[c.icon]}
                </svg>
              </span>
              <h3 className="mt-5 text-[1.0625rem] leading-[1.2] font-bold tracking-[-0.02em] min-[1280px]:u-mt-40 min-[1280px]:u-text-[17] [--tf:16px]">{c.title}</h3>
              <p className="mt-3 max-w-[22rem] text-[0.8125rem] leading-[1.85] font-medium text-[#03171d]/60 min-[1280px]:u-mt-14 min-[1280px]:u-w-290 min-[1280px]:max-w-none min-[1280px]:u-text-[12] min-[1280px]:leading-[1.875] [--tf:12px]">
                {c.body}
              </p>
              <span className="sr-only">{`Outcome ${i + 1} of ${CARDS.length}`}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}