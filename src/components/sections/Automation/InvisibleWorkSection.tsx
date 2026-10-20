import { useRef, type CSSProperties, type ReactNode } from 'react'

import ghostRobot from '@/assets/images/automation-ghost-robot.svg?url'
import techGrid from '@/assets/images/cta-grid.png'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

/**
 * "Make the invisible work visible.": a dark section with a glowing hub, five tool cards
 * linked to it, and two faint robots at the edges.
 *
 * Design: 1920 x 1177. From `lg` the whole section is that design scaled as a unit (`--u` is
 * 1/1920 of the width). Below `lg` the hub gets its own 720 x 570 stage that fills the width,
 * with the copy under it and the robots hidden. Every hub coordinate below is in design px;
 * `--ox`/`--oy` shift them onto the small stage.
 *
 * Motion (GSAP, one ticker, only while the section is on screen):
 * - Entrance, once, on scroll: the disc and rings grow in, the cards pop on one by one with
 *   their links drawing to them, the headline rises word by word and "visible." lights up.
 * - Then it stays alive: each card drifts on its own slow loop and its link follows it, a
 *   light pulse travels from the hub to every card and makes the card ping when it lands,
 *   dots orbit the outer ring and the hub's tile turns.
 * - The pointer moves the layers by different amounts (cards most, the disc least, the robots
 *   against it) and scrolling slides the robots and the grid overlay for depth.
 * Reduced motion shows the finished section, still.
 */

const HUB = { x: 957, y: 445 } as const
const DESIGN_W = 1920

type Icon = 'window' | 'doc' | 'clip' | 'chat' | 'chart'
type Node = {
  id: string
  x: number
  y: number
  icon: Icon
  /** Parallax travel at full pointer deflection, in design px. */
  depth: number
  /** Drift: radius x, radius y, speeds and phase. */
  ax: number
  ay: number
  wx: number
  wy: number
  ph: number
  /** Seconds per pulse, and where in the loop it starts. */
  period: number
  offset: number
}
const NODES: readonly Node[] = [
  { id: 'a', x: 957, y: 263, icon: 'window', depth: 16, ax: 7, ay: 9, wx: 0.55, wy: 0.7, ph: 0.3, period: 3.4, offset: 0.0 },
  { id: 'b', x: 697, y: 411, icon: 'doc', depth: 24, ax: 9, ay: 8, wx: 0.62, wy: 0.5, ph: 1.9, period: 3.9, offset: 0.35 },
  { id: 'c', x: 1228, y: 398, icon: 'clip', depth: 18, ax: 8, ay: 10, wx: 0.48, wy: 0.66, ph: 3.1, period: 3.6, offset: 0.7 },
  { id: 'd', x: 735, y: 566, icon: 'chat', depth: 28, ax: 10, ay: 8, wx: 0.58, wy: 0.52, ph: 4.4, period: 4.2, offset: 0.15 },
  { id: 'e', x: 1109, y: 596, icon: 'chart', depth: 22, ax: 8, ay: 9, wx: 0.5, wy: 0.6, ph: 5.6, period: 3.8, offset: 0.55 },
]

const COPY = {
  label: 'Workflows you can see',
  words: ['Make', 'the', 'invisible', 'work'],
  accent: 'visible.',
  body: 'Automation earns trust when you can see it working. Every workflow we build shows what ran, what needs a person, and what happens next, so nothing disappears into a black box.',
  pill: 'Report ready',
  trace: 'REQUEST  ›  REVIEW  ›  ROUTE  ›  DONE',
} as const

/** Place something by its centre, in design px. */
const at = (x: number, y: number, w: number, h: number): CSSProperties => ({
  left: `calc((${x - w / 2} - var(--ox)) * var(--u))`,
  top: `calc((${y - h / 2} - var(--oy)) * var(--u))`,
  width: `calc(${w} * var(--u))`,
  height: `calc(${h} * var(--u))`,
})

function Glyph({ icon }: { icon: Icon }) {
  const body: Record<Icon, ReactNode> = {
    window: (
      <>
        <rect x="4" y="6" width="20" height="16" rx="3" />
        <path d="M4 11h20M8 8.5h.01M11 8.5h.01" />
      </>
    ),
    doc: (
      <>
        <rect x="6" y="4" width="16" height="20" rx="3" />
        <path d="M10 10h8M10 14h8M10 18h5" />
      </>
    ),
    clip: (
      <>
        <rect x="6" y="6" width="16" height="18" rx="3" />
        <path d="M11 6V4.5h6V6M10.5 15l2.5 2.5 5-5" />
      </>
    ),
    chat: (
      <>
        <rect x="4" y="5" width="20" height="14" rx="4" />
        <path d="M10 19v4l4.5-4M9 11.5h10" />
      </>
    ),
    chart: (
      <>
        <path d="M5 22V6M5 22h18" />
        <path d="m9 17 4-4 3 3 6-7" />
      </>
    ),
  }
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 28 28"
      fill="none"
      stroke="#5b7365"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {body[icon]}
    </svg>
  )
}

