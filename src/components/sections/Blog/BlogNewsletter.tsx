import { useRef, useState, type FormEvent } from 'react'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

export type BlogNewsletterData = {
  label: string
  lines: readonly [string, string]
  body: string
  placeholder: string
  submit: string
  done: string
}

export const BLOG_NEWSLETTER: BlogNewsletterData = {
  label: 'The useful read',
  lines: ['Good ideas.', 'Delivered.'],
  body: 'Get practical insights on digital growth, software, and what’s next, straight to your inbox.',
  placeholder: 'Your work email address',
  submit: 'Subscribe to insights',
  done: 'You’re subscribed',
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Props = {
  data?: BlogNewsletterData
  /** Called with a valid email. Throw or reject to show the error state. */
  onSubscribe?: (email: string) => void | Promise<void>
}

/**
 * Newsletter banner for the bottom of the Blog page: dark card, copy on the left, email field and
 * button on the right, a clipped ring behind the heading. Stacks to one column below `md`.
 *
 * Motion (GSAP): one entrance when it scrolls into view (card, copy, form). Reduced motion skips it.
 */
export function BlogNewsletter({ data = BLOG_NEWSLETTER, onSubscribe }: Props) {
  const root = useRef<HTMLElement>(null)
  const motion = !useMediaQuery('(prefers-reduced-motion: reduce)')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  useGSAP(
    () => {
      const el = root.current
      if (!el || !motion) return
      const card = el.querySelector<HTMLElement>('[data-bn="card"]')
      const copy = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-bn="copy"]'))
      const form = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-bn="form"]'))
      const ring = el.querySelector<HTMLElement>('[data-bn="ring"]')

      gsap.set(card, { autoAlpha: 0, y: 28 })
      gsap.set([...copy, ...form], { autoAlpha: 0, y: 16 })
      gsap.set(ring, { autoAlpha: 0, scale: 0.9 })

      const clear = 'opacity,visibility,transform'
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
      tl.to(card, { autoAlpha: 1, y: 0, duration: 0.7, clearProps: clear }, 0)
      tl.to(ring, { autoAlpha: 1, scale: 1, duration: 1.1, ease: 'power2.out', clearProps: clear }, 0.1)
      tl.to(copy, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.09, clearProps: clear }, 0.25)
      tl.to(form, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.09, clearProps: clear }, 0.4)

      ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => tl.play() })
    },
    { scope: root, dependencies: [motion] },
  )

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (status === 'sending' || status === 'done') return
    if (!EMAIL.test(email.trim())) {
      setStatus('error')
      return
    }
    setStatus('sending')
    try {
      await onSubscribe?.(email.trim())
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const invalid = status === 'error'

  return (
    <section
      ref={root}
      aria-label="Newsletter"
      className="relative isolate bg-white px-(--gutter) py-[clamp(2rem,4vw,3.5rem)] [--gutter:clamp(1rem,0.32rem+2.86vw,5rem)]"
    >
      {/* Page canvas: faint grid, as in the design. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgb(3_23_29/0.045)_1px,transparent_1px),linear-gradient(90deg,rgb(3_23_29/0.045)_1px,transparent_1px)] bg-[size:2rem_2rem]"
      />

      <div className="@container mx-auto w-full max-w-[1332px]">
        <div className="[--u:calc(100cqw/1332)]">
          <div
            data-bn="card"
            className="lg:u-rounded-24 lg:u-min-h-311 relative isolate flex items-center overflow-clip rounded-[1.5rem] bg-[#04181d] px-6 py-9 text-white sm:px-10 md:px-14 md:py-12 lg:px-0 lg:py-0"
          >
            <div
              data-bn="ring"
              aria-hidden="true"
              className="pointer-events-none absolute -z-10 hidden rounded-full border-[1.5px] border-green-500/35 shadow-[0_0_0_calc(24*var(--u))_rgb(129_216_112/0.06),0_0_0_calc(48*var(--u))_rgb(129_216_112/0.03)] lg:block lg:u-size-264 lg:u-left-432 lg:u-top-[-124]"
            />

            <div className="grid w-full items-center gap-8 md:grid-cols-2 md:gap-12 lg:u-pl-186 lg:grid-cols-[calc(480*var(--u))_calc(480*var(--u))] lg:justify-start lg:gap-0">
              <div>
                <p
                  data-bn="copy"
                  className="text-[0.8125rem] leading-4 font-bold tracking-[0.14em] text-green-500 uppercase lg:u-text-[13.6] lg:u-leading-16"
                >
                  {data.label}
                </p>
                <h2
                  data-bn="copy"
                  className="font-display mt-3 text-[clamp(2rem,4.4vw,2.75rem)] leading-[1.06] font-normal tracking-[-0.005em] text-white lg:u-mt-17.5 lg:u-text-46 lg:u-leading-[46.5]"
                >
                  {data.lines[0]}
                  <br />
                  {data.lines[1]}
                </h2>
                <p
                  data-bn="copy"
                  className="mt-5 max-w-[19.5rem] text-[1rem] leading-[1.6] font-medium text-white/80 lg:u-mt-26 lg:u-text-16 lg:u-leading-[25.6] lg:max-w-[calc(312*var(--u))]"
                >
                  {data.body}
                </p>
              </div>

              <form
                onSubmit={submit}
                noValidate
                className="relative flex w-full flex-col gap-3 md:max-w-[26rem] md:justify-self-end lg:max-w-none lg:justify-self-stretch lg:u-gap-12"
              >
                <div data-bn="form">
                  <label htmlFor="blog-newsletter-email" className="sr-only">
                    Work email address
                  </label>
                  <input
                    id="blog-newsletter-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (status !== 'idle' && status !== 'sending') setStatus('idle')
                    }}
                    placeholder={data.placeholder}
                    aria-invalid={invalid}
                    aria-describedby="blog-newsletter-status"
                    disabled={status === 'done'}
                    className={`h-[3.25rem] w-full rounded-full border bg-[#10272C] pr-5 pl-5 text-[0.875rem] font-medium text-white outline-none placeholder:text-white/55 focus:shadow-[0_0_0_3px_rgb(129_216_112/0.15)] disabled:opacity-60 lg:u-h-58 lg:u-text-14 lg:pl-[calc(18*var(--u))] ${
                      invalid ? 'border-red-400' : 'border-[#2b4244] focus:border-green-500'
                    }`}
                  />
                </div>
                <button
                  data-bn="form"
                  type="submit"
                  disabled={status === 'sending' || status === 'done'}
                  className="h-[3.25rem] w-full cursor-pointer rounded-full bg-green-500 text-[0.9375rem] leading-none font-semibold text-teal-900 transition-[background-color,transform] duration-200 ease-out hover:-translate-y-px hover:bg-green-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:translate-y-0 disabled:cursor-default disabled:hover:bg-green-500 lg:u-h-58 lg:u-text-[15.5]"
                >
                  {status === 'done' ? `${data.done} ✓` : status === 'sending' ? 'Subscribing…' : data.submit}
                </button>
                <p
                  id="blog-newsletter-status"
                  role="status"
                  className={`min-h-4 text-[0.75rem] leading-4 lg:absolute lg:top-full lg:left-[calc(18*var(--u))] lg:mt-3 lg:min-h-0 ${invalid ? 'text-red-300' : 'text-green-500'}`}
                >
                  {invalid ? 'Enter a valid email address, like name@company.com.' : status === 'done' ? 'Check your inbox to confirm.' : ''}
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}