import { useEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'

import dkMark from '@/assets/images/dk-mark.svg?url'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

import { AboutHeroScene } from './AboutHeroScene'
import { HERO_CARDS } from './aboutHeroData'
import {
  chartLayout,
  createSceneState,
  type HeroSceneState,
} from './aboutHeroLayout'
import './AboutHero.css'

const TITLE_LINES = ['Built for', 'what comes', 'Next.'] as const

/** Pointer parallax travel in px for a card of depth 1. */
const PARALLAX_X = 14
const PARALLAX_Y = 10
/** Card tilt toward the pointer, in degrees. */
const TILT = 7

export function AboutHero() {
  const reduced = useReducedMotion()
  const root = useRef<HTMLElement>(null)
  const hub = useRef<HTMLDivElement>(null)
  const state = useRef<HeroSceneState>(createSceneState())

  /**
   * Keeps the chart geometry in sync with the hero's size. The 3D scene reads it every
   * frame, and the static fallback image reads it through CSS variables.
   */
  useEffect(() => {
    const el = root.current
    if (!el) return
    const s = state.current

    const apply = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (!w || !h) return
      const layout = chartLayout(w, h)
      s.layout = layout
      el.style.setProperty('--ah-chart-w', `${layout.w.toFixed(1)}px`)
      el.style.setProperty('--ah-chart-l', `${layout.left.toFixed(1)}px`)
      el.style.setProperty('--ah-chart-t', `${layout.top.toFixed(1)}px`)
      s.invalidate?.()
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useGSAP(
    () => {
      const el = root.current
      const hubEl = hub.current
      if (!el || !hubEl) return
      const s = state.current

      const all = <T extends HTMLElement>(selector: string) =>
        gsap.utils.toArray<T>(selector, el)

      const mm = gsap.matchMedia(el)

      // Only the reduced-motion preference rebuilds everything. Breakpoint-dependent
      // values are read when they are used, so turning a phone sideways never replays the intro.
      const isSplit = () => window.matchMedia('(min-width: 768px)').matches

      mm.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          reduce: '(prefers-reduced-motion: reduce)',
        },
        (ctx) => {
          const cond = (ctx.conditions ?? {}) as Record<string, boolean>

          // Reduced motion: everything is already in its final place. Show the
          // chart fully drawn and the marker under "Next.", and stop there.
          if (!cond.motion) {
            s.reveal = 1
            el.dataset.mark = 'on'
            s.invalidate?.()
            return
          }

          delete el.dataset.mark
          s.reveal = 0

          const cleanups: Array<() => void> = []
          const slots = all('.dk-ah__slot')
          const floats = all('.dk-ah__float')
          const ripples = all('.dk-ah__ripple')

          /* ------------------------------ Entrance ------------------------------ */

          // Measured before any transform is applied, so each card knows where the hub is.
          const hubBox = hubEl.getBoundingClientRect()
          const hubX = hubBox.left + hubBox.width / 2
          const hubY = hubBox.top + hubBox.height / 2

          let ready = false
          let inView = true
          let parallax: Array<{
            x: (v: number) => unknown
            y: (v: number) => unknown
          }> | null = null

          const floatTweens = floats.map((node, i) => {
            const card = HERO_CARDS[i]
            const travel = card.float * (isSplit() ? 1 : 0.6)
            return gsap.to(node, {
              y: i % 2 ? travel : -travel,
              duration: card.floatDur,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              paused: true,
            })
          })
          const syncFloat = () =>
            floatTweens.forEach((t) => (ready && inView ? t.play() : t.pause()))

          // Idle float only runs while the hero is on screen.
          ScrollTrigger.create({
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => {
              inView = self.isActive
              syncFloat()
            },
          })

          const settle = () => {
            ready = true
            parallax = slots.map((slot) => ({
              x: gsap.quickTo(slot, 'x', { duration: 1, ease: 'power3.out' }),
              y: gsap.quickTo(slot, 'y', { duration: 1, ease: 'power3.out' }),
            }))
            syncFloat()
          }

          const intro = gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: settle,
          })

          intro
            .from(
              all('.dk-ah__crumbs'),
              { autoAlpha: 0, y: 8, duration: 0.5 },
              0.05,
            )
            .from(
              all('[data-ah="label"]'),
              { autoAlpha: 0, x: -12, duration: 0.5 },
              0.12,
            )
            .from(
              all('.dk-ah__line > span'),
              {
                yPercent: 110,
                duration: 0.85,
                stagger: 0.09,
                ease: 'power4.out',
              },
              0.15,
            )
            .call(
              () => {
                el.dataset.mark = 'on'
              },
              undefined,
              0.95,
            )
            .from(
              all('[data-ah="aside"]'),
              { autoAlpha: 0, y: 18, duration: 0.6, stagger: 0.1 },
              0.35,
            )
            .from(
              hubEl,
              {
                autoAlpha: 0,
                scale: 0.6,
                duration: 0.7,
                ease: 'back.out(1.5)',
              },
              0.3,
            )
            .fromTo(
              ripples,
              { scale: 0.9, autoAlpha: 0.55 },
              {
                scale: 2.6,
                autoAlpha: 0,
                duration: 1.5,
                stagger: 0.28,
                ease: 'power2.out',
              },
              0.45,
            )
            .to(
              s,
              {
                reveal: 1,
                duration: 1.8,
                ease: 'power2.inOut',
                onUpdate: () => s.invalidate?.(),
              },
              0.5,
            )

          // The cards leave the hub and settle into their places, one after another.
          slots.forEach((slot, i) => {
            const box = slot.getBoundingClientRect()
            const card = HERO_CARDS[i]
            const start = 0.55 + i * 0.09
            intro.fromTo(
              slot,
              {
                x: hubX - (box.left + box.width / 2),
                y: hubY - (box.top + box.height / 2),
                scale: 0.35,
                rotation: (i % 2 ? 1 : -1) * 14,
                autoAlpha: 0,
              },
              {
                x: 0,
                y: 0,
                scale: 1,
                rotation: card.tilt,
                autoAlpha: 1,
                duration: 1.05,
                ease: 'expo.out',
              },
              start,
            )
            const text = slot.querySelectorAll('.dk-ah__tag, .dk-ah__caption')
            intro.from(
              text,
              { autoAlpha: 0, y: 10, duration: 0.6, stagger: 0.08 },
              start + 0.45,
            )
          })

          /* ------------------------------- Scroll ------------------------------- */

          // Nearer cards drift further, so the stage gains depth as the page scrolls.
          slots.forEach((slot, i) => {
            gsap.to(slot, {
              yPercent: () => -HERO_CARDS[i].depth * (isSplit() ? 7 : 3),
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
              },
            })
          })

          ScrollTrigger.create({
            trigger: el,
            start: 'top top',
            end: 'bottom top',
            onUpdate: (self) => {
              s.scroll = self.progress
            },
          })

          /* ------------------------------ Pointer ------------------------------- */

          const bindPointer = () => {
            // Touch has no hover, so these handlers ignore touch pointers. A tap would
            // otherwise leave the scene stuck in its hovered state.
            const mouseLike = (e: PointerEvent) => e.pointerType !== 'touch'

            const pxTo = gsap.quickTo(s, 'px', {
              duration: 0.35,
              ease: 'power3.out',
            })
            const pyTo = gsap.quickTo(s, 'py', {
              duration: 0.35,
              ease: 'power3.out',
            })
            const hoverTo = gsap.quickTo(s, 'hover', {
              duration: 0.6,
              ease: 'power2.out',
            })
            const hubXTo = gsap.quickTo(hubEl, 'x', {
              duration: 0.9,
              ease: 'power3.out',
            })
            const hubYTo = gsap.quickTo(hubEl, 'y', {
              duration: 0.9,
              ease: 'power3.out',
            })

            const onEnter = (e: PointerEvent) => {
              if (!mouseLike(e)) return
              const r = el.getBoundingClientRect()
              // Start from where the pointer is, so the glow doesn't sweep in from far away.
              s.px = e.clientX - r.left
              s.py = e.clientY - r.top
              hoverTo(1)
            }

            const onMove = (e: PointerEvent) => {
              if (!mouseLike(e)) return
              const r = el.getBoundingClientRect()
              if (!r.width || !r.height) return
              const lx = e.clientX - r.left
              const ly = e.clientY - r.top
              pxTo(lx)
              pyTo(ly)

              const nx = (lx / r.width) * 2 - 1
              const ny = (ly / r.height) * 2 - 1
              hubXTo(nx * 8)
              hubYTo(ny * 6)
              parallax?.forEach((p, i) => {
                const depth = HERO_CARDS[i].depth
                p.x(-nx * PARALLAX_X * depth)
                p.y(-ny * PARALLAX_Y * depth)
              })
            }

            const onLeave = () => {
              hoverTo(0)
              hubXTo(0)
              hubYTo(0)
              parallax?.forEach((p) => {
                p.x(0)
                p.y(0)
              })
            }

            el.addEventListener('pointerenter', onEnter)
            el.addEventListener('pointermove', onMove)
            el.addEventListener('pointerleave', onLeave)
            cleanups.push(() => {
              el.removeEventListener('pointerenter', onEnter)
              el.removeEventListener('pointermove', onMove)
              el.removeEventListener('pointerleave', onLeave)
            })

            // The hub answers a hover with a ripple, once per visit.
            const onHubEnter = (e: PointerEvent) => {
              if (!ready || !mouseLike(e)) return
              gsap.fromTo(
                ripples,
                { scale: 1, autoAlpha: 0.5 },
                {
                  scale: 2.2,
                  autoAlpha: 0,
                  duration: 1.1,
                  stagger: 0.2,
                  ease: 'power2.out',
                  overwrite: 'auto',
                },
              )
            }
            hubEl.addEventListener('pointerenter', onHubEnter)
            cleanups.push(() =>
              hubEl.removeEventListener('pointerenter', onHubEnter),
            )

            // Each card tilts toward the pointer and catches a highlight.
            slots.forEach((slot) => {
              const card = slot.querySelector<HTMLElement>('.dk-ah__card')
              if (!card) return

              gsap.set(card, { transformPerspective: 900 })
              const rx = gsap.quickTo(card, 'rotationX', {
                duration: 0.5,
                ease: 'power3.out',
              })
              const ry = gsap.quickTo(card, 'rotationY', {
                duration: 0.5,
                ease: 'power3.out',
              })
              const sc = gsap.quickTo(card, 'scale', {
                duration: 0.5,
                ease: 'power3.out',
              })

              const enter = (e: PointerEvent) => {
                if (mouseLike(e)) sc(1.035)
              }
              const move = (e: PointerEvent) => {
                if (!mouseLike(e)) return
                const r = card.getBoundingClientRect()
                if (!r.width || !r.height) return
                const cx = (e.clientX - r.left) / r.width
                const cy = (e.clientY - r.top) / r.height
                ry((cx * 2 - 1) * TILT)
                rx(-(cy * 2 - 1) * TILT)
                card.style.setProperty('--mx', `${(cx * 100).toFixed(1)}%`)
                card.style.setProperty('--my', `${(cy * 100).toFixed(1)}%`)
              }
              const leave = () => {
                rx(0)
                ry(0)
                sc(1)
              }

              slot.addEventListener('pointerenter', enter)
              slot.addEventListener('pointermove', move)
              slot.addEventListener('pointerleave', leave)
              cleanups.push(() => {
                slot.removeEventListener('pointerenter', enter)
                slot.removeEventListener('pointermove', move)
                slot.removeEventListener('pointerleave', leave)
              })
            })
          }
          bindPointer()

          return () => cleanups.forEach((fn) => fn())
        },
      )

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="dk-ah" aria-labelledby="about-hero-title">
      <div className="dk-ah__bg" aria-hidden="true">
        <AboutHeroScene state={state} motion={!reduced} />
      </div>

      <div className="container-page dk-ah__inner">
        <nav className="dk-ah__crumbs" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li aria-current="page">About</li>
          </ol>
        </nav>

        <div className="dk-ah__top">
          <div className="dk-ah__title">
            <p className="dk-ah__label" data-ah="label">
              <span className="dk-ah__label-dot" aria-hidden="true" />
              About
            </p>

            <h1 id="about-hero-title" className="dk-ah__h1">
              {TITLE_LINES.map((line, i) => (
                <span className="dk-ah__line" key={line}>
                  <span>
                    {i === TITLE_LINES.length - 1 ? (
                      <em className="dk-ah__accent">{line}</em>
                    ) : (
                      line
                    )}
                  </span>
                </span>
              ))}
            </h1>
          </div>

          <div className="dk-ah__aside">
            <p className="dk-ah__kicker" data-ah="aside">
              Strategy. Design. Digital growth.
            </p>
            <p className="dk-ah__sub" data-ah="aside">
              Thoughtful digital experiences for businesses ready to move
              forward.
            </p>
          </div>
        </div>
      </div>

      <div className="dk-ah__stage">
        <div ref={hub} className="dk-ah__hub" aria-hidden="true">
          <span className="dk-ah__ripple" />
          <span className="dk-ah__ripple" />
          <span className="dk-ah__hub-ring" />
          <span className="dk-ah__hub-disc">
            <img src={dkMark} alt="" draggable={false} />
          </span>
        </div>

        <ul className="dk-ah__cards" role="list" aria-label="How we think">
          {HERO_CARDS.map((card) => (
            <li
              key={card.id}
              className="dk-ah__slot"
              style={
                {
                  '--x': `${card.x}%`,
                  '--y': `${card.y}%`,
                  '--w': `${card.w}%`,
                  '--r': String(card.ratio),
                  '--cap': `${card.measure}%`,
                  '--tilt': `${card.tilt}deg`,
                } as CSSProperties
              }
            >
              <div className="dk-ah__float">
                <article className="dk-ah__card">
                  <img
                    className="dk-ah__photo"
                    src={card.image}
                    alt=""
                    style={{ objectPosition: card.focus }}
                    decoding="async"
                    draggable={false}
                  />
                  <span className="dk-ah__shade" aria-hidden="true" />
                  <span className="dk-ah__sheen" aria-hidden="true" />
                  <p className="dk-ah__tag">
                    <span>{card.index}</span>
                    <span className="dk-ah__tag-word"> / {card.tag}</span>
                  </p>
                  <p className="dk-ah__caption">{card.caption}</p>
                </article>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
