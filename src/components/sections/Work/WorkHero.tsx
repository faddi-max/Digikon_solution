import { useRef } from 'react'
import { Link } from 'react-router-dom'

import { CtaButton } from '@/components/ui/CtaButton'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

import './WorkHero.css'

/** Pointer travel in px for a layer of depth 1. */
const PARALLAX = 14

type Mover = { depth: number; x: (v: number) => void; y: (v: number) => void }

function ArrowRight() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

/** Decorative layered dashboard. Shapes only, no figures, so nothing reads as a real result. */
function WorkIllustration() {
  return (
    <div className="dk-wh-art" aria-hidden="true">
      <svg className="dk-wh-art__orbit" data-wh="orbit" data-depth="1.2" viewBox="0 0 680 440" fill="none">
        <path pathLength={1} d="M30 150C10 96 110 60 200 98S340 190 440 112 600 30 650 74" />
        <path pathLength={1} d="M60 168C140 270 220 340 345 366S545 420 620 360 650 290 664 270" />
        <path pathLength={1} d="M110 70C158 140 196 196 252 232" />
        <circle cx="30" cy="150" r="9" />
        <circle cx="650" cy="74" r="4" />
        <circle cx="620" cy="360" r="6" />
      </svg>

      {/* Back panel, dark teal */}
      <div className="dk-wh-art__layer" data-wh="layer" data-depth="0.4">
        <div className="dk-wh-art__panel dk-wh-art__panel--dark">
          <div className="dk-wh-art__nodes">
            <span /><span /><span /><span /><span /><span />
          </div>
        </div>
      </div>

      {/* Rear pale panel */}
      <div className="dk-wh-art__layer" data-wh="layer" data-depth="0.6">
        <div className="dk-wh-art__panel dk-wh-art__panel--rear">
          <div className="dk-wh-art__bars">
            <span /><span /><span /><span /><span />
          </div>
          <div className="dk-wh-art__lines">
            <i /><i /><i />
          </div>
        </div>
      </div>

      {/* Main panel */}
      <div className="dk-wh-art__layer" data-wh="layer" data-depth="1">
        <div className="dk-wh-art__panel dk-wh-art__panel--main">
          <div className="dk-wh-art__search">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="10.5" cy="10.5" r="6" />
              <path d="m15 15 5 5" />
            </svg>
            <span />
          </div>
          <div className="dk-wh-art__content">
            <div className="dk-wh-art__copy">
              <span className="dk-wh-art__dot" />
              <div>
                <i /><i /><i />
              </div>
            </div>
            <div className="dk-wh-art__donut" data-wh="ring">
              <span />
            </div>
            <div className="dk-wh-art__chart">
              <span /><span /><span /><span /><span /><span />
            </div>
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <div className="dk-wh-art__layer" data-wh="layer" data-depth="1.5">
        <div className="dk-wh-art__card dk-wh-art__card--stats">
          <div className="dk-wh-art__mini-bars">
            <span /><span /><span /><span /><span />
          </div>
          <i />
          <i />
        </div>
      </div>

      <div className="dk-wh-art__layer" data-wh="layer" data-depth="1.7">
        <div className="dk-wh-art__card dk-wh-art__card--search">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="10.5" cy="10.5" r="6" />
            <path d="m15 15 5 5" />
          </svg>
          <div>
            <i />
            <i />
          </div>
        </div>
      </div>

      <div className="dk-wh-art__layer" data-wh="layer" data-depth="1.4">
        <div className="dk-wh-art__card dk-wh-art__card--check">
          <div><span data-wh="tick">✓</span><i /></div>
          <div><span data-wh="tick">✓</span><i /></div>
          <div><span data-wh="tick">✓</span><i /></div>
        </div>
      </div>

      <div className="dk-wh-art__layer" data-wh="layer" data-depth="1.6">
        <div className="dk-wh-art__card dk-wh-art__card--chart">
          <div className="dk-wh-art__heading">
            <i />
            <i />
          </div>
          <div className="dk-wh-art__ring" data-wh="ring" />
          <div className="dk-wh-art__mini-bars dk-wh-art__mini-bars--low">
            <span /><span /><span /><span />
          </div>
        </div>
      </div>

      <span className="dk-wh-art__orb dk-wh-art__orb--left" data-wh="orb" data-depth="2" />
      <span className="dk-wh-art__orb dk-wh-art__orb--bottom" data-wh="orb" data-depth="1.8" />
    </div>
  )
}

/**
 * Work page hero: breadcrumb, label, "Digital work. Real impact." headline with a green
 * marker, intro copy, two actions and a layered dashboard illustration.
 *
 * Layout: two columns from 901px (copy left on a centred 1160px frame, illustration running to
 * the right viewport edge). One column below, with the illustration under the copy.
 *
 * Motion (GSAP): headline lines rise out of masks, the marker draws, the layers stack in,
 * orbit lines draw, bars grow and rings spin in. While on screen the panels float (CSS) and,
 * on mouse and pen only, each layer travels by its own depth. Reduced motion shows the
 * finished hero with no tweens and no floating.
 */
