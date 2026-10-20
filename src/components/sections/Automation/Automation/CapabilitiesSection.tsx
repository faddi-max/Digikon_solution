import { useRef } from 'react'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

/**
 * "Intelligence for the work, behind your business.": what we build, as a bento of four
 * cards, with a slow ticker of the tools it connects to underneath.
 *
 * Design: a pale green wash that clears to white, with a fine grid fading out of the top. From
 * 1280px it is the 1920px design scaled as a unit (`--u` is 1/1920 of the width); below that
 * the cards stack (two columns from `sm`) and the heading sits above the label-free copy.
 *
 * Motion (GSAP, nothing runs off screen): on scroll the grid fades in, the heading rises word
 * by word and the cards arrive in turn. Each card then keeps a small piece of its own
 * behaviour alive: rings turning around the agent core, three checks ticking through, a
 * packet moving along the pipeline, a scan sweeping the LLM target. The ticker slows to a
 * stop on hover or focus. Reduced motion shows the finished section with a still ticker.
 */

const COPY = {
  label: 'What we build',
  lead: ['Intelligence', 'for', 'the', 'work,'],
  accent: ['behind', 'your', 'business.'],
  body: 'Start with one high-friction task, then build a connected system around the way your team operates.',
}

const TICKER = ['CRM & sales', 'Forms & email', 'Project tools', 'Data & reports', 'Docs & knowledge', 'Support & inboxes']

const CARDS = {
  agents: {
    tag: '01 / Agents',
    title: 'Custom AI agents',
    body: 'Agents that read, decide and act inside your tools, with a person approving anything that matters.',
  },
  automation: {
    tag: '02 / Operations',
    title: 'Process automation',
    body: 'Triggers, rules and hand-offs that remove the repetitive steps between your systems.',
  },
  llm: {
    tag: '03 / APIs & LLMs',
    title: 'LLM integrations',
    body: 'Language models wired into your product and data, with guardrails and logging.',
  },
  data: {
    tag: '04 / Data',
    title: 'Data pipelines',
    body: 'Clean, reliable data moving between the places your team already works.',
  },
}

const CARD_BASE =
  'relative flex flex-col overflow-clip rounded-[1.25rem] p-6 transition-[transform,box-shadow] duration-300 ease-out will-change-transform hover:-translate-y-1 min-[1280px]:u-rounded-18 min-[1280px]:p-[calc(24*var(--u))] min-[1280px]:hover:-translate-y-[calc(4*var(--u))]'
const TAG = 'text-[0.6875rem] leading-4 font-semibold tracking-[0.12em] uppercase min-[1280px]:u-text-[10.5] min-[1280px]:leading-none [--tf:10px]'
const TITLE = 'font-display mt-5 text-[1.5rem] leading-[1.2] min-[1280px]:u-mt-22 min-[1280px]:u-text-[25] [--tf:21px]'
const BODY =
  'mb-3 mt-3 max-w-[22rem] text-[0.875rem] leading-[1.6] font-medium min-[1280px]:u-mt-20 min-[1280px]:u-text-[13.5] min-[1280px]:leading-[1.6] [--tf:12.5px]'

