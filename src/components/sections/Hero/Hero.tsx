import { useEffect, useRef } from 'react'

import { CtaButton } from '../../ui/CtaButton'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

import { HeroOrbit } from './HeroOrbit'
import './Hero.css'

function ArrowIcon() {
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

/**
 * Headline split into word masks so each word can rise out of its own clip.
 * The words and the "revenue." emphasis match the original copy exactly.
 */
const HEADLINE_BEFORE = ['Connected', 'digital', 'systems', 'that', 'turn', 'attention', 'into']

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const orbit = useRef<HTMLDivElement>(null)
  const magnet = useRef<HTMLSpanElement>(null)

  // Entrance timeline and scroll depth. Reduced motion skips both,
  // so the page renders in its final state.
   useGSAP(
    () => {
      if (prefersReducedMotion() || !root.current || !content.current || !orbit.current) return

      // Stop the browser restoring an old scroll position on reload.
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
      window.scrollTo(0, 0)

      // Built paused. The from() states apply immediately, so nothing flashes.
      const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
      intro
        .from('[data-hero="badge"]', { autoAlpha: 0, y: 16, duration: 1.0 }, 0.2)
        .from(
          '[data-hero="word"]',
          { yPercent: 110, duration: 1.5, stagger: 0.12, ease: 'power4.out' },
          0.45,
        )
        .from('[data-hero="bar"]', { scaleX: 0, duration: 1.2, ease: 'power2.inOut' }, '-=0.9')
        .from('[data-hero="lead"]', { autoAlpha: 0, y: 26, duration: 1.3 }, '-=1.0')
        .from('[data-hero="action"]', { autoAlpha: 0, y: 22, duration: 1.1, stagger: 0.14 }, '-=1.0')
        // No rotation here: a tilted canvas skews the 3D scene and its labels.
        .from(orbit.current, { autoAlpha: 0, scale: 0.9, duration: 2.0, ease: 'power3.out' }, 0.5)

      document.fonts.ready.then(() => {
        intro.play(0)
        ScrollTrigger.refresh()
      })

      // Depth on scroll, kept inside the hero so nothing slides under the About section.
      // The copy moves up faster than the orbit, which reads as the orbit sitting further back.
      const scrub = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
      gsap.to(content.current, { yPercent: -12, autoAlpha: 0.35, ease: 'none', scrollTrigger: scrub })
      gsap.to(orbit.current, { yPercent: -4, ease: 'none', scrollTrigger: scrub })
    },
    { scope: root },
  )

  // Magnetic pull on the primary CTA, only on fine pointers.
  useEffect(() => {
    const el = magnet.current
    if (!el || prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return

    const ease = 'elastic.out(1, 0.45)'
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease })

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * 0.25)
      yTo((e.clientY - (r.top + r.height / 2)) * 0.25)
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <section ref={root} className="dk-hero" aria-labelledby="hero-title">
      <div className="container-page dk-hero__inner">
        <div ref={content} className="dk-hero__content">
          <p data-hero="badge" className="dk-badge">
            <span className="dk-badge__dot" aria-hidden="true" />
            Intelligent system. Real revenue.
          </p>

          <h1 id="hero-title" className="dk-hero__title">
            {HEADLINE_BEFORE.map((word) => (
              <span className="dk-word" key={word}>
                <span className="dk-word__inner" data-hero="word">
                  {word}
                </span>
              </span>
            )).reduce<React.ReactNode[]>((acc, node, i) => {
              acc.push(node)
              acc.push(' ')
              return acc
            }, [])}
            <span className="dk-hl">
              <span className="dk-hl__bar" data-hero="bar" aria-hidden="true" />
              <span className="dk-word">
                <span className="dk-word__inner" data-hero="word">
                  <em>revenue.</em>
                </span>
              </span>
            </span>
          </h1>

          <p data-hero="lead" className="dk-hero__lead">
            DigiKon brings search, web, content, data and automation together, so every
            channel feeds the next and growth is measurable, not hoped for.
          </p>

          <div className="dk-hero__actions">
            <span ref={magnet} className="dk-magnet" data-hero="action">
              <CtaButton className="dk-hero__cta" href="#contact">
                Start a project <ArrowIcon />
              </CtaButton>
            </span>

            <a data-hero="action" className="dk-hero__link" href="#services">
              Explore services <ArrowIcon />
            </a>
          </div>
        </div>

        <div ref={orbit} className="dk-hero__orbit">
          <HeroOrbit />
        </div>
      </div>
    </section>
  )
}