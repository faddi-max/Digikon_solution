import { useRef } from 'react'

import searchArt from '@/assets/images/services/search-seo.png?url'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

/** Copy read from the Figma "Strategy & value" frame. */
const LABEL = 'Strategy & value'
const LINES = ['More than rankings.', 'Real'] as const
const ACCENT = 'opportunities.'
const PARAGRAPHS = [
  'SEO is not about chasing algorithms. It is about helping the right people discover your business — and creating the conditions for meaningful engagement and conversions.',
  'When search works well, it connects audience intent with relevant content. Every improvement compounds over time, building a channel that generates qualified traffic, enquiries, and revenue without ongoing advertising spend.',
] as const
const TAGS = [
  'Search visibility',
  'Qualified traffic',
  'Intent mapping',
  'Conversion optimisation',
  'Sustainable growth',
] as const

/**
 * The figure in the card is part of the supplied design. It is a placeholder until a
 * source is attached: do not publish a statistic without one.
 */
const STAT = {
  kicker: 'Search opportunity',
  value: 73,
  text: 'of online experiences begin with a search engine',
}

/**
 * "More than rankings. Real opportunities." section, styled with Tailwind utilities only.
 *
 * Layout: one column on phones (card, then copy); from 1024px two columns, a 386px card
 * beside the copy, centred on it. Type scales with the viewport.
 *
 * Motion (GSAP, every time the section is 70% into view, from either scroll direction): the card rises and its figure
 * counts up, the label and heading lines slide out of masks, the copy and tags follow in
 * sequence. The backdrop drifts slowly against the scroll and the glow behind the card
 * breathes while the section is on screen. Reduced motion gets the finished layout.
 */