export function CapabilitiesSection() {
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
        const grid = one('[data-cp="grid"]')
        const words = all('[data-cp="word"]')
        const fades = all('[data-cp="fade"]')
        const cards = all('[data-cp="card"]')
        const track = one('[data-cp="track"]')

        gsap.set(grid, { autoAlpha: 0 })
        gsap.set(words, { yPercent: 115 })
        gsap.set(fades, { autoAlpha: 0, y: 18 })
        gsap.set(cards, { autoAlpha: 0, y: 26 })

        const entrance = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: el, start: 'top 72%', once: true },
        })
        entrance
          .to(grid, { autoAlpha: 1, duration: 1.2, ease: 'power1.out' }, 0)
          .to(words, { yPercent: 0, duration: 0.75, stagger: 0.05 }, 0.1)
          .to(fades, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.35)
          .to(cards, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1 }, 0.5)

        // Living details: all of them only play while the section is on screen.
        const loops: gsap.core.Animation[] = []

        const rings = all('[data-cp="ring"]')
        rings.forEach((r, i) => {
          loops.push(
            gsap.to(r, {
              rotation: i % 2 ? -360 : 360,
              duration: 18 + i * 9,
              ease: 'none',
              repeat: -1,
              transformOrigin: '50% 50%',
              paused: true,
            }),
          )
        })
        const core = one('[data-cp="core"]')
        if (core)
          loops.push(
            gsap.fromTo(
              core,
              { scale: 0.9, transformOrigin: '50% 50%' },
              { scale: 1.12, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true },
            ),
          )

        const ticks = all('[data-cp="tick"]')
        if (ticks.length) {
          const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.9, paused: true })
          gsap.set(ticks, { autoAlpha: 0, scale: 0.4, transformOrigin: '50% 50%' })
          ticks.forEach((t, i) => tl.to(t, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2.4)' }, 0.5 + i * 0.7))
          tl.to(ticks, { autoAlpha: 0, duration: 0.3, stagger: 0.05 }, 3.4)
          loops.push(tl)
        }

        const packet = one('[data-cp="packet"]')
        if (packet)
          loops.push(
            gsap.fromTo(
              packet,
              { xPercent: 0, autoAlpha: 0 },
              {
                keyframes: [
                  { autoAlpha: 1, duration: 0.2 },
                  { xPercent: 100, duration: 1.8, ease: 'power1.inOut' },
                  { autoAlpha: 0, duration: 0.2 },
                ],
                repeat: -1,
                repeatDelay: 0.4,
                paused: true,
              },
            ),
          )

        const scan = one('[data-cp="scan"]')
        if (scan)
          loops.push(
            gsap.fromTo(
              scan,
              { rotation: 0, transformOrigin: '50% 50%' },
              { rotation: 360, duration: 4.5, ease: 'none', repeat: -1, paused: true },
            ),
          )

        // The ticker: duplicated content slid by exactly half its width.
        let slide: gsap.core.Tween | undefined
        if (track) {
          slide = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1, paused: true })
          loops.push(slide)
        }

        const visible = ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => loops.forEach((l) => (self.isActive ? l.play() : l.pause())),
        })

        // Slow the ticker to a stop while it is hovered or focused.
        const band = one('[data-cp="band"]')
        let ease: gsap.core.Tween | undefined
        const setRate = (to: number) => {
          if (!slide) return
          ease?.kill()
          ease = gsap.to(slide, { timeScale: to, duration: 0.6, ease: 'power2.out', overwrite: true })
        }
        const stop = () => setRate(0)
        const go = () => setRate(1)
        band?.addEventListener('pointerenter', stop)
        band?.addEventListener('pointerleave', go)
        band?.addEventListener('focusin', stop)
        band?.addEventListener('focusout', go)

        return () => {
          band?.removeEventListener('pointerenter', stop)
          band?.removeEventListener('pointerleave', go)
          band?.removeEventListener('focusin', stop)
          band?.removeEventListener('focusout', go)
          ease?.kill()
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
      aria-labelledby="automation-capabilities-title"
      className="@container relative isolate overflow-clip bg-[linear-gradient(180deg,#dcf5d5_0%,#eaf8e4_38%,#ffffff_78%)] text-[#03171d]"
    >
      {/* A fine grid that fades out downwards. */}
      <div
        data-cp="grid"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[48%] [--u:calc(100cqw/1920)] [mask-image:linear-gradient(180deg,#000_0%,transparent_92%)] bg-[linear-gradient(rgb(129_216_112/0.28)_1px,transparent_1px),linear-gradient(90deg,rgb(129_216_112/0.28)_1px,transparent_1px)] bg-[size:3.25rem_3.25rem] min-[1280px]:bg-[size:calc(114*var(--u))_calc(114*var(--u))]"
      />

      <div className="[--u:calc(100cqw/1920)] max-[1279px]:px-5 max-[1279px]:pt-16 sm:max-[1279px]:px-10 sm:max-[1279px]:pt-20 min-[1280px]:u-pl-359 min-[1280px]:u-pr-359 min-[1280px]:u-pt-159">
        {/* Heading row. */}
        <div className="min-[1280px]:flex">
          <p
            data-cp="fade"
            className="flex items-center gap-2.5 text-[0.9375rem] leading-5 font-semibold min-[1280px]:u-w-270 min-[1280px]:flex-none min-[1280px]:u-mt-27 min-[1280px]:u-gap-10 min-[1280px]:u-text-[17.8] min-[1280px]:u-leading-20 [--tf:13px]"
          >
            <span className="size-2 rounded-full bg-green-500 shadow-[0_0_10px_rgb(129_216_112/0.8)] min-[1280px]:u-size-8" aria-hidden="true" />
            {COPY.label}
          </p>
          <div className="mt-5 min-[1280px]:mt-0">
            <h2
              id="automation-capabilities-title"
              className="font-display text-[clamp(2.1rem,8.6vw,3.25rem)] leading-[1.13] font-normal tracking-[-0.005em] min-[1280px]:u-text-[55.2] min-[1280px]:leading-[1.1] min-[1280px]:text-wrap! [--tf:30px]"
            >
              {COPY.lead.map((w) => (
                <span key={w}>
                  <span className="-mx-[0.1em] -mb-[0.2em] inline-block overflow-clip px-[0.1em] pb-[0.2em] align-bottom">
                    <span data-cp="word" className="inline-block">
                      {w}
                    </span>
                  </span>{' '}
                </span>
              ))}
              <br className="hidden min-[1280px]:block" />
              {COPY.accent.map((w, i) => (
                <span key={w}>
                  <span className="-mx-[0.1em] -mb-[0.2em] inline-block overflow-clip px-[0.1em] pb-[0.2em] align-bottom">
                    <span data-cp="word" className="inline-block">
                      <em className="text-green-500 italic">{w}</em>
                    </span>
                  </span>
                  {i < COPY.accent.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h2>
            <p
              data-cp="fade"
              className="mt-4 max-w-[34rem] text-[1rem] leading-[1.7] font-medium text-[#03171d]/60 min-[1280px]:u-mt-15 min-[1280px]:u-w-530 min-[1280px]:max-w-none min-[1280px]:u-text-[17.8] min-[1280px]:leading-[1.63] min-[1280px]:text-wrap! [--tf:14px]"
            >
              {COPY.body}
            </p>
          </div>
        </div>

        {/* The bento. */}
        <ul className="mt-10 grid gap-4 sm:max-[1279px]:grid-cols-2 min-[1280px]:u-mt-58 min-[1280px]:grid-cols-[441fr_361fr_361fr] min-[1280px]:grid-rows-[minmax(calc(222*var(--u)),auto)_minmax(calc(217*var(--u)),auto)] min-[1280px]:gap-x-[calc(13*var(--u))] min-[1280px]:gap-y-[calc(16*var(--u))]">
          {/* Custom AI agents: the dark anchor. */}
          <li
            data-cp="card"
            className={`${CARD_BASE} bg-[#03171d] text-white shadow-[0_18px_40px_-22px_rgb(3_23_29/0.7)] sm:max-[1279px]:col-span-2 min-[1280px]:row-span-2`}
          >
            <p className={`${TAG} text-green-500`}>{CARDS.agents.tag}</p>
            <h3 className={TITLE}>{CARDS.agents.title}</h3>
            <p className={`${BODY} text-white/55`}>{CARDS.agents.body}</p>
            <svg
              viewBox="0 0 200 200"
              aria-hidden="true"
              className="mt-8 ml-auto size-40 flex-none min-[1280px]:absolute min-[1280px]:right-[calc(18*var(--u))] min-[1280px]:bottom-0 min-[1280px]:mt-0 min-[1280px]:size-[calc(188*var(--u))] min-[1280px]:min-w-28"
            >
              <defs>
                <radialGradient id="cp-core" cx="50%" cy="50%" r="50%">
                  <stop offset="0" stopColor="#c8f5bd" />
                  <stop offset="0.55" stopColor="#81d870" />
                  <stop offset="1" stopColor="#81d870" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="100" cy="100" r="96" fill="rgb(129 216 112 / 0.05)" />
              <g data-cp="ring">
                <circle cx="100" cy="100" r="88" fill="none" stroke="rgb(129 216 112 / 0.35)" strokeWidth="1" strokeDasharray="2 6" />
                <circle cx="100" cy="12" r="3.5" fill="#81d870" />
              </g>
              <g data-cp="ring">
                <circle cx="100" cy="100" r="62" fill="none" stroke="rgb(129 216 112 / 0.5)" strokeWidth="1.2" strokeDasharray="38 12" />
                <circle cx="162" cy="100" r="3" fill="#c8f5bd" />
              </g>
              <circle cx="100" cy="100" r="36" fill="none" stroke="rgb(129 216 112 / 0.28)" strokeWidth="1" />
              <g data-cp="core">
                <circle cx="100" cy="100" r="30" fill="url(#cp-core)" />
              </g>
              <circle cx="100" cy="100" r="9" fill="#81d870" />
            </svg>
          </li>

          {/* Process automation. */}
          <li data-cp="card" className={`${CARD_BASE} border border-green-500/25 bg-[#e1f6da]`}>
            <p className={`${TAG} text-[#03171d]/55`}>{CARDS.automation.tag}</p>
            <h3 className={TITLE}>{CARDS.automation.title}</h3>
            <p className={`${BODY} text-[#03171d]/60`}>{CARDS.automation.body}</p>
            <div aria-hidden="true" className="mt-6 flex gap-2.5 self-end min-[1280px]:mt-auto min-[1280px]:gap-[calc(9*var(--u))]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="grid size-7 place-items-center rounded-md border border-[#03171d]/20 bg-white/70 min-[1280px]:size-[max(22px,calc(26*var(--u)))]"
                >
                  <svg viewBox="0 0 16 16" className="size-4/5 fill-none stroke-[#03171d] stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
                    <path data-cp="tick" d="m3.5 8.4 3 3 6-6.4" />
                  </svg>
                </span>
              ))}
            </div>
          </li>

          {/* LLM integrations. */}
          <li data-cp="card" className={`${CARD_BASE} border border-[#03171d]/10 bg-[#fbfaf3]`}>
            <p className={`${TAG} text-[#03171d]/55`}>{CARDS.llm.tag}</p>
            <h3 className={TITLE}>{CARDS.llm.title}</h3>
            <p className={`${BODY} text-[#03171d]/60`}>{CARDS.llm.body}</p>
            <svg
              viewBox="0 0 48 48"
              aria-hidden="true"
              className="mt-6 size-12 self-end min-[1280px]:mt-auto min-[1280px]:mr-[calc(36*var(--u))] min-[1280px]:size-[max(34px,calc(46*var(--u)))]"
            >
              <circle cx="24" cy="24" r="17" fill="none" stroke="#03171d" strokeOpacity="0.35" strokeWidth="1.2" />
              <circle cx="24" cy="24" r="8" fill="none" stroke="#03171d" strokeOpacity="0.55" strokeWidth="1.2" />
              <circle cx="24" cy="24" r="2.6" fill="#03171d" />
              <path d="M24 2v9M24 37v9M2 24h9M37 24h9" stroke="#03171d" strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round" />
              <g data-cp="scan">
                <path d="M24 24 24 7" stroke="#81d870" strokeWidth="2" strokeLinecap="round" />
                <circle cx="24" cy="7" r="2.6" fill="#81d870" />
              </g>
            </svg>
          </li>

          {/* Data pipelines. */}
          <li data-cp="card" className={`${CARD_BASE} border border-green-500/25 bg-[#e1f6da] sm:max-[1279px]:col-span-2 min-[1280px]:col-span-1 min-[1280px]:col-start-2`}>
            <p className={`${TAG} text-[#03171d]/55`}>{CARDS.data.tag}</p>
            <h3 className={TITLE}>{CARDS.data.title}</h3>
            <p className={`${BODY} text-[#03171d]/60`}>{CARDS.data.body}</p>
            <div
              aria-hidden="true"
              className="relative mt-6 h-5 w-32 self-end min-[1280px]:mt-auto min-[1280px]:h-[max(14px,calc(18*var(--u)))] min-[1280px]:w-[max(90px,calc(120*var(--u)))]"
            >
              <span className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-[#03171d]/25" />
              <span className="absolute top-1/2 left-0 size-2 -translate-y-1/2 rounded-full border border-[#03171d]/40 bg-white" />
              <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#03171d]/40 bg-white" />
              <span className="absolute top-1/2 right-0 size-2 -translate-y-1/2 rounded-full border border-[#03171d]/40 bg-green-500" />
              <span className="absolute inset-y-0 left-0 w-1/2">
                <span data-cp="packet" className="absolute top-1/2 left-0 size-2.5 -translate-y-1/2 rounded-full bg-green-500 shadow-[0_0_10px_rgb(129_216_112/0.9)]" />
              </span>
            </div>
          </li>
        </ul>
      </div>

      {/* The ticker: the tools it connects to. */}
      <div
        data-cp="band"
        className="[--u:calc(100cqw/1920)] mt-14 pb-12 min-[1280px]:mt-[calc(208*var(--u))] min-[1280px]:pb-[calc(40*var(--u))]"
      >
        <p className="sr-only">Connects to: {TICKER.join(', ')}.</p>
        <div className="overflow-clip max-[1279px]:[mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]" aria-hidden="true">
          <div data-cp="track" className="flex w-max will-change-transform">
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex flex-none items-center">
                {TICKER.map((t) => (
                  <li
                    key={t}
                    className="font-display flex items-center text-[1.75rem] leading-none whitespace-nowrap text-[#03171d] min-[1280px]:[font-size:max(34px,calc(76*var(--u)))]"
                  >
                    {t}
                    <span className="mx-6 h-px w-8 bg-[#03171d]/25 min-[1280px]:mx-[calc(20*var(--u))] min-[1280px]:w-[calc(32*var(--u))]" />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}