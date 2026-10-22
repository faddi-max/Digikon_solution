import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

import { createBubbleState, nowSeconds } from './faqHeroState'
import { FaqHeroScene } from './FaqHeroScene'
import { FAQ_HERO } from './faqPageData'
import './FaqHero.css'

/** Seconds between hover replays of the answer bubble. */
const REPLAY_COOLDOWN = 2.6

/** Static version of the illustration, shown when WebGL is unavailable or fails. */
function BubblesFallback() {
  return (
    <svg
      className="dk-fh__fallback"
      viewBox="0 0 640 520"
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="dk-fh-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#81d870" stopOpacity=".45" />
          <stop offset="1" stopColor="#b2ee9e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dk-fh-dark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1c3f45" />
          <stop offset="1" stopColor="#03171d" />
        </linearGradient>
      </defs>
      <ellipse cx="330" cy="270" rx="300" ry="230" fill="url(#dk-fh-glow)" />
      <ellipse
        cx="330"
        cy="265"
        rx="250"
        ry="150"
        fill="none"
        stroke="#03171d"
        strokeOpacity=".3"
        transform="rotate(-18 330 265)"
      />
      <rect
        x="80"
        y="130"
        width="130"
        height="190"
        rx="34"
        fill="#81d870"
        fillOpacity=".6"
      />
      <path
        d="M170 110h200a40 40 0 0 1 40 40v130a40 40 0 0 1-40 40H205l-35 48 5-48a40 40 0 0 1-45-40V150a40 40 0 0 1 40-40z"
        fill="url(#dk-fh-dark)"
      />
      <rect x="175" y="160" width="170" height="13" rx="6.5" fill="#8da2a2" />
      <rect x="175" y="194" width="135" height="13" rx="6.5" fill="#8da2a2" />
      <rect x="175" y="228" width="90" height="13" rx="6.5" fill="#8da2a2" />
      <rect
        x="300"
        y="300"
        width="250"
        height="150"
        rx="40"
        fill="#b2ee9e"
        fillOpacity=".45"
      />
      <path
        d="M325 270h200a36 36 0 0 1 36 36v100a36 36 0 0 1-36 36h-25l10 42-48-42H325a36 36 0 0 1-36-36V306a36 36 0 0 1 36-36z"
        fill="#f2faf0"
        fillOpacity=".92"
        stroke="#ffffff"
      />
      <rect x="330" y="312" width="150" height="12" rx="6" fill="#1d3b40" />
      <rect x="330" y="342" width="115" height="12" rx="6" fill="#1d3b40" />
      <rect x="330" y="372" width="58" height="12" rx="6" fill="#9cc79a" />
      <circle cx="510" cy="120" r="46" fill="#f2faf0" stroke="#ffffff" />
      <text
        x="510"
        y="138"
        textAnchor="middle"
        fontFamily="Manrope, system-ui, sans-serif"
        fontWeight="800"
        fontSize="52"
        fill="#81d870"
      >
        ?
      </text>
      <circle cx="420" cy="70" r="10" fill="#81d870" />
      <circle cx="210" cy="420" r="12" fill="#81d870" />
      <circle cx="565" cy="250" r="9" fill="#03171d" />
      <circle cx="150" cy="390" r="5" fill="#03171d" />
    </svg>
  )
}

/**
 * FAQ page hero: breadcrumb, label, "Strong / Answers" headline with a green marker, intro
 * copy, and the Three.js speech-bubble illustration on the right.
 *
 * Layout: two columns from 900px (copy 532 : visual 640 inside a 1200px container, like the
 * service hero), one column below with the illustration under the copy. Type scales fluidly.
 *
 * Motion (GSAP): headline lines rise out of masks, the marker draws in, the copy follows. The
 * scene fades in when its first frame is ready and runs its own entrance. Pointer position and
 * scroll progress go to the scene through a shared mutable object (no React renders).
 * Hovering the illustration replays the answer bubble's typing.
 */
