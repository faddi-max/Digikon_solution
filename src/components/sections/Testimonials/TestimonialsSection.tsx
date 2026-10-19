import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'

import chartSrc from '@/assets/images/testimonials-chart.png'
import testimonialAvatarSrc from '@/assets/images/testimonialimg.jpg?url'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap, useGSAP } from '@/lib/motion'

import { TESTIMONIALS } from './testimonialsData'
import './Testimonials.css'

/** Portraits are picked up by filename. A missing file uses the supplied dummy avatar. */
const PHOTOS = import.meta.glob(
  '../../../assets/images/testimonials/*.{png,webp,jpg,jpeg,avif}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
) as Record<string, string>

function photoFor(name: string): string | undefined {
  const hit = Object.keys(PHOTOS).find(
    (p) =>
      p
        .split('/')
        .pop()
        ?.replace(/\.[^.]+$/, '') === name,
  )
  return hit ? PHOTOS[hit] : undefined
}

const N = TESTIMONIALS.length
/** Wheel runs as an arc from this width up. Below it the avatars sit in a row under the quote. */
const ARC_MQ = '(min-width: 1100px)'
/** Angle between neighbouring avatars on the arc. */
const STEP = (20 * Math.PI) / 180

const pad = (n: number) => (n < 10 ? '0' : '') + n
const mod = (n: number) => ((n % N) + N) % N
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v))

function ArrowIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d={
          dir === 'right' ? 'M5 12h14M13 6l6 6-6 6' : 'M19 12H5M11 18l-6-6 6-6'
        }
      />
    </svg>
  )
}

