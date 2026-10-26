import { useRef } from 'react'
import { Link } from 'react-router-dom'

import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

import './ProductHero.css'

/** Pointer travel in px for a layer of depth 1. */
const PARALLAX = 14

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

function DashboardIllustration() {
  return (
    <div className="dk-ph-art" aria-hidden="true">
      <svg
        className="dk-ph-art__orbit"
        data-ph="orbit"
        data-depth="1.2"
        viewBox="0 0 680 420"
        fill="none"
      >
        <path pathLength={1} d="M40 116C16 68 99 43 176 81S328 166 426 94 598 17 635 58" />
        <path pathLength={1} d="M53 126C132 222 205 288 330 317S538 380 605 325 635 258 652 242" />
        <path pathLength={1} d="M100 55C149 126 185 177 240 209" />
        <circle cx="40" cy="116" r="9" />
        <circle cx="635" cy="58" r="4" />
        <circle cx="605" cy="325" r="6" />
      </svg>

      <div className="dk-ph-art__layer" data-ph="layer" data-depth="0.3">
        <div className="dk-ph-art__backdrop">
          <span className="dk-ph-art__backdrop-node dk-ph-art__backdrop-node--one" />
          <span className="dk-ph-art__backdrop-node dk-ph-art__backdrop-node--two" />
          <span className="dk-ph-art__backdrop-node dk-ph-art__backdrop-node--three" />
          <span className="dk-ph-art__backdrop-node dk-ph-art__backdrop-node--four" />
          <span className="dk-ph-art__backdrop-node dk-ph-art__backdrop-node--five" />
          <span className="dk-ph-art__backdrop-node dk-ph-art__backdrop-node--six" />
          <span className="dk-ph-art__backdrop-line dk-ph-art__backdrop-line--one" />
          <span className="dk-ph-art__backdrop-line dk-ph-art__backdrop-line--two" />
          <span className="dk-ph-art__backdrop-line dk-ph-art__backdrop-line--three" />
          <span className="dk-ph-art__backdrop-line dk-ph-art__backdrop-line--four" />
        </div>
      </div>

      <div className="dk-ph-art__layer" data-ph="layer" data-depth="0.5">
        <div className="dk-ph-art__panel dk-ph-art__panel--rear">
          <div className="dk-ph-art__rear-graph">
            <span /><span /><span /><span /><span />
          </div>
          <div className="dk-ph-art__rear-lines">
            <i /><i /><i />
          </div>
        </div>
      </div>

      <div className="dk-ph-art__layer" data-ph="layer" data-depth="0.7">
        <div className="dk-ph-art__panel dk-ph-art__panel--dark">
          <div className="dk-ph-art__flow">
            <span /><span /><span /><span /><span /><span />
          </div>
        </div>
      </div>

      <div className="dk-ph-art__layer" data-ph="layer" data-depth="1">
        <div className="dk-ph-art__panel dk-ph-art__panel--main">
          <div className="dk-ph-art__main-search">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="10.5" cy="10.5" r="6" />
              <path d="m15 15 5 5" />
            </svg>
            <span />
          </div>

          <div className="dk-ph-art__main-content">
            <div className="dk-ph-art__main-copy">
              <span className="dk-ph-art__avatar" />
              <div>
                <i /><i /><i />
              </div>
            </div>

            <div className="dk-ph-art__main-donut">
              <span />
            </div>

            <div className="dk-ph-art__main-chart">
              <span /><span /><span /><span /><span /><span />
            </div>
          </div>
        </div>
      </div>

      <div className="dk-ph-art__layer" data-ph="layer" data-depth="1.5">
        <div className="dk-ph-art__card dk-ph-art__card--stats">
          <div className="dk-ph-art__card-bars">
            <span /><span /><span /><span /><span />
          </div>
          <i />
          <i />
        </div>
      </div>

      <div className="dk-ph-art__layer" data-ph="layer" data-depth="1.7">
        <div className="dk-ph-art__card dk-ph-art__card--search">
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

      <div className="dk-ph-art__layer" data-ph="layer" data-depth="1.4">
        <div className="dk-ph-art__card dk-ph-art__card--check">
          <div><span>✓</span><i /></div>
          <div><span>✓</span><i /></div>
          <div><span>✓</span><i /></div>
        </div>
      </div>

      <div className="dk-ph-art__layer" data-ph="layer" data-depth="1.6">
        <div className="dk-ph-art__card dk-ph-art__card--chart">
          <div className="dk-ph-art__chart-heading">
            <i />
            <i />
          </div>
          <div className="dk-ph-art__chart-ring" />
          <div className="dk-ph-art__chart-bars">
            <span /><span /><span /><span />
          </div>
        </div>
      </div>

      <span className="dk-ph-art__orb dk-ph-art__orb--left" data-ph="orb" data-depth="2" />
      <span className="dk-ph-art__orb dk-ph-art__orb--bottom" data-ph="orb" data-depth="1.8" />
    </div>
  )
}

