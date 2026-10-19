import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'

import overlayImg from '@/assets/images/team/soft-mint-grid-overlay.png'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

import { TEAM } from './teamData'
import { offsetOf, poseFor, reachFor } from './teamLayout'
import type { Pose } from './teamLayout'
import './TeamSection.css'

const COUNT = TEAM.length
const START = 2
const SWIPE_PX = 48
const TILT = 6

const pad = (n: number) => String(n).padStart(2, '0')

/** GSAP vars for a pose. `clip` is a CSS variable, so it needs its `--` name. */
const toVars = ({ clip, ...rest }: Pose) => ({ ...rest, '--clip': clip })

/**
 * "Meet the minds" team carousel.
 *
 * Layout and motion
 * - Header: serif headline, masked line reveal, a marker bar that draws under the accent.
 * - Stage: a coverflow. The active card is centred and large, neighbours sit beside it, each
 *   smaller and narrower (see teamLayout.ts). Phones show one neighbour per side and let it
 *   peek past the screen edge, wider stages show two.
 * - Change of card: GSAP tweens each card to its new pose.
 * - Input: dots, click a neighbour, swipe, and Left/Right/Home/End on the stage.
 * - Reduced motion: the same layout with every change applied instantly.
 */
export function TeamSection() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLUListElement>(null)
  const overlay = useRef<HTMLImageElement>(null)
  const slots = useRef<(HTMLLIElement | null)[]>([])

  const [active, setActive] = useState(START)

  // Values the stable callbacks below read, so they never close over stale state.
  const activeRef = useRef(START)
  const readyRef = useRef(false)
  const motionRef = useRef(true)
  const prevOffsets = useRef<number[]>(TEAM.map((_, i) => offsetOf(i, START, COUNT)))
  const drag = useRef({ x: 0, y: 0, id: -1, moved: false })

  const go = useCallback((to: number) => {
    setActive(((to % COUNT) + COUNT) % COUNT)
  }, [])

  /** Moves every card to the pose for the current active card. */
  const place = useCallback((animate: boolean) => {
    const el = stage.current
    const first = slots.current[0]
    if (!el || !first) return
    const cardWidth = first.offsetWidth
    const reach = reachFor(el.clientWidth)

    slots.current.forEach((slot, i) => {
      if (!slot) return
      const offset = offsetOf(i, activeRef.current, COUNT)
      const pose = poseFor(offset, cardWidth, reach)
      const jumped = Math.abs(offset - prevOffsets.current[i]) > 2
      prevOffsets.current[i] = offset

      gsap.set(slot, { zIndex: pose.zIndex })

      if (!animate) {
        gsap.set(slot, toVars(pose))
      } else if (jumped) {
        // The card is wrapping round the loop: fade it in at its new place rather than
        // sliding it across every other card.
        gsap.set(slot, { ...toVars(pose), autoAlpha: 0 })
        gsap.to(slot, { autoAlpha: pose.autoAlpha, duration: 0.4, ease: 'power2.out' })
      } else {
        gsap.to(slot, { ...toVars(pose), duration: 0.5, ease: 'power2.inOut', overwrite: 'auto' })
      }
    })
  }, [])

  // Intro, scroll parallax and pointer tilt. Reduced motion skips all three.
  useGSAP(
    () => {
      const section = root.current
      const stageEl = stage.current
      if (!section || !stageEl) return

      const lines = section.querySelectorAll<HTMLElement>('[data-tm="line"]')
      const accent = section.querySelector<HTMLElement>('[data-tm="accent"]')
      const intro = section.querySelectorAll<HTMLElement>('[data-tm="intro"]')
      const controls = section.querySelector<HTMLElement>('[data-tm="controls"]')

      gsap.set(slots.current, { transformPerspective: 1400 })

      const mm = gsap.matchMedia(section)

      mm.add('(prefers-reduced-motion: reduce)', () => {
        motionRef.current = false
        place(false)
        readyRef.current = true
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        motionRef.current = true

        // Start collapsed behind the active card; the intro fans them out.
        gsap.set(slots.current, { x: 0, scale: 0.6, autoAlpha: 0, '--clip': 0 })
        gsap.set(lines, { yPercent: 110 })
        if (accent) gsap.set(accent, { '--mk': 0 })
        gsap.set(intro, { autoAlpha: 0, y: 20 })
        if (controls) gsap.set(controls, { autoAlpha: 0, y: 16 })

        const playIntro = () => {
          const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
          tl.to(lines, { yPercent: 0, duration: 0.7, stagger: 0.1 }, 0)
          if (accent) tl.to(accent, { '--mk': 1, duration: 0.7, ease: 'power2.inOut' }, 0.45)
          tl.to(intro, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.2)

          // Cards fan out from the centre. Targets are measured now, so a resize during
          // the load is respected.
          const el = stage.current
          const first = slots.current[0]
          if (el && first) {
            const reach = reachFor(el.clientWidth)
            const order = slots.current
              .map((slot, i) => ({ slot, i, off: Math.abs(offsetOf(i, activeRef.current, COUNT)) }))
              .sort((a, b) => a.off - b.off)
            order.forEach(({ slot, i }, n) => {
              if (!slot) return
              const offset = offsetOf(i, activeRef.current, COUNT)
              const pose = poseFor(offset, first.offsetWidth, reach)
              prevOffsets.current[i] = offset
              gsap.set(slot, { zIndex: pose.zIndex })
              tl.to(slot, { ...toVars(pose), duration: 0.85, ease: 'power3.out' }, 0.25 + n * 0.07)
            })
          }
          if (controls) tl.to(controls, { autoAlpha: 1, y: 0, duration: 0.5 }, '>-0.3')
          tl.call(() => {
            readyRef.current = true
            place(false)
          })
        }

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: 'top 72%',
          once: true,
          onEnter: playIntro,
        })

        // The overlay drifts slowly against the scroll, for depth.
        const overlayEl = overlay.current
        if (overlayEl) {
          gsap.fromTo(
            overlayEl,
            { yPercent: -4 },
            {
              yPercent: 4,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          )
        }

        // Pointer tilt on the active card only, and only with a mouse or pen.
        const onMove = (e: PointerEvent) => {
          if (e.pointerType === 'touch' || !readyRef.current) return
          const slot = slots.current[activeRef.current]
          const card = slot?.querySelector<HTMLElement>('[data-tm="card"]')
          if (!slot || !card) return
          const r = slot.getBoundingClientRect()
          const px = (e.clientX - r.left) / r.width
          const py = (e.clientY - r.top) / r.height
          if (px < 0 || px > 1 || py < 0 || py > 1) return
          gsap.to(card, {
            rotationY: (px - 0.5) * TILT * 2,
            rotationX: (0.5 - py) * TILT * 2,
            duration: 0.5,
            ease: 'power3.out',
            overwrite: 'auto',
          })
          card.style.setProperty('--mx', `${Math.round(px * 100)}%`)
          card.style.setProperty('--my', `${Math.round(py * 100)}%`)
        }
        const reset = () => {
          const cards = stageEl.querySelectorAll<HTMLElement>('[data-tm="card"]')
          gsap.to(cards, {
            rotationX: 0,
            rotationY: 0,
            duration: 0.6,
            ease: 'power3.out',
            overwrite: 'auto',
          })
        }
        stageEl.addEventListener('pointermove', onMove)
        stageEl.addEventListener('pointerleave', reset)

        return () => {
          trigger.kill()
          stageEl.removeEventListener('pointermove', onMove)
          stageEl.removeEventListener('pointerleave', reset)
        }
      })
    },
    { scope: root },
  )

  // Move the cards when the active one changes. The first run is the initial render, which
  // the intro (or the reduced-motion branch above) already placed.
  useEffect(() => {
    activeRef.current = active
    if (!readyRef.current) return
    place(motionRef.current)
    // Drop any tilt left on the card that was active.
    gsap.to(stage.current?.querySelectorAll('[data-tm="card"]') ?? [], {
      rotationX: 0,
      rotationY: 0,
      duration: 0.4,
      overwrite: 'auto',
    })
  }, [active, place])

  // Re-place the cards, instantly, when the stage changes size or the fonts settle.
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      if (readyRef.current) place(false)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [place])

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowRight') go(active + 1)
    else if (e.key === 'ArrowLeft') go(active - 1)
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(COUNT - 1)
    else return
    e.preventDefault()
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false }
  }
  const onPointerUp = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current
    if (d.id !== e.pointerId) return
    d.id = -1
    const dx = e.clientX - d.x
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(e.clientY - d.y)) {
      d.moved = true
      go(active + (dx < 0 ? 1 : -1))
    }
  }

  const member = TEAM[active]

  return (
    <section ref={root} className="dk-tm" aria-labelledby="team-heading">
      <img
        ref={overlay}
        className="dk-tm__overlay"
        src={overlayImg}
        alt=""
        aria-hidden="true"
        width={1774}
        height={887}
        decoding="async"
      />

      <div className="dk-tm__inner">
        <header className="dk-tm__head">
          <div className="dk-tm__title">
            <p className="dk-tm__eyebrow" data-tm="intro">
              The people behind DigiKon
            </p>
            <h2 id="team-heading" className="dk-tm__h2">
              <span className="dk-tm__line">
                <span className="dk-tm__line-in" data-tm="line">
                  Meet the minds building
                </span>
              </span>
              <span className="dk-tm__line">
                <span className="dk-tm__line-in" data-tm="line">
                  <em className="dk-tm__accent" data-tm="accent">
                    your brand.
                  </em>
                </span>
              </span>
            </h2>
          </div>
          <p className="dk-tm__lede" data-tm="intro">
            Strategists, designers and engineers working as one team, turning ideas into digital
            products that work as good as they look.
          </p>
        </header>

        <div className="dk-tm__viewport">
          <ul
            ref={stage}
            className="dk-tm__stage"
            tabIndex={0}
            aria-roledescription="carousel"
            aria-label="DigiKon team members"
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (drag.current.id = -1)}
          >
            {TEAM.map((m, i) => {
              const offset = offsetOf(i, active, COUNT)
              return (
                <li
                  key={m.id}
                  ref={(node) => {
                    slots.current[i] = node
                  }}
                  className="dk-tm__slot"
                  data-offset={offset}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${COUNT}`}
                  aria-current={offset === 0 ? 'true' : undefined}
                >
                  <article className="dk-tm__card" data-tm="card">
                    <img
                      className="dk-tm__photo"
                      src={m.image}
                      alt={`Portrait of ${m.name}`}
                      width={600}
                      height={800}
                      loading={Math.abs(offset) <= 1 ? 'eager' : 'lazy'}
                      decoding="async"
                      draggable={false}
                    />
                    <span className="dk-tm__shade" aria-hidden="true" />
                    <span className="dk-tm__dim" aria-hidden="true" />
                    <span className="dk-tm__sheen" aria-hidden="true" />
                    <span className="dk-tm__count" aria-hidden="true">
                      {pad(i + 1)} / {pad(COUNT)}
                    </span>
                    <div className="dk-tm__info">
                      <span className="dk-tm__chip">{m.tag}</span>
                      <p className="dk-tm__role">{m.role}</p>
                      <h3 className="dk-tm__name">{m.name}</h3>
                      <p className="dk-tm__bio">{m.bio}</p>
                    </div>
                  </article>
                  {offset !== 0 && (
                    <button
                      type="button"
                      className="dk-tm__select"
                      aria-label={`Show ${m.name}, ${m.role}`}
                      onClick={() => {
                        if (drag.current.moved) {
                          drag.current.moved = false
                          return
                        }
                        go(i)
                      }}
                    />
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        <ul className="dk-tm__dots" role="list" data-tm="controls">
          {TEAM.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                className="dk-tm__dot"
                aria-label={`Show ${m.name}`}
                aria-current={i === active ? 'true' : undefined}
                onClick={() => go(i)}
              />
            </li>
          ))}
        </ul>

        <p className="dk-tm__sr" aria-live="polite">
          {`${member.name}, ${member.role}. ${active + 1} of ${COUNT}.`}
        </p>
      </div>
    </section>
  )
}