export function TestimonialsSection() {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const [entered, setEntered] = useState(reduced)

  const rootRef = useRef<HTMLElement>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  const avatars = useRef<(HTMLButtonElement | null)[]>([])
  const activeRef = useRef(0)
  const reducedRef = useRef(reduced)
  const swipeX = useRef<number | null>(null)
  /** pos: continuous wheel position. spread/intro: 0 to 1 entrance progress. */
  const wheel = useRef({
    pos: 0,
    target: 0,
    spread: reduced ? 1 : 0,
    intro: reduced ? 1 : 0,
  })

  useEffect(() => {
    reducedRef.current = reduced
  }, [reduced])

  /**
   * Places every avatar from the wheel state. Runs on each GSAP tick and on resize, and writes
   * straight to the DOM so a turn of the wheel never re-renders React.
   */
  const layout = useCallback(() => {
    const el = wheelRef.current
    if (!el) return
    const W = el.clientWidth
    const H = el.clientHeight
    if (!W || !H) return

    const arc = window.matchMedia(ARC_MQ).matches
    const s = arc ? clamp(W / 1920, 0.6, 1) : 1
    const dA = arc ? 218 * s : clamp(W * 0.3, 96, 128)
    const dS = arc ? Math.max(36, 48 * s) : 44
    el.style.setProperty('--dA', `${dA.toFixed(1)}px`)

    const { pos, spread, intro } = wheel.current
    const half = N / 2
    const vis = Math.min(half, 3.5)

    // Arc: active avatar sits 88px inside the content edge, neighbours curve away from it.
    const cy = H / 2
    const contentW = Math.min(1148, W - 32)
    const xA = (W + contentW) / 2 - 88 * s
    const a = 400 * s
    const b = 0.566 * H
    // Row: neighbours sit clear of the larger active avatar.
    const f1 = dA / 2 + dS / 2 + 8
    const rowX = (t: number) => (t <= 1 ? t * f1 : f1 + (t - 1) * (dS + 8))

    avatars.current.forEach((node, i) => {
      if (!node) return
      // Shortest signed distance from the wheel position, wrapped to [-N/2, N/2).
      const o = ((((i - pos + half) % N) + N) % N) - half
      const oe = o * spread
      const ao = Math.abs(o)
      const act = clamp(1 - Math.abs(oe), 0, 1)

      let x: number
      let y: number
      if (arc) {
        const th = oe * STEP
        x = xA - a * (1 - Math.cos(th))
        y = cy + b * Math.sin(th)
      } else {
        x = W / 2 + Math.sign(oe) * rowX(Math.abs(oe))
        y = cy - 6 + oe * oe * 5
      }

      const sc = ((dS + (dA - dS) * act) / dA) * (1 - (1 - intro) * act * 0.3)
      // Fades to zero at the wrap point, so an avatar leaving one end never pops in at the other.
      const base = clamp((vis - ao) / Math.min(1, vis), 0, 1)
      const op = base * (spread * (1 - act) + intro * act)

      node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${sc.toFixed(4)})`
      node.style.opacity = op.toFixed(3)
      node.style.zIndex = String(Math.round(100 - ao * 10))
      node.style.visibility = op < 0.02 ? 'hidden' : 'visible'
      node.style.setProperty('--act', act.toFixed(3))
      // Keep the ring a constant visual width while the avatar scales.
      node.style.setProperty('--bw', `${((2 + act * 1.5) / sc).toFixed(2)}px`)
    })
  }, [])

  const go = useCallback(
    (next: number) => {
      const idx = mod(next)
      if (idx === activeRef.current) return
      activeRef.current = idx
      setActive(idx)

      const w = wheel.current
      let d = idx - mod(w.target)
      if (d > N / 2) d -= N
      if (d < -N / 2) d += N
      w.target += d

      if (reducedRef.current) {
        gsap.killTweensOf(w, 'pos')
        w.pos = w.target
        layout()
        return
      }
      gsap.to(w, {
        pos: w.target,
        duration: 0.9,
        ease: 'power3.inOut',
        overwrite: 'auto',
        onUpdate: layout,
      })
    },
    [layout],
  )

  // Position the wheel on mount and whenever its box changes (resize, breakpoint switch).
  useEffect(() => {
    const el = wheelRef.current
    if (!el) return
    layout()
    const ro = new ResizeObserver(layout)
    ro.observe(el)
    const w = wheel.current
    return () => {
      ro.disconnect()
      gsap.killTweensOf(w)
    }
  }, [layout])

  // Entrance fires once, when the section is a quarter in view.
  useEffect(() => {
    if (reduced) {
      setEntered(true)
      return
    }
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  // The avatars fan out along the arc from the active one.
  useEffect(() => {
    if (!entered) return
    const w = wheel.current
    if (reduced) {
      w.spread = 1
      w.intro = 1
      layout()
      return
    }
    const tl = gsap.timeline()
    tl.to(
      w,
      { intro: 1, duration: 1, ease: 'power3.out', onUpdate: layout },
      0,
    ).to(
      w,
      { spread: 1, duration: 1.7, ease: 'expo.out', onUpdate: layout },
      0.25,
    )
    return () => {
      tl.kill()
    }
  }, [entered, reduced, layout])

  // Quote words rise in, then the client line. Runs on entrance and on every change.
  useGSAP(
    () => {
      if (!entered || reduced) return
      const q = gsap.utils.selector(rootRef)
      const words = q('[data-active="true"] .dk-tm__w')
      const who = q('[data-active="true"] .dk-tm__who')
      gsap.fromTo(
        words,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.04,
          ease: 'power3.out',
          delay: 0.12,
        },
      )
      gsap.fromTo(
        who,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.7, delay: 0.4, ease: 'power3.out' },
      )
    },
    {
      scope: rootRef,
      dependencies: [entered, active, reduced],
      revertOnUpdate: true,
    },
  )

  const onControlsKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(activeRef.current + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(activeRef.current - 1)
    }
  }

  // Swipe on touch. The stage allows vertical scrolling only, so horizontal drags reach us.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') swipeX.current = e.clientX
  }
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (swipeX.current === null) return
    const dx = e.clientX - swipeX.current
    swipeX.current = null
    if (Math.abs(dx) > 48) go(activeRef.current + (dx < 0 ? 1 : -1))
  }

  const current = TESTIMONIALS[active]

  return (
    <section
      ref={rootRef}
      id="testimonials"
      className="dk-tm"
      data-in={entered}
      aria-roledescription="carousel"
      aria-label="Client testimonials"
    >
      <div className="dk-tm__chart" aria-hidden="true">
        <img
          src={chartSrc}
          alt=""
          width={2164}
          height={727}
          draggable={false}
          decoding="async"
        />
      </div>

      <h2 className="dk-tm__sr">What clients say</h2>

      <div className="dk-tm__inner">
        <div className="dk-tm__layout">
          <p className="dk-tm__eyebrow">
            <span className="dk-tm__eyebrow-dot" aria-hidden="true" />
            Testimonials
          </p>

          <div className="dk-tm__content">
            <div
              className="dk-tm__stage"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => {
                swipeX.current = null
              }}
            >
              {TESTIMONIALS.map((t, i) => (
                <figure
                  key={t.id}
                  className="dk-tm__item"
                  data-active={i === active}
                  aria-hidden={i !== active}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${N}`}
                >
                  <blockquote className="dk-tm__quote">
                    <p>
                      {`“${t.quote}”`.split(' ').map((word, k, all) => (
                        <Fragment key={k}>
                          <span className="dk-tm__w">{word}</span>
                          {k < all.length - 1 ? ' ' : null}
                        </Fragment>
                      ))}
                    </p>
                  </blockquote>
                  <figcaption className="dk-tm__who">
                    {t.name}, {t.role}, {t.company}
                  </figcaption>
                </figure>
              ))}
            </div>

            {N > 1 && (
              <div
                className="dk-tm__controls"
                role="group"
                aria-label="Testimonial navigation"
                onKeyDown={onControlsKey}
              >
                <button
                  type="button"
                  className="dk-tm__btn"
                  aria-label="Previous testimonial"
                  onClick={() => go(activeRef.current - 1)}
                >
                  <ArrowIcon dir="left" />
                </button>
                <button
                  type="button"
                  className="dk-tm__btn"
                  aria-label="Next testimonial"
                  onClick={() => go(activeRef.current + 1)}
                >
                  <ArrowIcon dir="right" />
                </button>
                <p className="dk-tm__count" aria-hidden="true">
                  <span key={active} className="dk-tm__count-now">
                    {pad(active + 1)}
                  </span>
                  <span className="dk-tm__count-total">/ {pad(N)}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="dk-tm__sr" aria-live="polite" aria-atomic="true">
          {`Testimonial ${active + 1} of ${N}: ${current.quote} ${current.name}, ${current.role}, ${current.company}`}
        </p>

        {/* Decorative wheel. Prev and next do the same job for keyboard and screen reader users. */}
        <div ref={wheelRef} className="dk-tm__wheel" aria-hidden="true">
          {TESTIMONIALS.map((t, i) => {
            const src = photoFor(t.photo) ?? testimonialAvatarSrc
            return (
              <button
                key={t.id}
                ref={(el) => {
                  avatars.current[i] = el
                }}
                type="button"
                className="dk-tm__av"
                tabIndex={-1}
                onClick={() => go(i)}
              >
                <span className="dk-tm__glow" />
                <span className="dk-tm__face">
                  <img
                    src={src}
                    alt=""
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