export function FaqHero() {
  const root = useRef<HTMLElement>(null)
  // A plain mutable object; the scene reads it each frame.
  const [state] = useState(createBubbleState)
  const motion = !useMediaQuery('(prefers-reduced-motion: reduce)')
  const lite = useMediaQuery('(max-width: 767px), (pointer: coarse)')
  const [ready, setReady] = useState(false)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const q = (sel: string) => el.querySelector<HTMLElement>(sel)
      const all = (sel: string) =>
        gsap.utils.toArray<HTMLElement>(el.querySelectorAll(sel))

      const crumbs = q('[data-fh="crumbs"]')
      const label = q('[data-fh="label"]')
      const lines = all('[data-fh="line"]')
      const accent = q('[data-fh="accent"]')
      const body = q('[data-fh="body"]')
      const copy = q('[data-fh="copy"]')
      const visual = q('[data-fh="visual"]')

      const mm = gsap.matchMedia(el)

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set([crumbs, label, body], { autoAlpha: 0, y: 18 })
        gsap.set(lines, { yPercent: 110 })
        if (accent) gsap.set(accent, { '--mk': 0 })

        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          delay: 0.1,
        })
        tl.to(
          [crumbs, label],
          { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 },
          0,
        )
        tl.to(lines, { yPercent: 0, duration: 0.85, stagger: 0.12 }, 0.15)
        if (accent)
          tl.to(
            accent,
            { '--mk': 1, duration: 0.8, ease: 'power2.inOut' },
            0.75,
          )
        tl.to(body, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.6)

        // Scroll: the copy lifts away a touch faster than the page; the scene drifts on its own.
        if (copy) {
          gsap.to(copy, {
            yPercent: -8,
            autoAlpha: 0.35,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          })
        }
        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          onUpdate: (self) => {
            state.scroll = self.progress
          },
        })

        // Pointer: tilt and parallax in the scene. Mouse and pen only.
        const onMove = (e: PointerEvent) => {
          if (e.pointerType === 'touch') return
          const r = el.getBoundingClientRect()
          state.px = ((e.clientX - r.left) / r.width) * 2 - 1
          state.py = ((e.clientY - r.top) / r.height) * 2 - 1
          state.on = 1
        }
        const onLeave = () => {
          state.on = 0
        }
        // Hovering the illustration makes the team "answer" again.
        const onEnterVisual = (e: PointerEvent) => {
          if (e.pointerType === 'touch') return
          const now = nowSeconds()
          if (now - state.replayAt > REPLAY_COOLDOWN) state.replayAt = now
        }
        el.addEventListener('pointermove', onMove)
        el.addEventListener('pointerleave', onLeave)
        visual?.addEventListener('pointerenter', onEnterVisual)

        return () => {
          st.kill()
          el.removeEventListener('pointermove', onMove)
          el.removeEventListener('pointerleave', onLeave)
          visual?.removeEventListener('pointerenter', onEnterVisual)
          state.on = 0
          state.scroll = 0
        }
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="dk-fh" aria-labelledby="faq-hero-title">
      <div className="dk-fh__inner">
        <div className="dk-fh__copy" data-fh="copy">
          <nav
            className="dk-fh__crumbs"
            aria-label="Breadcrumb"
            data-fh="crumbs"
          >
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li aria-current="page">{FAQ_HERO.crumb}</li>
            </ol>
          </nav>

          <p className="dk-fh__label" data-fh="label">
            <span className="dk-fh__label-dot" aria-hidden="true" />
            {FAQ_HERO.label}
          </p>

          <h1 id="faq-hero-title" className="dk-fh__h1">
            <span className="dk-fh__line">
              <span className="dk-fh__line-in" data-fh="line">
                {FAQ_HERO.line}
              </span>
            </span>{' '}
            <span className="dk-fh__line">
              <span className="dk-fh__line-in" data-fh="line">
                <em className="dk-fh__accent" data-fh="accent">
                  {FAQ_HERO.accent}
                </em>
              </span>
            </span>
          </h1>

          <p className="dk-fh__body" data-fh="body">
            {FAQ_HERO.body}
          </p>
        </div>

        <div
          className={ready ? 'dk-fh__visual is-ready' : 'dk-fh__visual'}
          data-fh="visual"
        >
          <FaqHeroScene
            state={state}
            motion={motion}
            lite={lite}
            fallback={<BubblesFallback />}
            onReady={() => setReady(true)}
          />
        </div>
      </div>
    </section>
  )
}
