import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

import { SearchMock } from './SearchMock'
import { createGlowState, nowSeconds, ServiceHeroScene } from './ServiceHeroScene'
import { SEO_HERO, type ServiceHeroData } from './serviceHeroData'
import './ServiceHero.css'

const TILT_Y = 7
const TILT_X = 5
const DEPTH_PANEL = 10
const DEPTH_CARD = 26

function ArrowRight() {
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
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function ArrowDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4v16M6 14l6 6 6-6" />
    </svg>
  )
}

/**
 * Service page hero: breadcrumb, headline with a marker, copy, two actions, and the animated
 * search mockup on the right.
 *
 * Layout: two columns from 900px (copy 532 : mock 640 in the 1200px design), one column below
 * with the mock under the copy. Type scales with the viewport; the mock scales as a unit.
 *
 * Motion (GSAP): a single entrance timeline (headline masks, marker draw, mock panel and
 * card flying in, typed address, filled bars, badge pop, trend line draw, count-up), then a
 * slow idle float and glow pulse that only run while the hero is on screen. A mouse tilts the
 * mock in 3D with the card moving further than the panel. Reduced motion gets the finished
 * layout and nothing else.
 *
 * Three.js: ServiceHeroScene lights the grid crossings near the pointer and sends a pulse out
 * from the rank badge each time it glows.
 */
