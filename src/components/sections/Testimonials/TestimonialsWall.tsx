import { useRef } from 'react'

import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

import { CLIENT_LOGOS, WALL_COPY, type ClientLogo } from './testimonialsWallData'
import './TestimonialsWall.css'

function LogoCell({ logo }: { logo: ClientLogo }) {
  return (
    <li className="dk-tw__cell" data-tw="cell">
      {logo.src ? (
        <img
          className="dk-tw__logo"
          src={logo.src}
          alt={logo.name}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ) : (
        <span className="dk-tw__ph" aria-hidden="true">
          Client
          <br />
          Logo
        </span>
      )}
    </li>
  )
}

export function TestimonialsWall() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return

      gsap.set('[data-tw="eyebrow"]', { autoAlpha: 0, y: 16 })
      gsap.set('[data-tw="cell"]', { autoAlpha: 0, y: 20 })

      gsap
        .timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
        })
        .to('[data-tw="eyebrow"]', { autoAlpha: 1, y: 0, duration: 0.6 })
        .to('[data-tw="cell"]', { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.07 }, 0.15)
    },
    { scope: root },
  )

  return (
    <section ref={root} className="dk-tw" aria-labelledby="trusted-by-title">
      <div className="dk-tw__inner">
        <h2 id="trusted-by-title" className="dk-tw__eyebrow" data-tw="eyebrow">
          <span className="dk-tw__dot" aria-hidden="true" />
          {WALL_COPY.eyebrow}
        </h2>

        <ul className="dk-tw__grid" role="list">
          {CLIENT_LOGOS.map((logo) => (
            <LogoCell key={logo.id} logo={logo} />
          ))}
        </ul>
      </div>
    </section>
  )
}