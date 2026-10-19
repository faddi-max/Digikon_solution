import { Link } from 'react-router-dom'

import gridSrc from '@/assets/images/cta-grid.png'
import { ScrollRevealText } from '@/components/motion/ScrollRevealText'
import { Reveal } from '@/components/motion/Reveal'

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

const panelCls =
  'relative flex flex-col justify-center gap-[44px] p-6 sm:p-10 lg:min-h-[454px] ' +
  'lg:p-[clamp(40px,4vw,76.8px)]'

const headingCls =
  'm-0 max-w-[10em] font-display text-[clamp(36px,3.5vw,68px)] font-normal leading-[1.08] ' +
  'tracking-[-0.02em] text-wrap'

const btnCls =
  'inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full px-6 text-[15px] ' +
  'font-semibold leading-6 no-underline transition-colors duration-200 ease-out ' +
  'focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none'

export function CtaSection() {
  return (
    <section
      id="start"
      aria-label="Start a project or book a call"
      className="grid w-full grid-cols-1 font-sans lg:grid-cols-2"
    >
      {/* Left: write to us */}
      <div className={`${panelCls} bg-green-500 text-teal-900`}>
        <ScrollRevealText
          as="h2"
          className={headingCls}
          text="Tell us what you're building."
          split="words"
          mode="play"
          duration={1.6}
          stagger={0.1}
          yOffset={20}
          start="top 85%"
        />

        <Reveal className="grid justify-items-start gap-[44px]">
          <p className="m-0 max-w-[22rem] text-[14px] leading-[1.7] text-teal-900 sm:text-[16px]">
            Write to us and we’ll reply with an honest view of what would help.
          </p>
          <Link
            to="/contact"
            className={`${btnCls} bg-teal-900 text-white hover:bg-teal-800 focus-visible:outline-teal-900`}
          >
            Start a project <ArrowIcon />
          </Link>
        </Reveal>
      </div>

      {/* Right: book a call */}
      <div
        className={`${panelCls} isolate overflow-hidden bg-[linear-gradient(135deg,#1C2E33_0%,#03171D_100%)] text-canvas-50`}
      >
        <img
          src={gridSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full select-none object-cover opacity-20"
        />

        <ScrollRevealText
          as="h2"
          className={headingCls}
          text="Or book a call."
          split="words"
          mode="play"
          duration={1.6}
          stagger={0.1}
          yOffset={20}
          start="top 85%"
        />

        <Reveal className="grid justify-items-start gap-[44px]">
          <p className="m-0 max-w-[22rem] text-[14px] leading-[1.7] text-canvas-50/70 sm:text-[16px]">
            Thirty minutes, no pitch deck.
          </p>
          <Link
            to="/contact"
            className={`${btnCls} bg-white text-teal-900 hover:bg-green-500 focus-visible:outline-green-500`}
          >
            Book intro call <ArrowIcon />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
