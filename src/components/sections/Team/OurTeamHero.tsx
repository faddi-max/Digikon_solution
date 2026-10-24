import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { TEAM } from '@/components/sections/About/teamData'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap, useGSAP } from '@/lib/motion'

import { TeamBackdrop } from './TeamBackdrop'
import './OurTeam.css'

/** Display order for this page. Portraits and copy come from the About team data. */
const ORDER = ['alex-morgan', 'lina-ahmed', 'sara-khan', 'noah-carter', 'daniel-reed',
  
  'noah-carter',
  'daniel-reed',
'lina-ahmed',
'alex-morgan',
  'sara-khan',]
const MEMBERS = ORDER.map((id) => TEAM.find((m) => m.id === id)).filter(
  (m): m is (typeof TEAM)[number] => Boolean(m),
)

const pad = (n: number) => String(n).padStart(2, '0')
const TILT = 6

export function OurTeamHero() {
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const q = (s: string) => el.querySelector<HTMLElement>(s)
      const all = (s: string) => gsap.utils.toArray<HTMLElement>(el.querySelectorAll(s))
      const mm = gsap.matchMedia(el)

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const crumbs = q('[data-tp="crumbs"]')
        const eyebrow = q('[data-tp="eyebrow"]')
        const lead = q('[data-tp="lead"]')
        const lines = all('[data-tp="line"]')
        const grid = q('[data-tp="grid"]')
        const slots = all('[data-tp="slot"]')
        const cards = all('[data-tp="card"]')
        const imgs = all('[data-tp="img"]')

        gsap.set([crumbs, eyebrow, lead], { autoAlpha: 0, y: 16 })
        gsap.set(lines, { yPercent: 110 })
        gsap.set(cards, { autoAlpha: 0, y: 56, clipPath: 'inset(0 0 100% 0 round 14px)' })
        gsap.set(imgs, { scale: 1.3 })

        gsap
          .timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 })
          .to(crumbs, { autoAlpha: 1, y: 0, duration: 0.5 }, 0)
          .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.1)
          .to(lines, { yPercent: 0, duration: 0.9, stagger: 0.12, ease: 'power4.out' }, 0.2)
          .to(lead, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.65)

        // Cards unveil from the top down, left to right, as the grid scrolls into view.
        gsap
          .timeline({
            defaults: { ease: 'power3.out' },
            scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
          })
          .to(
            cards,
            {
              autoAlpha: 1,
              y: 0,
              clipPath: 'inset(0 0 0% 0 round 14px)',
              duration: 1.1,
              stagger: 0.1,
              onComplete: () => {
                gsap.set(cards, { clearProps: 'clipPath' })
              },
            },
            0,
          )
          .to(imgs, { scale: 1, duration: 1.6, stagger: 0.1, ease: 'power2.out' }, 0)

        // Alternate cards drift at different speeds while scrolling, for depth.
        const wide = () => window.matchMedia('(min-width: 700px)').matches
        slots.forEach((s, i) => {
          gsap.fromTo(
            s,
            { yPercent: () => (wide() ? (i % 2 ? 5 : -3) : 0) },
            {
              yPercent: () => (wide() ? (i % 2 ? -5 : 3) : 0),
              ease: 'none',
              scrollTrigger: {
                trigger: grid,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          )
        })

        // Pointer tilt with a moving highlight, fine pointers only.
        const cleanups: Array<() => void> = []
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          slots.forEach((slot) => {
            const card = slot.querySelector<HTMLElement>('[data-tp="card"]')
            if (!card) return
            gsap.set(card, { transformPerspective: 900 })
            const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' })
            const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' })
            const move = (e: PointerEvent) => {
              const r = card.getBoundingClientRect()
              const px = (e.clientX - r.left) / r.width
              const py = (e.clientY - r.top) / r.height
              ry((px - 0.5) * TILT * 2)
              rx((0.5 - py) * TILT * 2)
              card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
              card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
            }
            const leave = () => {
              rx(0)
              ry(0)
            }
            slot.addEventListener('pointermove', move)
            slot.addEventListener('pointerleave', leave)
            cleanups.push(() => {
              slot.removeEventListener('pointermove', move)
              slot.removeEventListener('pointerleave', leave)
            })
          })
        }
        return () => cleanups.forEach((fn) => fn())
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      className="dk-tp"
      data-ready={ready}
      aria-labelledby="our-team-title"
    >
      <div className="dk-tp__bg" aria-hidden="true">
        <span className="dk-tp__ring dk-tp__ring--a" />
        <span className="dk-tp__ring dk-tp__ring--b" />
      </div>
      <TeamBackdrop motion={!reduced} onReady={() => setReady(true)} />

      <div className="dk-tp__inner">
        <nav className="dk-tp__crumbs" aria-label="Breadcrumb" data-tp="crumbs">
          <ol>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li aria-current="page">Our Team</li>
          </ol>
        </nav>

        <p className="dk-tp__eyebrow" data-tp="eyebrow">
          <span aria-hidden="true" />
          Our Team
        </p>

        <h1 id="our-team-title" className="dk-tp__h1">
          <span className="dk-tp__line">
            <span className="dk-tp__line-in" data-tp="line">
              Meet our <em>brilliant</em>
            </span>
          </span>
          <span className="dk-tp__line">
            <span className="dk-tp__line-in" data-tp="line">
              team.
            </span>
          </span>
        </h1>

        <p className="dk-tp__lead" data-tp="lead">
          Good work comes from good people. Meet the strategists, creators, and problem-solvers
          bringing thoughtful ideas to life at DigiKon.
        </p>

        <ul className="dk-tp__grid" data-tp="grid" aria-label="DigiKon team members">
          {MEMBERS.map((m, i) => (
            <li className="dk-tp__slot" data-tp="slot" key={m.id}>
              <article className="dk-tp__card" data-tp="card" tabIndex={0}>
                <img
                  className="dk-tp__img"
                  data-tp="img"
                  src={m.image}
                  alt={`Portrait of ${m.name}`}
                  width={600}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
                <span className="dk-tp__shade" aria-hidden="true" />
                <span className="dk-tp__sheen" aria-hidden="true" />
                <div className="dk-tp__info">
                  <p className="dk-tp__tag">
                    {pad(i + 1)} / {m.tag}
                  </p>
                  <h2 className="dk-tp__name">{m.name}</h2>
                  <p className="dk-tp__role">{m.role}</p>
                  <div className="dk-tp__bio">
                    <p>{m.bio}</p>
                  </div>
                </div>
                <span className="dk-tp__rule" aria-hidden="true" />
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}