export function SeoStrategy() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const all = (sel: string) => gsap.utils.toArray<HTMLElement>(el.querySelectorAll(sel))
      const one = (sel: string) => el.querySelector<HTMLElement>(sel)

      const art = one('[data-st="art"]')
      const card = one('[data-st="card"]')
      const kicker = one('[data-st="kicker"]')
      const value = one('[data-st="value"]')
      const text = one('[data-st="text"]')
      const glow = one('[data-st="glow"]')
      const label = one('[data-st="label"]')
      const lines = all('[data-st="line"]')
      const paras = all('[data-st="para"]')
      const tags = all('[data-st="tag"]')

      const mm = gsap.matchMedia(el)

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const target = Number(value?.dataset.target ?? 0)
        const final = value?.textContent ?? ''

        gsap.set(card, { autoAlpha: 0, y: 40 })
        gsap.set([kicker, text], { autoAlpha: 0, y: 12 })
        gsap.set(label, { autoAlpha: 0, x: -12 })
        gsap.set(lines, { yPercent: 110 })
        gsap.set([...paras, ...tags], { autoAlpha: 0, y: 18 })
        if (value) value.textContent = '0%'

        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          // Plays every time the section enters, scrolling down or back up, and resets when
          // it leaves, so each visit starts clean.
          scrollTrigger: {
            trigger: el,
            start: 'top 70%',
            toggleActions: 'restart reset restart reset',
          },
        })
        tl.to(card, { autoAlpha: 1, y: 0, duration: 0.9 }, 0)
        tl.to(kicker, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.35)
        if (value) {
          const n = { v: 0 }
          tl.to(
            n,
            {
              v: target,
              duration: 1.4,
              ease: 'power2.out',
              onUpdate: () => {
                value.textContent = `${Math.round(n.v)}%`
              },
              onComplete: () => {
                value.textContent = final
              },
            },
            0.45,
          )
        }
        tl.to(text, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.8)

        tl.to(label, { autoAlpha: 1, x: 0, duration: 0.55 }, 0.2)
        tl.to(lines, { yPercent: 0, duration: 0.85, stagger: 0.11 }, 0.3)
        tl.to(paras, { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.12 }, 0.7)
        tl.to(tags, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.07 }, 1.05)

        // The backdrop moves a little slower than the page.
        if (art) {
          gsap.fromTo(
            art,
            { yPercent: -4 },
            {
              yPercent: 4,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        }

        // The glow behind the card breathes, but only while the section is on screen.
        if (glow) {
          const breathe = gsap.to(glow, {
            scale: 1.3,
            opacity: 0.55,
            duration: 2.6,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            paused: true,
          })
          const st = ScrollTrigger.create({
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => breathe.paused(!self.isActive),
          })
          return () => st.kill()
        }
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="seo-strategy-title"
      className="relative isolate z-10 overflow-clip bg-[linear-gradient(136.24deg,#C8F0BE_-19.97%,#03171D_37.3%,rgba(46,125,50,0.8)_100%)] bg-teal-900 px-[clamp(1rem,0.32rem+2.86vw,5rem)] py-[clamp(4rem,5.8vw,7rem)] font-sans text-white shadow-[0_-24px_60px_0_#03171D1F]"
    >
      {/* Backdrop: the SEO dashboard art, tinted and pushed back by the gradient. */}
      <img
        data-st="art"
        src={searchArt}
        alt=""
        aria-hidden="true"
        decoding="async"
        loading="lazy"
        className="pointer-events-none absolute inset-x-0 -top-[8%] -z-10 h-[116%] w-full object-cover opacity-[0.08] mix-blend-luminosity select-none"
      />

      <div className="mx-auto grid max-w-[1388px] items-center gap-12 lg:grid-cols-[386px_minmax(0,1fr)] lg:gap-x-[clamp(3rem,5.2vw,6.25rem)] lg:pl-[clamp(0rem,5.1vw,6.125rem)]">
        {/* Stat card */}
        <div className="relative w-full max-w-[386px] justify-self-center lg:justify-self-start">
          <span
            data-st="glow"
            aria-hidden="true"
            className="pointer-events-none absolute -top-6 -right-6 size-24 rounded-full bg-green-300/70 blur-2xl"
          />
          <div
            data-st="card"
            className="relative rounded-[20px] bg-white p-7 text-teal-900 shadow-[0_24px_60px_-20px_#03171D66] sm:p-10"
          >
            <p
              data-st="kicker"
              className="flex items-center gap-2 text-[11px] leading-none font-semibold tracking-[0.12em] text-[#2E7D32] uppercase"
            >
              <span aria-hidden="true" className="size-[5px] bg-[#2E7D32]" />
              {STAT.kicker}
            </p>
            <p
              data-st="value"
              data-target={STAT.value}
              className="mt-5 font-display text-[clamp(3.5rem,2rem+3vw,4.25rem)] leading-none text-[#2E7D32]"
            >
              {STAT.value}%
            </p>
            <p
              data-st="text"
              className="mt-3 max-w-[16ch] text-[clamp(1.125rem,0.9rem+0.4vw,1.375rem)] leading-[1.45] text-ink-muted"
            >
              {STAT.text}
            </p>
          </div>
        </div>

        {/* Copy */}
        <div className="min-w-0">
          <p
            data-st="label"
            className="flex items-center gap-2.5 text-[13px] leading-[18px] font-medium text-green-500"
          >
            <span aria-hidden="true" className="size-2 bg-green-500" />
            {LABEL}
          </p>

          <h2
            id="seo-strategy-title"
            className="mt-4 font-display text-[clamp(2rem,1.2rem+2.1vw,3.25rem)] leading-[1.15] font-normal"
          >
            {LINES.map((line, i) => (
              <span
                key={line}
                className="-mx-[0.1em] block overflow-clip px-[0.1em] pb-[0.2em] -mb-[0.2em]"
              >
                <span data-st="line" className="block">
                  {line}
                  {i === LINES.length - 1 && (
                    <>
                      {' '}
                      <em className="text-green-500 italic">{ACCENT}</em>
                    </>
                  )}
                </span>
              </span>
            ))}
          </h2>

          <div className="mt-6 max-w-[600px] space-y-5 text-base leading-[1.8] text-white/85">
            {PARAGRAPHS.map((p) => (
              <p key={p} data-st="para">
                {p}
              </p>
            ))}
          </div>

          <ul role="list" className="mt-7 flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <li
                key={tag}
                data-st="tag"
                className="inline-flex h-[34px] items-center rounded-full bg-white px-4 text-[11px] font-semibold tracking-[0.08em] text-teal-900 uppercase transition-[transform,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-green-300"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}