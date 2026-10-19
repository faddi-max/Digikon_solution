import { useRef } from 'react'
import { Link } from 'react-router-dom'

import dkMark from '@/assets/images/dk-mark.svg?url'
import footerBgLogo from '@/assets/images/footer-bg-logo.png'
import { ScrollRevealText } from '@/components/motion/ScrollRevealText'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

type FooterLink = { label: string; href: string }

const EXPLORE: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/work' },
  { label: 'Products', href: '/products' },
]

const MORE: FooterLink[] = [
  { label: 'Process', href: '/how-it-works' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'FAQs', href: '/faqs' },
]

/*
 * Measured from the Figma 1920 frame (about 1920 x 465):
 *   content 360px to 1494px (18.75% / 22.2% margins), columns at 1010 / 1175 / 1342,
 *   headline 72px on a 78px line, links 14px with a 34px pitch, rule at y 382,
 *   bottom row 28px under the rule, DK mark about 38 x 26.
 */
const titleCls =
  'm-0 text-[11px] font-bold uppercase leading-none tracking-[0.14em] text-green-500'

const listCls = 'mt-6 grid list-none gap-[13px] p-0 text-[14px] leading-[21px] *:flex'

const linkCls =
  'relative inline-block whitespace-nowrap rounded-sm text-[14px] leading-[21px] text-canvas-50/80 no-underline ' +
  'transition-colors duration-200 ease-out hover:text-canvas-50 focus-visible:text-canvas-50 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-500 ' +
  'after:absolute after:inset-x-0 after:-bottom-[3px] after:h-px after:origin-left after:scale-x-0 ' +
  'after:bg-green-500 after:transition-transform after:duration-300 ' +
  'hover:after:scale-x-100 focus-visible:after:scale-x-100 ' +
  'motion-reduce:transition-none motion-reduce:after:transition-none'

const chipCls =
  'inline-block whitespace-nowrap rounded-[3px] border border-canvas-50/35 px-[14px] py-[6px] text-[10px] font-bold ' +
  'uppercase leading-[11px] tracking-[0.12em] text-canvas-50/80 no-underline ' +
  'transition-colors duration-200 hover:text-canvas-50 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-500'

const metaCls = 'm-0 text-[13px] leading-[1.4] tracking-[0.01em] text-canvas-50/50'

function FooterNavLink({ link }: { link: FooterLink }) {
  // Hash links point at a home-page section, so they use a plain anchor.
  return link.href.includes('#') ? (
    <a className={linkCls} href={link.href}>
      {link.label}
    </a>
  ) : (
    <Link className={linkCls} to={link.href}>
      {link.label}
    </Link>
  )
}

export function Footer() {
  const root = useRef<HTMLElement>(null)
  const logo = useRef<HTMLImageElement>(null)

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top 85%',
            toggleActions: 'restart none restart reset',
          },
        })
        .from('[data-foot="col"]', {
          autoAlpha: 0,
          y: 24,
          duration: 1.4,
          stagger: 0.12,
          ease: 'power3.out',
        })
        .from(
          '[data-foot="bottom"]',
          { autoAlpha: 0, y: 12, duration: 1.2, ease: 'power3.out' },
          0.5,
        )

      // Very slow drift on the glow so it never feels static.
      if (logo.current) {
        gsap.to(logo.current, {
          y: 14,
          duration: 12,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      }
    },
    { scope: root },
  )

  return (
    <footer
      ref={root}
      id="contact"
      className="relative isolate w-full overflow-hidden bg-teal-900 font-sans text-canvas-50"
    >
      {/*
        Blurred DK glow. Placement is fitted to the Figma frame at 1920:
        left 540px, top -20px, width 960px (28.125vw, -1.04vw, 50vw).
        Tablet and phone get their own placement so the green still sits behind the links.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <img
          ref={logo}
          src={footerBgLogo}
          alt=""
          draggable={false}
          className="absolute -left-[10%] top-[20%] w-[130%] max-w-none select-none opacity-65 md:left-[30%] md:-top-[10%] md:w-[80%] lg:left-[28.125vw] lg:-top-[1.04vw] lg:w-[50vw] lg:opacity-100"
        />
      </div>

      <div className="px-6 pt-[72px] pb-8 sm:px-[8vw] sm:pt-24 lg:pt-[clamp(96px,5.78vw,128px)] lg:pb-7 min-[1440px]:pr-[22.2%] min-[1440px]:pl-[18.75%]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_42.68%] lg:items-start lg:gap-0">
          <ScrollRevealText
            as="h2"
            className="m-0 max-w-none font-display text-[clamp(40px,3.75vw,84px)] leading-[1.083] font-normal tracking-[-0.02em] text-canvas-50 text-wrap! [font-synthesis:none] lg:-mt-[3px]"
            text="Let's build change together."
            split="words"
            mode="play"
            duration={1.8}
            stagger={0.12}
            yOffset={22}
            start="top 85%"
          />

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-[165fr_167fr_152fr] sm:gap-x-4 lg:gap-x-0">
            <nav aria-label="Explore" data-foot="col" className="min-w-0">
              <h3 className={titleCls}>Explore</h3>
              <ul className={listCls}>
                {EXPLORE.map((l) => (
                  <li key={l.label}>
                    <FooterNavLink link={l} />
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="More" data-foot="col" className="min-w-0">
              <h3 className={titleCls}>More</h3>
              <ul className={listCls}>
                {MORE.map((l) => (
                  <li key={l.label}>
                    <FooterNavLink link={l} />
                  </li>
                ))}
              </ul>
            </nav>

            <div data-foot="col" className="col-span-2 min-w-0 sm:col-span-1">
              <h3 className={titleCls}>Contact</h3>
              <ul className={listCls}>
                <li>
                  <a className={linkCls} href="mailto:hello@example.com">
                    hello@example.com
                  </a>
                </li>
                <li>
                  <Link className={chipCls} to="/contact">
                    Placeholder
                  </Link>
                </li>
                <li>
                  <Link className={linkCls} to="/">
                    Back to top ↑
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          data-foot="bottom"
          className="mt-[clamp(72px,5.89vw,130px)] flex flex-col items-start gap-3.5 border-t border-t-canvas-50/12 pt-7 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        >
          {/* DK mark from assets. The SVG has built-in padding, so it is offset to line up with the content edge. */}
          <img
            src={dkMark}
            alt="DigiKon"
            width={48}
            height={36}
            draggable={false}
            className="-my-[5px] -ml-[3.8px] h-9 w-12 flex-none select-none"
          />
          <p className={metaCls}>Intelligent system. Real revenue.</p>
          <p className={metaCls}>
            © 2026 DigiKon Solutions · Contact details are placeholders
          </p>
        </div>
      </div>
    </footer>
  )
}