export function ProductHero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const q = gsap.utils.selector(el)
      const mm = gsap.matchMedia(el)

      // Reduced motion: nothing runs, everything stays in its final state.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const crumbs = q('[data-ph="crumbs"]')
        const label = q('[data-ph="label"]')
        const lines = q('[data-ph="line"]')
        const accent = q('[data-ph="accent"]')
        const desc = q('[data-ph="desc"]')
        const button = q('[data-ph="button"]')
        const visual = q('[data-ph="visual"]')
        const layers = q('[data-ph="layer"]')
        const orbs = q('[data-ph="orb"]')
        const orbitPaths = q('[data-ph="orbit"] path')
        const orbitDots = q('[data-ph="orbit"] circle')
        const bars = q(
          '.dk-ph-art__rear-graph span, .dk-ph-art__main-chart span, .dk-ph-art__card-bars span, .dk-ph-art__chart-bars span',
        )
        const rings = q('.dk-ph-art__main-donut, .dk-ph-art__chart-ring')
        const ticks = q('.dk-ph-art__card--check span')

        // ---- start state ----
        gsap.set([crumbs, label, desc, button], { autoAlpha: 0, y: 16 })
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
          .to(button, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.75)
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
          const movers = q('[data-depth]').map((node: HTMLElement) => ({
            depth: Number(node.dataset.depth ?? 1),
            x: gsap.quickTo(node, 'x', { duration: 0.9, ease: 'power3.out' }),
            y: gsap.quickTo(node, 'y', { duration: 0.9, ease: 'power3.out' }),
          }))
          const onMove = (e: PointerEvent) => {
            const r = el.getBoundingClientRect()
            const nx = gsap.utils.clamp(-1, 1, ((e.clientX - r.left) / r.width - 0.5) * 2)
            const ny = gsap.utils.clamp(-1, 1, ((e.clientY - r.top) / r.height - 0.5) * 2)
            movers.forEach((m: { depth: number; x: (v: number) => void; y: (v: number) => void }) => {
              m.x(-nx * m.depth * PARALLAX)
              m.y(-ny * m.depth * PARALLAX * 0.7)
            })
          }
          const onLeave = () =>
            movers.forEach((m: { x: (v: number) => void; y: (v: number) => void }) => {
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
    <section ref={root} className="dk-ph" aria-labelledby="product-hero-title">
      <div className="dk-ph__grid" aria-hidden="true" />

      <div className="dk-ph__inner">
        <div className="dk-ph__copy">
          <nav className="dk-ph__crumbs" aria-label="Breadcrumb" data-ph="crumbs">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li aria-current="page">Products</li>
            </ol>
          </nav>

          <p className="dk-ph__label" data-ph="label">
            <span />
            Products
          </p>

          <h1 id="product-hero-title" className="dk-ph__title">
            <span className="dk-ph__line">
              <span className="dk-ph__line-in" data-ph="line">Software, built</span>
            </span>
            <span className="dk-ph__line">
              <span className="dk-ph__line-in" data-ph="line">
                the way we <em>wish</em>
              </span>
            </span>
            <span className="dk-ph__line">
              <span className="dk-ph__line-in" data-ph="line">
                <em className="dk-ph__accent" data-ph="accent">software was built.</em>
              </span>
            </span>
          </h1>

          <p className="dk-ph__description" data-ph="desc">
            DIGIKON is a studio that makes its own products — and makes
            software for the companies we believe in. Below are the tools
            we are shipping, in use, and still shaping.
          </p>

          <Link className="dk-ph__button" to="/products#collection" data-ph="button">
            Explore the collection
            <ArrowRight />
          </Link>
        </div>

        <div className="dk-ph__visual" data-ph="visual">
          <DashboardIllustration />
        </div>
      </div>
    </section>
  )
}

export default ProductHero