export function WorkHero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const q = gsap.utils.selector(el)
      const mm = gsap.matchMedia(el)

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const crumbs = q('[data-wh="crumbs"]')
        const label = q('[data-wh="label"]')
        const lines = q('[data-wh="line"]')
        const accent = q('[data-wh="accent"]')
        const desc = q('[data-wh="desc"]')
        const actions = q('[data-wh="action"]')
        const visual = q('[data-wh="visual"]')
        const layers = q('[data-wh="layer"]')
        const orbs = q('[data-wh="orb"]')
        const orbitPaths = q('[data-wh="orbit"] path')
        const orbitDots = q('[data-wh="orbit"] circle')
        const bars = q(
          '.dk-wh-art__bars span, .dk-wh-art__chart span, .dk-wh-art__mini-bars span',
        )
        const rings = q('[data-wh="ring"]')
        const ticks = q('[data-wh="tick"]')

        // ---- start state ----
        gsap.set([crumbs, label, desc, actions], { autoAlpha: 0, y: 16 })
        gsap.set(lines, { yPercent: 110 })
        gsap.set(accent, { '--mk': 0 })
        gsap.set(layers, { autoAlpha: 0, yPercent: 6 })
        gsap.set(orbitPaths, { strokeDasharray: 1, strokeDashoffset: 1 })
        gsap.set(orbitDots, { scale: 0, transformOrigin: '50% 50%' })
        gsap.set(orbs, { scale: 0 })
        gsap.set(bars, { scaleY: 0, transformOrigin: '50% 100%' })
        gsap.set(rings, { rotation: -140, scale: 0.6, transformOrigin: '50% 50%' })
        gsap.set(ticks, { scale: 0 })

        // ---- entrance ----
        gsap
          .timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
          .to([crumbs, label], { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0)
          .to(lines, { yPercent: 0, duration: 0.9, stagger: 0.11, ease: 'power4.out' }, 0.15)
          .to(accent, { '--mk': 1, duration: 0.75, ease: 'power2.inOut' }, 0.85)
          .to(desc, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.6)
          .to(actions, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0.75)
          .to(layers, { autoAlpha: 1, yPercent: 0, duration: 1, stagger: 0.09 }, 0.2)
          .to(orbitPaths, { strokeDashoffset: 0, duration: 1.6, stagger: 0.15, ease: 'power2.inOut' }, 0.5)
          .to(bars, { scaleY: 1, duration: 0.6, stagger: 0.03 }, 0.9)
          .to(rings, { rotation: 0, scale: 1, duration: 0.9, stagger: 0.1, ease: 'power2.out' }, 0.9)
          .to(orbs, { scale: 1, duration: 0.6, stagger: 0.15, ease: 'back.out(2.5)' }, 1.0)
          .to(orbitDots, { scale: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(2.5)' }, 1.1)
          .to(ticks, { scale: 1, duration: 0.4, stagger: 0.12, ease: 'back.out(3)' }, 1.2)

        // ---- idle CSS floats only run while the hero is on screen ----
        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            el.dataset.run = String(self.isActive)
          },
        })

        // ---- scroll: the illustration drifts slightly against the page ----
        const drift = visual.length
          ? gsap.to(visual, {
              yPercent: -4,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
            })
          : null

        // ---- pointer: each layer travels by its own depth (mouse and pen only) ----
        let teardown = () => {}
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          const movers: Mover[] = q('[data-depth]').map((node: HTMLElement) => ({
            depth: Number(node.dataset.depth ?? 1),
            x: gsap.quickTo(node, 'x', { duration: 0.9, ease: 'power3.out' }),
            y: gsap.quickTo(node, 'y', { duration: 0.9, ease: 'power3.out' }),
          }))
          const onMove = (e: PointerEvent) => {
            const r = el.getBoundingClientRect()
            const nx = gsap.utils.clamp(-1, 1, ((e.clientX - r.left) / r.width - 0.5) * 2)
            const ny = gsap.utils.clamp(-1, 1, ((e.clientY - r.top) / r.height - 0.5) * 2)
            movers.forEach((m) => {
              m.x(-nx * m.depth * PARALLAX)
              m.y(-ny * m.depth * PARALLAX * 0.7)
            })
          }
          const onLeave = () =>
            movers.forEach((m) => {
              m.x(0)
              m.y(0)
            })
          el.addEventListener('pointermove', onMove)
          el.addEventListener('pointerleave', onLeave)
          teardown = () => {
            el.removeEventListener('pointermove', onMove)
            el.removeEventListener('pointerleave', onLeave)
          }
        }

        return () => {
          st.kill()
          drift?.scrollTrigger?.kill()
          teardown()
          delete el.dataset.run
        }
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="dk-wh" aria-labelledby="work-hero-title">
      <div className="dk-wh__grid" aria-hidden="true" />

      <div className="dk-wh__inner">
        <div className="dk-wh__copy">
          <nav className="dk-wh__crumbs" aria-label="Breadcrumb" data-wh="crumbs">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li aria-current="page">Work</li>
            </ol>
          </nav>

          <p className="dk-wh__label" data-wh="label">
            <span aria-hidden="true" />
            Work
          </p>

          <h1 id="work-hero-title" className="dk-wh__title">
            <span className="dk-wh__line">
              <span className="dk-wh__line-in" data-wh="line">
                Digital work.
              </span>
            </span>
            <span className="dk-wh__line">
              <span className="dk-wh__line-in" data-wh="line">
                <em className="dk-wh__accent" data-wh="accent">
                  Real impact.
                </em>
              </span>
            </span>
          </h1>

          <p className="dk-wh__desc" data-wh="desc">
            See how strategy, design and engineering come together in the platforms,
            products and experiences we build with our clients, each one shaped around a
            clear goal.
          </p>

          <div className="dk-wh__actions">
            <span data-wh="action" className="dk-wh__action">
              <CtaButton className="dk-wh__btn dk-wh__btn--primary" href="/contact">
                Get started
                <ArrowRight />
              </CtaButton>
            </span>
            <a className="dk-wh__btn dk-wh__btn--ghost" href="#work" data-wh="action">
              Explore our work
            </a>
          </div>
        </div>

        <div className="dk-wh__visual" data-wh="visual">
          <WorkIllustration />
        </div>
      </div>
    </section>
  )
}

export default WorkHero