export function ServiceHero({ data = SEO_HERO }: { data?: ServiceHeroData }) {
  const root = useRef<HTMLElement>(null)
  const glow = useMemo(createGlowState, [])
  const motion = !useMediaQuery('(prefers-reduced-motion: reduce)')

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const q = <T extends Element = HTMLElement>(sel: string) => el.querySelector<T>(sel)
      const all = (sel: string) => gsap.utils.toArray<HTMLElement>(el.querySelectorAll(sel))

      const crumbs = q('[data-sh="crumbs"]')
      const label = q('[data-sh="label"]')
      const lines = all('[data-sh="line"]')
      const accent = q('[data-sh="accent"]')
      const body = q('[data-sh="body"]')
      const actions = all('[data-sh="action"]')

      const tilt = q('[data-sm="tilt"]')
      const panelFloat = q('[data-sm="panel-float"]')
      const cardFloat = q('[data-sm="card-float"]')
      const panelEnter = q('[data-sm="panel-enter"]')
      const cardEnter = q('[data-sm="card-enter"]')
      const url = q('[data-sm="url"]')
      const rows = all('[data-sm="row"]')
      const fills = all('[data-sm="fill"]')
      const badge = q('[data-sm="badge"]')
      const pill = q('[data-sm="pill"]')
      const trend = q<SVGPathElement>('[data-sm="trend"]')
      const count = q('[data-sm="count"]')
      const gbars = all('[data-sm="gbar"]')
      const visual = q('[data-sh="visual"]')

      const target = Number(count?.dataset.target ?? 0)
      const finalCount = count?.textContent ?? ''

      /** Where a pulse starts: the centre of the rank badge, in hero pixels. */
      const markOrigin = () => {
        if (!pill) return
        const h = el.getBoundingClientRect()
        const p = pill.getBoundingClientRect()
        glow.originX = p.left - h.left + p.width / 2
        glow.originY = p.top - h.top + p.height / 2
      }

      const mm = gsap.matchMedia(el)

      mm.add('(prefers-reduced-motion: reduce)', () => {
        // Everything stays in its finished state. Nothing to run.
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // ---- start state ----
        gsap.set([crumbs, label, body, ...actions], { autoAlpha: 0, y: 18 })
        gsap.set(lines, { yPercent: 110 })
        if (accent) gsap.set(accent, { '--mk': 0 })
        gsap.set(panelEnter, { autoAlpha: 0, x: 70, y: 36, rotation: -8 })
        gsap.set(cardEnter, { autoAlpha: 0, x: 26, y: 64, rotation: -7 })
        gsap.set(rows, { autoAlpha: 0, y: 16 })
        gsap.set(fills, { scaleX: 0, transformOrigin: '0 50%' })
        gsap.set(gbars, { scaleX: 0, transformOrigin: '0 50%' })
        gsap.set([badge, pill], { autoAlpha: 0, scale: 0.4 })
        gsap.set(pill, { transformOrigin: '100% 50%' })
        if (url) gsap.set(url, { clipPath: 'inset(0 100% 0 0)' })
        if (trend) gsap.set(trend, { strokeDasharray: 1, strokeDashoffset: 1 })
        if (count) count.textContent = '+0%'

        // True while the hero is on screen. Idle motion only runs then.
        let visible = true
        let beat = 0

        // ---- idle: slow float and a glow pulse that also drives the grid pulse ----
        const idle = gsap.timeline({ paused: true })
        if (panelFloat) {
          idle.to(
            panelFloat,
            { y: -7, duration: 4.6, ease: 'sine.inOut', yoyo: true, repeat: -1 },
            0,
          )
        }
        if (cardFloat) {
          idle.to(cardFloat, { y: 9, duration: 5.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0)
        }
        if (pill) {
          idle.to(
            pill,
            {
              '--glow': 1,
              duration: 1.3,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              repeatDelay: 0.9,
              onRepeat: () => {
                // Every other beat sends a ring across the grid.
                if (beat++ % 2 === 0) {
                  markOrigin()
                  glow.pulseAt = nowSeconds()
                  glow.invalidate?.()
                }
              },
            },
            0,
          )
        }

        // ---- entrance ----
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
        tl.to([crumbs, label], { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0)
        tl.to(lines, { yPercent: 0, duration: 0.85, stagger: 0.11 }, 0.15)
        if (accent) tl.to(accent, { '--mk': 1, duration: 0.75, ease: 'power2.inOut' }, 0.8)
        tl.to(body, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.6)
        tl.to(actions, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0.75)

        tl.to(panelEnter, { autoAlpha: 1, x: 0, y: 0, rotation: 0, duration: 1.1 }, 0.25)
        if (url) tl.to(url, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'steps(30)' }, 1.0)
        tl.to(rows, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.12 }, 0.85)
        tl.to(fills, { scaleX: 1, duration: 0.7, stagger: 0.06, ease: 'power2.out' }, 1.0)
        if (pill)
          tl.to(pill, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2.2)' }, 1.35)
        if (badge)
          tl.to(badge, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2.6)' }, 1.45)
        if (trend) tl.to(trend, { strokeDashoffset: 0, duration: 0.85, ease: 'power2.inOut' }, 1.5)

        tl.to(cardEnter, { autoAlpha: 1, x: 0, y: 0, rotation: 0, duration: 0.95 }, 1.2)
        if (count) {
          const n = { v: 0 }
          tl.to(
            n,
            {
              v: target,
              duration: 1.4,
              ease: 'power2.out',
              onUpdate: () => {
                count.textContent = `+${Math.round(n.v)}%`
              },
              onComplete: () => {
                count.textContent = finalCount
              },
            },
            1.55,
          )
        }
        tl.to(gbars, { scaleX: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, 1.8)

        tl.call(() => {
          markOrigin()
          glow.pulseAt = nowSeconds()
          glow.invalidate?.()
          if (visible) idle.play()
        })

        // ---- idle only while the hero is on screen ----
        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            visible = self.isActive
            if (!tl.isActive() && tl.progress() === 1) idle.paused(!visible)
          },
        })

        // ---- scroll parallax: the mock drifts up slightly against the page ----
        if (visual) {
          gsap.to(visual, {
            yPercent: -5,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
          })
        }

        // ---- pointer: 3D tilt and layered depth, mouse and pen only ----
        let teardown = () => {}
        if (tilt && panelFloat && cardFloat) {
          gsap.set(tilt, { transformPerspective: 1100 })
          const ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.8, ease: 'power3.out' })
          const rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.8, ease: 'power3.out' })
          const px = gsap.quickTo(panelFloat, 'x', { duration: 0.9, ease: 'power3.out' })
          const cx = gsap.quickTo(cardFloat, 'x', { duration: 0.9, ease: 'power3.out' })

          const onMove = (e: PointerEvent) => {
            if (e.pointerType === 'touch') return
            const r = el.getBoundingClientRect()
            const nx = (e.clientX - r.left) / r.width - 0.5
            const ny = (e.clientY - r.top) / r.height - 0.5
            ry(nx * TILT_Y * 2)
            rx(-ny * TILT_X * 2)
            px(-nx * DEPTH_PANEL * 2)
            cx(-nx * DEPTH_CARD * 2)
            glow.px = e.clientX - r.left
            glow.py = e.clientY - r.top
            glow.on = 1
            glow.invalidate?.()
          }
          const onLeave = () => {
            ry(0)
            rx(0)
            px(0)
            cx(0)
            glow.on = 0
            glow.invalidate?.()
          }
          el.addEventListener('pointermove', onMove)
          el.addEventListener('pointerleave', onLeave)
          teardown = () => {
            el.removeEventListener('pointermove', onMove)
            el.removeEventListener('pointerleave', onLeave)
          }
        }

        // The badge moves with the layout, so measure again when the hero changes size.
        const ro = new ResizeObserver(markOrigin)
        ro.observe(el)

        return () => {
          st.kill()
          ro.disconnect()
          teardown()
          glow.on = 0
        }
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="dk-sh" aria-labelledby="service-hero-title">
      <ServiceHeroScene state={glow} motion={motion} />

      <div className="dk-sh__inner">
        <div className="dk-sh__copy">
          <nav className="dk-sh__crumbs" aria-label="Breadcrumb" data-sh="crumbs">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li aria-current="page">{data.crumb}</li>
            </ol>
          </nav>

          <p className="dk-sh__label" data-sh="label">
            <span className="dk-sh__label-dot" aria-hidden="true" />
            {data.label}
          </p>

          <h1 id="service-hero-title" className="dk-sh__h1">
            {data.lines.map((line) => (
              <span className="dk-sh__line" key={line}>
                <span className="dk-sh__line-in" data-sh="line">
                  {line}
                </span>
              </span>
            ))}
            <span className="dk-sh__line dk-sh__line--accent">
              <span className="dk-sh__line-in" data-sh="line">
                <em className="dk-sh__accent" data-sh="accent">
                  {data.accent}
                </em>
              </span>
            </span>
          </h1>

          <p className="dk-sh__body" data-sh="body">
            {data.body}
          </p>

          <div className="dk-sh__actions">
            <Link className="dk-sh__btn" to={data.primary.to} data-sh="action">
              {data.primary.label}
              <ArrowRight />
            </Link>
            <a className="dk-sh__link" href={data.secondary.href} data-sh="action">
              {data.secondary.label}
              <ArrowDown />
            </a>
          </div>
        </div>

        <div className="dk-sh__visual" data-sh="visual">
          <SearchMock mock={data.mock} />
        </div>
      </div>
    </section>
  )
}
