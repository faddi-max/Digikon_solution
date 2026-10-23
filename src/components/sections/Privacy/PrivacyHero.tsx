
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import bg from '@/assets/images/privacy-hero-bg.png'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'

const STATS = [
  { value: '06', label: 'Chapters', accent: false },
  { value: '01', label: 'Shared goal', accent: true },
  { value: '∞', label: 'Questions welcome', accent: false },
] as const

export function PrivacyHero({
  reviewed = '23 October 2026',
}: {
  reviewed?: string
}) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !root.current) return

      gsap
        .timeline({
          defaults: { ease: 'power3.out' },
          delay: 0.1,
        })
        .from(
          '[data-ph="crumbs"]',
          { autoAlpha: 0, y: 12, duration: 0.5 },
          0,
        )
        .from(
          '[data-ph="label"]',
          { autoAlpha: 0, x: -12, duration: 0.5 },
          0.1,
        )
        .from(
          '[data-ph="line"]',
          { yPercent: 110, duration: 0.85, stagger: 0.1 },
          0.15,
        )
        .from(
          '[data-ph="lead"]',
          { autoAlpha: 0, y: 18, duration: 0.6 },
          0.55,
        )
        .from(
          '[data-ph="card"]',
          { autoAlpha: 0, y: 28, duration: 0.8 },
          0.35,
        )
        .from(
          '[data-ph="stat"]',
          { autoAlpha: 0, y: 14, duration: 0.5, stagger: 0.1 },
          0.8,
        )
        .from(
          '[data-ph="rule"]',
          {
            scaleX: 0,
            transformOrigin: '0 50%',
            duration: 1,
            ease: 'power2.inOut',
          },
          0.7,
        )
        .from(
          '[data-ph="meta"]',
          { autoAlpha: 0, y: 8, duration: 0.5 },
          1.1,
        )
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="privacy-title"
      className="relative isolate -mt-(--header-content-clearance) flex min-h-[620px] flex-col overflow-clip px-(--gutter) pt-[calc(var(--header-content-clearance)+0.5rem)] pb-8 font-sans text-white [--gutter:clamp(1rem,0.32rem+2.86vw,5rem)] sm:min-h-[650px] lg:min-h-[660px] lg:pt-[calc(var(--header-content-clearance)+0.5rem)] lg:pb-8"
      style={{
        backgroundImage: `url("${bg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" data-ph="crumbs">
          <ol className="m-0 flex list-none flex-wrap items-center gap-3 p-0 text-[0.8125rem] leading-4 font-medium">
            <li>
              <Link
                to="/"
                className="-my-3.5 inline-flex items-center gap-2 py-3.5 text-green-500 no-underline transition-colors duration-200 hover:text-green-300"
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-green-500"
                />
                Home
              </Link>
            </li>

            <li
              aria-current="page"
              className="inline-flex items-center gap-3 text-white before:-mr-1 before:size-1.5 before:rotate-45 before:border-t-[1.5px] before:border-r-[1.5px] before:border-white/50 before:content-['']"
            >
              Privacy Policy
            </li>
          </ol>
        </nav>

        {/* Main hero content */}
        <div className="mt-10 grid items-center gap-12 sm:mt-12 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-x-[clamp(2rem,4vw,4rem)]">
          {/* Copy */}
          <div>
            <p
              data-ph="label"
              className="flex items-center gap-2.5 text-[0.8125rem] leading-[18px] font-medium"
            >
              <span
                aria-hidden="true"
                className="size-2 rounded-[1px] bg-green-500"
              />
              Privacy Policy
            </p>

            <h1
              id="privacy-title"
              className="font-display mt-3 text-[clamp(2.5rem,1.4rem+2.3vw,4.125rem)] leading-[1.1] font-normal tracking-[-0.01em]"
            >
              <span className="-mx-[0.1em] -mb-[0.2em] block overflow-clip px-[0.1em] pb-[0.2em]">
                <span data-ph="line" className="block">
                  Privacy is a
                </span>
              </span>

              <span className="-mx-[0.1em] -mb-[0.2em] block overflow-clip px-[0.1em] pb-[0.2em]">
                <span data-ph="line" className="block">
                  <em className="text-green-500 italic">practice.</em>
                </span>
              </span>
            </h1>

            <p
              data-ph="lead"
              className="mt-5 max-w-[30rem] text-base leading-[1.65] text-white/60 lg:text-[1.0625rem]"
            >
              A living guide to the choices, boundaries, and systems behind a
              clearer digital experience.
            </p>
          </div>

          {/* System readout card */}
          <div
            data-ph="card"
            className="rounded-[1.25rem] border border-white/[0.12] bg-white/[0.04] p-5 backdrop-blur-md sm:p-[1.375rem] lg:min-h-[13.5rem] lg:rounded-[1.75rem] lg:px-5 lg:pt-[1.625rem] lg:pb-[2.75rem]"
          >
            <div className="flex items-center justify-between text-[0.625rem] leading-none font-medium tracking-[0.14em] uppercase">
              <span className="text-white/45">System readout</span>

              <span className="flex items-center gap-2 text-green-500">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgb(129_216_112/0.8)]"
                />
                Active
              </span>
            </div>

            <ul
              role="list"
              className="m-0 mt-7 grid list-none grid-cols-3 gap-2 p-0 lg:mt-9 lg:gap-3"
            >
              {STATS.map((s) => (
                <li
                  key={s.label}
                  data-ph="stat"
                  className="flex min-h-[4.5rem] flex-col items-center justify-center rounded-[0.625rem] border border-white/[0.14] bg-white/[0.02] px-1.5 py-3 text-center lg:min-h-20"
                >
                  <span
                    className={`font-display text-[1.5rem] leading-none lg:text-[1.75rem] ${
                      s.accent ? 'text-green-500' : 'text-white'
                    }`}
                  >
                    {s.value}
                  </span>

                  <span className="mt-2 text-[0.5625rem] leading-[1.3] font-medium tracking-[0.12em] text-white/45 uppercase sm:text-[0.625rem]">
                    {s.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom divider */}
      <div
        data-ph="rule"
        aria-hidden="true"
        className="mx-auto mt-10 h-px w-full max-w-[1280px] bg-white/[0.12] sm:mt-12 lg:mt-auto"
      />

      {/* Last reviewed */}
      <p
        data-ph="meta"
        className="mx-auto mt-4 w-full max-w-[1280px] text-[0.75rem] leading-4 text-white/45"
      >
        Last reviewed · sample edition / {reviewed}
      </p>
    </section>
  )
}
