import { useRef } from 'react'
import { Link } from 'react-router-dom'

import dkMark from '@/assets/images/dk-mark.svg?url'
import footerBgLogo from '@/assets/images/footer-bg-logo.png'
import { ScrollRevealText } from '@/components/motion/ScrollRevealText'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

const EXPLORE = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/work' },
  { label: 'Products', href: '/products' },
]

const MORE = [
  { label: 'Process', href: '/how-it-works' },
  { label: 'FAQs', href: '/faqs' },
   { label: 'Privacy Policy', href: '/privacy-policy' },
]

const titleCls =
  'm-0 text-[11px] font-bold uppercase leading-none tracking-[0.14em] text-green-500'

const listCls = 'mt-6 grid list-none gap-3.5 p-0'

const linkCls =
  'relative inline-block rounded-sm text-[15px] leading-[1.4] text-canvas-50/80 no-underline ' +
  'transition-colors duration-200 ease-out hover:text-canvas-50 focus-visible:text-canvas-50 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-500 ' +
  'after:absolute after:inset-x-0 after:-bottom-[3px] after:h-px after:origin-left after:scale-x-0 ' +
  'after:bg-green-500 after:transition-transform after:duration-300 ' +
  'hover:after:scale-x-100 focus-visible:after:scale-x-100 ' +
  'motion-reduce:transition-none motion-reduce:after:transition-none'

const chipCls =
  'inline-block rounded-[3px] border border-canvas-50/30 px-2 py-[3px] text-[9.5px] font-bold ' +
  'uppercase leading-[1.2] tracking-[0.12em] text-canvas-50/80 no-underline ' +
  'transition-colors duration-200 hover:text-canvas-50 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-500'

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

      // Very slow drift on the background logo so it never feels static.
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
      className="text-canvas-50 relative isolate w-full overflow-hidden bg-teal-900 font-sans"
    >
      {/* Background logo. The PNG already has its own alpha: teal D, green K. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <img
          ref={logo}
          src={footerBgLogo}
          alt=""
          draggable={false}
          className="absolute -top-[30%] -left-[40%] w-[180%] max-w-none select-none md:-left-[20%] md:w-[140%] lg:-top-[67%] lg:-left-[14%] lg:w-[110%]"
        />
      </div>

      <div className="px-6 pt-[72px] pb-8 sm:px-[6vw] sm:pt-24 lg:px-[8vw] xl:pt-[clamp(96px,6.7vw,130px)] xl:pr-[17%] xl:pb-[clamp(28px,2vw,40px)] xl:pl-[19.6%]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_43%] lg:items-start lg:gap-0">
          <ScrollRevealText
            as="h2"
            className="font-display text-canvas-50 m-0 max-w-none text-[clamp(40px,4.2vw,84px)] leading-[1.06] font-normal tracking-[-0.02em] text-wrap [font-synthesis:none]"
            text="Let's build change together."
            split="words"
            mode="play"
            duration={1.8}
            stagger={0.12}
            yOffset={22}
            start="top 85%"
          />

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-[1fr_1fr_1.2fr]">
            <nav aria-label="Explore" data-foot="col" className="min-w-0">
              <h3 className={titleCls}>Explore</h3>
              <ul className={listCls}>
                {EXPLORE.map((l) => (
                  <li key={l.label}>
                    <Link className={linkCls} to={l.href}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="More" data-foot="col" className="min-w-0">
              <h3 className={titleCls}>More</h3>
              <ul className={listCls}>
                {MORE.map((l) => (
                  <li key={l.label}>
                    <Link className={linkCls} to={l.href}>
                      {l.label}
                    </Link>
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
          className="mt-[clamp(72px,8.7vw,168px)] flex flex-col items-start gap-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        >
          <img
            src={dkMark}
            alt="DigiKon"
            width={48}
            height={36}
            draggable={false}
            className="-my-[5px] -ml-[3.8px] h-9 w-12 flex-none select-none"
          />
          <p className="text-canvas-50/50 m-0 text-[13px] leading-[1.4] tracking-[0.01em]">
            Intelligent system. Real revenue.
          </p>
          <p className="text-canvas-50/50 m-0 text-[13px] leading-[1.4] tracking-[0.01em]">
            © 2026 DigiKon Solutions · Contact details are placeholders
          </p>
        </div>
      </div>
    </footer>
  )
}
