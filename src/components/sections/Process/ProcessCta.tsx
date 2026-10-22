import { useRef } from 'react'
import { Link } from 'react-router-dom'

import teamImg from '@/assets/images/about-hero-team.png'
import { gsap, useGSAP } from '@/lib/motion'

/** Each sentence sits in a clip so it rises out of it instead of fading. */
const MASK = '-mx-[0.1em] -mb-[0.2em] block overflow-clip px-[0.1em] pb-[0.2em]'

/**
 * How it works: closing banner below the stages.
 *
 * Layout: one dark rounded card inside the page frame. From md up the copy panel takes the
 * left ~40% and the photo the rest (card keeps a wide, short banner shape). Below md the
 * photo sits on top as a 16:10 strip and the copy follows, so the heading never squeezes.
 *
 * Motion (GSAP, once on enter): the card opens from a slightly inset clip, the photo settles
 * from a small zoom, both sentences rise out of their masks, then the paragraph and link fade
 * up. The link's green rule stretches on hover/focus (CSS). Reduced motion shows the final
 * state with no tweens.
 */
export function ProcessCta() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const q = gsap.utils.selector(el)

      const mm = gsap.matchMedia(el)
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(q('[data-pc="card"]'), { clipPath: 'inset(4% 3% 4% 3% round 1.5rem)' })
        gsap.set(q('[data-pc="img"]'), { scale: 1.1 })
        gsap.set(q('[data-pc="line"]'), { yPercent: 110 })
        gsap.set(q('[data-pc="fade"]'), { autoAlpha: 0, y: 16 })

        gsap
          .timeline({
            defaults: { ease: 'power3.out' },
            scrollTrigger: { trigger: el, start: 'top 75%', once: true },
          })
          .to(q('[data-pc="card"]'), { clipPath: 'inset(0% 0% 0% 0% round 1.5rem)', duration: 1, ease: 'power3.inOut' }, 0)
          .to(q('[data-pc="img"]'), { scale: 1, duration: 1.6, ease: 'power2.out' }, 0)
          .to(q('[data-pc="line"]'), { yPercent: 0, duration: 0.9, stagger: 0.12, ease: 'power4.out' }, 0.35)
          .to(q('[data-pc="fade"]'), { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.7)
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="process-cta-title"
      className="bg-white py-16 font-sans sm:py-20 lg:py-24"
    >
      <div className="container-page">
        <div
          data-pc="card"
          className="grid overflow-hidden rounded-[1.5rem] bg-[#101c1d] text-white md:min-h-[clamp(22rem,30vw,27rem)] md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
        >
          <div className="order-2 flex flex-col justify-center p-7 sm:p-10 md:order-1 lg:p-12 xl:px-14">
            <p data-pc="fade" className="text-[0.75rem] font-semibold tracking-[0.12em] text-green-500 uppercase">
              What happens next
            </p>

            <h2
              id="process-cta-title"
              className="font-display mt-4 max-w-[7em] text-[clamp(2.25rem,1.6rem+2.4vw,3.5rem)] leading-[1.05] font-normal"
            >
              <span className={MASK}>
                <span data-pc="line" className="block">
                  Built with purpose.
                </span>
              </span>
              <span className={MASK}>
                <span data-pc="line" className="block">
                  Ready for what&rsquo;s next.
                </span>
              </span>
            </h2>

            <p data-pc="fade" className="mt-5 max-w-[22rem] text-sm leading-[1.7] text-white/60">
              Tell us where your product is today and where you want it to go. We&rsquo;ll suggest a sensible first
              step and talk you through how we&rsquo;d work together.
            </p>

            <Link
              data-pc="fade"
              to="/contact"
              className="group mt-7 inline-flex min-h-11 w-fit items-center gap-3 text-[0.8125rem] font-bold tracking-[0.08em] text-white uppercase no-underline"
            >
              Start a project
              <span
                aria-hidden="true"
                className="relative h-0.5 w-8 bg-green-500 transition-[width] duration-200 ease-out group-hover:w-12 group-focus-visible:w-12 after:absolute after:top-1/2 after:right-0 after:size-1.5 after:-translate-y-1/2 after:rotate-45 after:border-t-2 after:border-r-2 after:border-green-500 after:content-['']"
              />
            </Link>
          </div>

          <div className="relative order-1 aspect-[16/10] overflow-hidden md:order-2 md:aspect-auto">
            <img
              data-pc="img"
              src={teamImg}
              alt="A team reviewing dashboards together in a dark room lit by green screens"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover object-[55%_50%]"
            />
            {/* Blends the photo into the copy panel and keeps it as dark as the design. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgb(16_28_29/0)_55%,rgb(16_28_29/0.9)_100%)] md:bg-[linear-gradient(90deg,rgb(16_28_29/0.55)_0%,rgb(16_28_29/0)_22%),linear-gradient(180deg,rgb(3_23_29/0.15),rgb(3_23_29/0.3))]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