export function InvisibleWorkSection() {
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
        const disc = all('[data-iw="disc"]')
        const rings = all<SVGGeometryElement>('[data-iw="ring"]')
        const tile = all('[data-iw="tile"]')
        const lines = all<SVGLineElement>('[data-iw="line"]')
        const pulses = all<SVGCircleElement>('[data-iw="pulse"]')
        const cards = all('[data-iw="card"]')
        const floats = all('[data-iw="float"]')
        const pings = all('[data-iw="ping"]')
        const pill = all('[data-iw="pill"]')
        const dots = all('[data-iw="dot"]')
        const robots = all('[data-iw="robot"]')
        const words = all('[data-iw="word"]')
        const fades = all('[data-iw="fade"]')
        const accent = one('[data-iw="accent"]')
        const orbit = one<SVGGElement>('[data-iw="orbit"]')
        const gear = one('[data-iw="gear"]')
        const grid = one('[data-iw="grid"]')
        const trace = one('[data-iw="trace"]')
        const hubGlow = one('[data-iw="glow"]')
        const svg = one<SVGSVGElement>('[data-iw="svg"]')
        const tileEl = tile[0]
        const discEl = disc[0]
        const pillEl = pill[0]
        const linkDot = dots[1]
        if (!svg) return

        // ---- start state ----
        gsap.set(disc, { scale: 0.7, autoAlpha: 0, transformOrigin: '50% 50%' })
        gsap.set(rings, { strokeDasharray: 1, strokeDashoffset: 1 })
        gsap.set(tile, { scale: 0.6, autoAlpha: 0, transformOrigin: '50% 50%' })
        gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 })
        gsap.set(cards, { scale: 0.6, autoAlpha: 0, transformOrigin: '50% 50%' })
        gsap.set(pings, { autoAlpha: 0 })
        gsap.set(pill, { autoAlpha: 0, x: -14 })
        gsap.set(dots, { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' })
        gsap.set(robots, { autoAlpha: 0 })
        gsap.set(words, { yPercent: 115 })
        gsap.set(fades, { autoAlpha: 0, y: 18 })
        gsap.set([trace, hubGlow, grid], { autoAlpha: 0 })

        // ---- live state ----
        let armed = false // pulses and drift start once the entrance has landed
        let u = 1 // screen px per design px
        const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
        const lastP = NODES.map(() => 0)
        const measure = () => {
          u = svg.getBoundingClientRect().width / DESIGN_W || 1
        }
        measure()
        const ro = new ResizeObserver(measure)
        ro.observe(svg)

        const setCardX = floats.map((f) => gsap.quickSetter(f, 'x', 'px') as (v: number) => void)
        const setCardY = floats.map((f) => gsap.quickSetter(f, 'y', 'px') as (v: number) => void)
        const setRobot = robots.map((r, i) => ({
          x: gsap.quickSetter(r, 'x', 'px') as (v: number) => void,
          y: gsap.quickSetter(r, 'y', 'px') as (v: number) => void,
          r: gsap.quickSetter(r, 'rotation', 'deg') as (v: number) => void,
          i,
        }))
        const move = (target: Element | undefined) =>
          target
            ? {
                x: gsap.quickSetter(target, 'x', 'px') as (v: number) => void,
                y: gsap.quickSetter(target, 'y', 'px') as (v: number) => void,
              }
            : null
        const discMove = move(discEl)
        const tileMove = move(tileEl)
        const pillMove = move(pillEl)
        const linkMove = move(linkDot)
        const gridMove = move(grid ?? undefined)

        const ping = (i: number) => {
          const ring = pings[i]
          const card = cards[i]
          if (!ring) return
          gsap.fromTo(
            ring,
            { scale: 1, autoAlpha: 0.55 },
            { scale: 1.55, autoAlpha: 0, duration: 1.1, ease: 'power2.out', overwrite: true },
          )
          gsap.fromTo(card, { scale: 1 }, { scale: 1.06, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: 'auto' })
        }

        const tick = (time: number, deltaMs: number) => {
          const dt = Math.min(deltaMs, 50) / 1000
          const k = 1 - Math.exp(-dt * 4.5)
          pointer.x += (pointer.tx - pointer.x) * k
          pointer.y += (pointer.ty - pointer.y) * k
          const t = time

          // Depth: layers move by different amounts with the pointer.
          discMove?.x(pointer.x * 8 * u)
          discMove?.y(pointer.y * 8 * u)
          tileMove?.x(pointer.x * 14 * u)
          tileMove?.y(pointer.y * 14 * u)
          pillMove?.x(pointer.x * 22 * u)
          pillMove?.y(pointer.y * 22 * u)
          linkMove?.x(pointer.x * 22 * u)
          linkMove?.y(pointer.y * 22 * u)
          gridMove?.x(pointer.x * -10 * u)
          gridMove?.y(pointer.y * -10 * u)
          setRobot.forEach(({ x, y, r, i }) => {
            const s = i ? 1 : -1
            const bob = armed ? Math.sin(t * (0.5 + i * 0.12) + i) * 10 : 0
            x(pointer.x * -30 * u * (i ? 1.2 : 1))
            y((pointer.y * -22 + bob) * u)
            r(armed ? Math.sin(t * 0.4 + i * 2) * 1.6 * s : 0)
          })

          if (orbit) orbit.setAttribute('transform', `rotate(${(t * 6) % 360} ${HUB.x} ${HUB.y})`)
          if (gear) gsap.set(gear, { rotation: t * 14 })
          if (!armed) return

          NODES.forEach((n, i) => {
            // The card drifts on its own loop, plus the pointer's push.
            const dx = Math.sin(t * n.wx + n.ph) * n.ax + pointer.x * n.depth
            const dy = Math.cos(t * n.wy + n.ph) * n.ay + pointer.y * n.depth
            setCardX[i](dx * u)
            setCardY[i](dy * u)
            const cx = n.x + dx
            const cy = n.y + dy
            const line = lines[i]
            line?.setAttribute('x1', String(HUB.x + pointer.x * 14))
            line?.setAttribute('y1', String(HUB.y + pointer.y * 14))
            line?.setAttribute('x2', String(cx))
            line?.setAttribute('y2', String(cy))

            // A pulse leaves the hub, travels the link and pings the card on arrival.
            const p = ((t / n.period + n.offset) % 1 + 1) % 1
            if (p < lastP[i] - 0.5) ping(i)
            lastP[i] = p
            const pulse = pulses[i]
            if (pulse) {
              const e = p * p * (3 - 2 * p)
              pulse.setAttribute('cx', String(HUB.x + pointer.x * 14 + (cx - HUB.x - pointer.x * 14) * e))
              pulse.setAttribute('cy', String(HUB.y + pointer.y * 14 + (cy - HUB.y - pointer.y * 14) * e))
              pulse.setAttribute('opacity', String(Math.min(1, Math.sin(Math.PI * p) * 1.6) * 0.95))
            }
          })
        }

        // ---- entrance ----
        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          paused: true,
          onComplete: () => {
            armed = true
            if (visible) gsap.ticker.add(tick)
          },
        })
        tl.to(hubGlow, { autoAlpha: 1, duration: 1.6, ease: 'power1.out' }, 0)
        tl.to(grid, { autoAlpha: 1, duration: 1.8, ease: 'power1.out' }, 0)
        tl.to(disc, { scale: 1, autoAlpha: 1, duration: 1.1, ease: 'power2.out' }, 0)
        tl.to(rings, { strokeDashoffset: 0, duration: 1.4, stagger: 0.15, ease: 'power2.inOut' }, 0.1)
        tl.to(tile, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.8)' }, 0.35)
        tl.to(lines, { strokeDashoffset: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' }, 0.6)
        tl.to(cards, { scale: 1, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(1.8)' }, 0.75)
        tl.to(dots, { scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.2, ease: 'back.out(3)' }, 1.3)
        tl.to(pill, { autoAlpha: 1, x: 0, duration: 0.7 }, 1.5)
        tl.to(trace, { autoAlpha: 1, duration: 0.9 }, 1.2)
        tl.to(robots, { autoAlpha: 1, duration: 1.8, ease: 'power1.out' }, 0.2)
        tl.to(fades[0], { autoAlpha: 1, y: 0, duration: 0.55 }, 0.9)
        tl.to(words, { yPercent: 0, duration: 0.85, stagger: 0.07 }, 1)
        tl.to(fades.slice(1), { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 1.25)
        if (accent) {
          tl.fromTo(
            accent,
            { textShadow: '0 0 0px rgba(129,216,112,0)' },
            { textShadow: '0 0 30px rgba(129,216,112,0.6)', duration: 0.7, yoyo: true, repeat: 1, ease: 'sine.inOut' },
            1.55,
          )
        }

        // ---- scroll: play once, run the ticker only while on screen, slide layers for depth ----
        let visible = false
        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top 72%',
          end: 'bottom top',
          onEnter: () => tl.play(),
          onToggle: (self) => {
            visible = self.isActive
            gsap.ticker.remove(tick)
            if (visible && armed) gsap.ticker.add(tick)
          },
        })
        const parallax = [
          gsap.fromTo(
            robots,
            { yPercent: -7 },
            {
              yPercent: 7,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
            },
          ),
        ]

        // ---- pointer ----
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
          parallax.forEach((p) => p.scrollTrigger?.kill())
          tl.kill()
        }
      })
    },
    { scope: root, dependencies: [motion] },
  )

  return (
    <section
      ref={root}
      aria-labelledby="automation-visible-title"
      className="@container relative isolate overflow-clip bg-[#03171d] text-white"
    >
      {/* Backdrop: green wash from the top left, slate toward the bottom right, a faint mesh. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 61% 88% at 0% 0%, rgb(129 216 112 / 0.44) 0%, rgb(129 216 112 / 0.38) 20%, rgb(129 216 112 / 0.28) 42%, rgb(129 216 112 / 0.15) 70%, rgb(129 216 112 / 0) 100%)',
            'radial-gradient(ellipse 88% 128% at 100% 100%, rgb(28 46 51 / 0.97) 0%, rgb(28 46 51 / 0.62) 30%, rgb(28 46 51 / 0.3) 65%, rgb(28 46 51 / 0) 100%)',
          ].join(', '),
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-20 [background-image:radial-gradient(circle,rgb(3_23_29/0.9)_2px,transparent_2.5px),linear-gradient(rgb(3_23_29/0.5)_1px,transparent_1px),linear-gradient(90deg,rgb(3_23_29/0.5)_1px,transparent_1px)] [background-position:57px_95px] [background-size:164px_164px] lg:[background-position:calc(57*100cqw/1920)_calc(95*100cqw/1920)] lg:[background-size:calc(164*100cqw/1920)_calc(164*100cqw/1920)]"
      />
      {/* Circuit nodes, at 5%, drifting against the pointer. */}
      <div data-iw="grid" aria-hidden="true" className="pointer-events-none absolute -inset-[3%] -z-10">
        <img
          src={techGrid}
          alt=""
          width={1774}
          height={887}
          loading="lazy"
          decoding="async"
          className="size-full object-cover opacity-[0.05]"
        />
      </div>

      <div className="[--u:calc(100cqw/1920)] lg:u-h-1177 relative px-5 py-14 sm:px-10 sm:py-20 lg:p-0">
        {/* Faint robots at the edges (wide screens only). */}
        <div className="hidden lg:block" aria-hidden="true">
          {[
            { left: -138, top: 186 },
            { left: 1375, top: 528 },
          ].map((r) => (
            <div
              key={r.left}
              data-iw="robot"
              className="absolute"
              style={{
                left: `calc(${r.left} * var(--u))`,
                top: `calc(${r.top} * var(--u))`,
                width: `calc(600 * var(--u))`,
                // Crop to the figure: the artwork's orbit lines are left out.
                clipPath: 'inset(17% 29% 25.8% 35.7%)',
              }}
            >
              <img
                src={ghostRobot}
                alt=""
                width={631}
                height={559}
                loading="lazy"
                decoding="async"
                className="block w-full opacity-[0.12] blur-[0.6px]"
              />
            </div>
          ))}
        </div>

        {/* The hub. */}
        <div
          role="img"
          aria-label="A central workflow hub connected to five tools: a window, a document, a checklist, a chat and a chart."
          className="@container relative mx-auto aspect-[720/570] w-full max-w-[44rem] [--ox:600] [--oy:150] [--u:calc(100cqw/720)] lg:absolute lg:inset-0 lg:mx-0 lg:aspect-auto lg:max-w-none lg:[--ox:0] lg:[--oy:0] lg:[--u:calc(100cqw/1920)]"
        >
          <div aria-hidden="true" className="absolute inset-0">
            {/* Glow behind the hub. */}
            <div
              data-iw="glow"
              className="absolute rounded-full"
              style={{
                ...at(HUB.x, HUB.y, 760, 760),
                background:
                  'radial-gradient(closest-side, rgb(129 216 112 / 0.26), rgb(129 216 112 / 0.08) 60%, transparent)',
              }}
            />

            {/* Grey ring and the disc. */}
            <div
              data-iw="disc"
              className="absolute rounded-full"
              style={{
                ...at(HUB.x, HUB.y, 438, 438),
                background:
                  'radial-gradient(circle at 50% 38%, #5da656 0%, #447f47 30%, #2f5f3a 66%, #234a31 100%)',
                boxShadow: '0 0 0 calc(19 * var(--u)) rgb(190 205 200 / 0.22)',
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                ...at(HUB.x, HUB.y, 438, 438),
                boxShadow: 'inset 0 calc(-20 * var(--u)) calc(60 * var(--u)) rgb(3 23 29 / 0.35)',
              }}
            />

            {/* Everything drawn in design coordinates: rings, orbiting dots, links, pulses. */}
            <svg
              data-iw="svg"
              className="absolute overflow-visible"
              style={{
                left: 'calc(var(--ox) * var(--u) * -1)',
                top: 'calc(var(--oy) * var(--u) * -1)',
                width: `calc(${DESIGN_W} * var(--u))`,
                height: `calc(1177 * var(--u))`,
              }}
              viewBox={`0 0 ${DESIGN_W} 1177`}
              fill="none"
            >
              <defs>
                <filter id="iw-glow" x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation="4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="iw-line" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0.2" stopColor="#b8f0ac" stopOpacity="0" />
                  <stop offset="1" stopColor="#b8f0ac" stopOpacity="0.55" />
                </linearGradient>
              </defs>

              {/* Faint bokeh, as in the design. */}
              <circle cx="1332" cy="433" r="24" fill="#81d870" fillOpacity="0.07" />
              <circle cx="919" cy="783" r="24" fill="#81d870" fillOpacity="0.07" />

              <circle cx={HUB.x} cy={HUB.y} r="280" stroke="#81d870" strokeOpacity="0.08" strokeWidth="1" />
              <circle
                data-iw="ring"
                cx={HUB.x}
                cy={HUB.y}
                r="262"
                stroke="#81d870"
                strokeOpacity="0.17"
                strokeWidth="1"
                strokeDasharray="2 8"
                pathLength={1}
              />
              <g data-iw="orbit">
                {[0, 118, 241].map((a) => (
                  <circle
                    key={a}
                    cx={HUB.x + 262 * Math.cos((a * Math.PI) / 180)}
                    cy={HUB.y + 262 * Math.sin((a * Math.PI) / 180)}
                    r="3.2"
                    fill="#c9f5bf"
                    fillOpacity="0.85"
                    filter="url(#iw-glow)"
                  />
                ))}
              </g>

              {NODES.map((n) => (
                <line
                  key={n.id}
                  data-iw="line"
                  x1={HUB.x}
                  y1={HUB.y}
                  x2={n.x}
                  y2={n.y}
                  stroke="#b8f0ac"
                  strokeOpacity="0.4"
                  strokeWidth="1.5"
                  pathLength={1}
                />
              ))}
              {NODES.map((n) => (
                <circle
                  key={n.id}
                  data-iw="pulse"
                  cx={HUB.x}
                  cy={HUB.y}
                  r="4.5"
                  fill="#e4ffdc"
                  filter="url(#iw-glow)"
                  opacity="0"
                />
              ))}
            </svg>

            {/* Centre tile. */}
            <div
              data-iw="tile"
              className="absolute"
              style={{
                ...at(HUB.x, HUB.y, 150, 150),
                borderRadius: 'calc(44 * var(--u))',
                background: 'linear-gradient(135deg, #6bb862 0%, #3f8445 45%, #123a2a 100%)',
                boxShadow:
                  '0 calc(18 * var(--u)) calc(40 * var(--u)) rgb(3 23 29 / 0.45), inset 0 calc(1.5 * var(--u)) 0 rgb(255 255 255 / 0.28)',
              }}
            >
              <div data-iw="gear" className="absolute inset-[30%]">
                <svg viewBox="0 0 48 48" className="size-full" fill="none" stroke="#dff5da" strokeOpacity="0.72" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M24 6v36M8.4 15l31.2 18M8.4 33l31.2-18" />
                  <circle cx="24" cy="24" r="5" />
                </svg>
              </div>
            </div>

            {/* Tool cards. */}
            {NODES.map((n) => (
              <div key={n.id} className="absolute" style={at(n.x, n.y, 79, 79)}>
                <div data-iw="card" className="size-full">
                  <div data-iw="float" className="relative size-full">
                    <span
                      data-iw="ping"
                      className="absolute inset-0 border-2 border-green-500/70"
                      style={{ borderRadius: 'calc(22 * var(--u))' }}
                    />
                    <div
                      className="relative size-full bg-[#eef3ed]"
                      style={{
                        borderRadius: 'calc(22 * var(--u))',
                        boxShadow: '0 calc(14 * var(--u)) calc(30 * var(--u)) rgb(0 0 0 / 0.35)',
                        padding: 'calc(26 * var(--u))',
                      }}
                    >
                      <Glyph icon={n.icon} />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Status pill and the nodes it hangs from. */}
            <div className="absolute" style={at(1226, 664, 157, 44)}>
              <div
                data-iw="pill"
                className="flex size-full items-center bg-[#dfe5e0] font-semibold whitespace-nowrap text-teal-900"
                style={{
                  borderRadius: 'calc(12 * var(--u))',
                  paddingLeft: 'calc(15 * var(--u))',
                  gap: 'calc(9 * var(--u))',
                  fontSize: 'max(9px, calc(12 * var(--u)))',
                  boxShadow: '0 calc(10 * var(--u)) calc(24 * var(--u)) rgb(0 0 0 / 0.3)',
                }}
              >
                <span className="rounded-[2px] bg-green-500" style={{ width: 'calc(10 * var(--u))', height: 'calc(10 * var(--u))' }} />
                {COPY.pill}
              </div>
            </div>
            {[
              [957, 20, 12],
              [1134, 647, 12],
            ].map(([x, y, s]) => (
              <div
                key={`${x}-${y}`}
                data-iw="dot"
                className="absolute rounded-full bg-green-500"
                style={{ ...at(x, y, s, s), boxShadow: '0 0 calc(14 * var(--u)) rgb(129 216 112 / 0.85)' }}
              />
            ))}

            {/* A faint trace line above the hub, as in the design (wide screens). */}
            <p
              data-iw="trace"
              className="absolute hidden font-medium whitespace-nowrap text-[#b9d86a]/55 lg:block"
              style={{
                left: 'calc(596 * var(--u))',
                top: 'calc(194 * var(--u))',
                fontSize: 'calc(9 * var(--u))',
                letterSpacing: '0.18em',
              }}
            >
              {COPY.trace}
            </p>
          </div>
        </div>

        {/* Copy. */}
        <div className="relative mx-auto mt-10 max-w-[44rem] lg:absolute lg:u-left-556 lg:u-top-833 lg:u-w-800 lg:mx-0 lg:mt-0 lg:max-w-none">
          <p
            data-iw="fade"
            className="flex items-center gap-2.5 text-[0.9375rem] leading-5 font-medium text-green-500 lg:u-gap-10 lg:u-text-16 lg:u-leading-20 [--tf:13px]"
          >
            <span className="size-2 rounded-[1px] bg-green-500 lg:u-size-8" aria-hidden="true" />
            {COPY.label}
          </p>
          <h2
            id="automation-visible-title"
            className="font-display mt-4 text-[clamp(2.25rem,9.5vw,3.5rem)] leading-[1.15] font-normal tracking-[-0.005em] lg:u-mt-45 lg:u-text-[55.2] lg:leading-[1.13] lg:text-wrap! [--tf:30px]"
          >
            {COPY.words.map((w) => (
              <span key={w}>
                <span className="-mx-[0.1em] -mb-[0.2em] inline-block overflow-clip px-[0.1em] pb-[0.2em] align-bottom">
                  <span data-iw="word" className="inline-block">
                    {w}
                  </span>
                </span>{' '}
              </span>
            ))}
            <span className="-mx-[0.1em] -mb-[0.2em] inline-block overflow-clip px-[0.1em] pb-[0.2em] align-bottom">
              <span data-iw="word" className="inline-block">
                <em data-iw="accent" className="text-green-500 italic">
                  {COPY.accent}
                </em>
              </span>
            </span>
          </h2>
          <p
            data-iw="fade"
            className="mt-5 text-[1rem] leading-[1.7] font-medium text-white/60 lg:u-mt-38 lg:u-text-[17.8] lg:leading-[1.63] lg:text-wrap! [--tf:14px]"
          >
            {COPY.body}
          </p>
        </div>
      </div>
    </section>
  )
}