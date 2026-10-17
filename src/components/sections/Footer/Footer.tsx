import {  useRef } from 'react'

import { ScrollRevealText } from '@/components/motion/ScrollRevealText'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

import './Footer.css'

const EXPLORE = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#work' },
  { label: 'Products', href: '#products' },
]

const MORE = [
  { label: 'Process', href: '#how-it-works' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQs', href: '#faqs' },
]

/**
 * Footer mark. Replace the paths with the exported DK glyph from Figma so it
 * matches the header and centre disc exactly.
 */
function FooterMark() {
  return (
    <svg viewBox="0 0 40 26" width="38" height="25" aria-hidden="true">
      <path
        d="M2 3h9a10 10 0 0 1 0 20H2z"
        fill="none"
        stroke="#F7F8F5"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M22 3l14 10-14 10"
        fill="none"
        stroke="#81D870"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Footer() {
  const root = useRef<HTMLElement>(null)
  const orbA = useRef<HTMLDivElement>(null)
  const orbB = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return

      const enter = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
      })
      enter
        .from('[data-foot="col"]', {
          autoAlpha: 0,
          y: 24,
          duration: 1.4,
          stagger: 0.12,
          ease: 'power3.out',
        })
        .from(
          '[data-foot="rule"]',
          { scaleX: 0, duration: 1.8, ease: 'power3.inOut', transformOrigin: 'left center' },
          0.3,
        )
        .from('[data-foot="bottom"]', { autoAlpha: 0, y: 12, duration: 1.2, ease: 'power3.out' }, 0.6)

      // Glows drift slowly and out of phase, so the background never looks static.
      if (orbA.current) {
        gsap.to(orbA.current, { x: -48, y: 32, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      }
      if (orbB.current) {
        gsap.to(orbB.current, { x: 40, y: -26, duration: 11, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      }
    },
    { scope: root },
  )

  return (
    <footer ref={root} className="dk-footer" id="contact">
      <div className="dk-footer__glows" aria-hidden="true">
        <div ref={orbA} className="dk-footer__orb dk-footer__orb--a" />
        <div ref={orbB} className="dk-footer__orb dk-footer__orb--b" />
      </div>

      <div className="dk-footer__inner">
        <div className="dk-footer__main">
          <ScrollRevealText
            as="h2"
            className="dk-footer__headline"
            text="Let's build change together."
            split="words"
            mode="play"
            duration={1.8}
            stagger={0.12}
            yOffset={22}
            start="top 85%"
          />

          <div className="dk-footer__cols">
            <nav className="dk-footer__col" aria-label="Explore" data-foot="col">
              <h3 className="dk-footer__title">Explore</h3>
              <ul className="dk-footer__list">
                {EXPLORE.map((l) => (
                  <li key={l.label}>
                    <a className="dk-footer__link" href={l.href}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="dk-footer__col" aria-label="More" data-foot="col">
              <h3 className="dk-footer__title">More</h3>
              <ul className="dk-footer__list">
                {MORE.map((l) => (
                  <li key={l.label}>
                    <a className="dk-footer__link" href={l.href}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="dk-footer__col dk-footer__col--contact" data-foot="col">
              <h3 className="dk-footer__title">Contact</h3>
              <ul className="dk-footer__list">
                <li>
                  <a className="dk-footer__link" href="mailto:hello@example.com">
                    hello@example.com
                  </a>
                </li>
                <li>
                  <a className="dk-footer__link dk-footer__link--chip" href="#contact">
                    Placeholder
                  </a>
                </li>
                <li>
                  <a className="dk-footer__link" href="#top">
                    Back to top ↑
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="dk-footer__rule" data-foot="rule" aria-hidden="true" />

        <div className="dk-footer__bottom" data-foot="bottom">
          <div className="dk-footer__brand">
            <FooterMark />
          </div>
          <p className="dk-footer__tagline">Intelligent system. Real revenue.</p>
          <p className="dk-footer__copy">© 2026 DigiKon Solutions · Contact details are placeholders</p>
        </div>
      </div>
    </footer>
  )
}