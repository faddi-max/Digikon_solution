import { useRef, useState, type CSSProperties, type MouseEvent } from 'react'

import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/motion'

import { STAGES } from './processStagesData'
import { StageVisual } from './StageVisual'

/** Same query as the `pin:` variant in index.css. Cards only stack where they fit on screen. */
const PIN_QUERY = '(min-width: 64rem) and (min-height: 48rem)'

/** Each heading line sits in a clip so it rises out of it instead of fading. */
const MASK = '-mx-[0.1em] -mb-[0.2em] block overflow-clip px-[0.1em] pb-[0.2em]'

const TOTAL = String(STAGES.length).padStart(2, '0')
const num = (i: number) => String(i + 1).padStart(2, '0')

/**
 * How it works: the seven delivery stages.
 *
 * Layout: dark section. Label + editorial heading on the Principles grid, then a sticky step
 * filter, then one card per stage (copy left, photo with a glass "artefact" panel right).
 * On desktops tall enough to hold a card (`pin:`), every card is sticky a little lower than
 * the one before, so scrolling deals them into an overlapping stack. Below that, or on short
 * screens, cards simply flow one after another and the photo moves under the copy.
 *
 * Motion: the heading lines rise in once. While stacking, the card underneath scales back
 * and dims as the next one slides over it (scroll-linked, read straight from layout so it
 * never drifts from the sticky positions). The filter tracks the current card: earlier steps
 * are "done", the current one is filled green, and on narrow screens the bar scrolls to keep
 * it visible. Clicking a step scrolls to that card. Reduced motion keeps the stacking layout
 * and the live filter, but drops the scale/dim, reveals and smooth scrolling.
 */
export function ProcessStages() {
  const root = useRef<HTMLElement>(null)
  const bar = useRef<HTMLElement>(null)
  const stack = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)

  useGSAP(
    () => {
      const el = root.current
      const stackEl = stack.current
      if (!el || !stackEl) return

      const cards = gsap.utils.toArray<HTMLElement>(stackEl.querySelectorAll('[data-ps="card"]'))
      const dims = cards.map((c) => c.querySelector<HTMLElement>('[data-ps="dim"]'))
      const motion = !prefersReducedMotion()
      const pinMq = window.matchMedia(PIN_QUERY)
      let stickyTops: number[] = []

      const measure = () => {
        stickyTops = cards.map((c) => parseFloat(getComputedStyle(c).top) || 0)
      }

      const update = () => {
        const vh = window.innerHeight
        const pinned = pinMq.matches
        const tops = cards.map((c) => c.getBoundingClientRect().top)

        // Current card: the last one that has reached its resting place (or the reading line).
        let idx = 0
        tops.forEach((t, i) => {
          const line = pinned ? stickyTops[i] + Math.min(vh * 0.2, 160) : vh * 0.4
          if (t <= line) idx = i
        })
        if (idx !== activeRef.current) {
          activeRef.current = idx
          setActive(idx)
        }

        // Cards underneath recede as the next one covers them.
        cards.forEach((card, i) => {
          let p = 0
          if (pinned && motion && i < cards.length - 1) {
            const st = stickyTops[i + 1]
            p = gsap.utils.clamp(0, 1, (vh - tops[i + 1]) / Math.max(1, vh - st))
          }
          gsap.set(card, { scale: 1 - 0.05 * p })
          if (dims[i]) gsap.set(dims[i], { opacity: 0.6 * p })
        })
      }

      measure()
      update()
      const st = ScrollTrigger.create({
        trigger: stackEl,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: update,
        onRefresh: () => {
          measure()
          update()
        },
      })
      // Keeps the filter right when the page loads scrolled past the stack (e.g. back/forward).
      const onChange = () => ScrollTrigger.refresh()
      pinMq.addEventListener('change', onChange)

      if (motion) {
        const lines = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-ps="line"]'))
        const label = el.querySelector('[data-ps="label"]')
        gsap.set(lines, { yPercent: 110 })
        gsap.set([label, bar.current], { autoAlpha: 0, y: 16 })
        gsap
          .timeline({
            defaults: { ease: 'power3.out' },
            scrollTrigger: { trigger: el, start: 'top 75%', once: true },
          })
          .to(label, { autoAlpha: 1, y: 0, duration: 0.6 }, 0)
          .to(lines, { yPercent: 0, duration: 1, stagger: 0.14, ease: 'power4.out' }, 0.1)
          .to(bar.current, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.45)

        // Copy settles in as each card arrives.
        cards.forEach((card) => {
          const parts = card.querySelectorAll('[data-ps="part"]')
          gsap.from(parts, {
            autoAlpha: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.06,
            ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 80%', once: true },
          })
        })
      }

      return () => {
        st.kill()
        pinMq.removeEventListener('change', onChange)
      }
    },
    { scope: root },
  )

  // Keep the current step visible when the filter is scrollable.
  useGSAP(
    () => {
      const b = bar.current
      const link = b?.querySelectorAll<HTMLElement>('a')[active]
      if (!b || !link || b.scrollWidth <= b.clientWidth) return
      b.scrollTo({
        left: link.offsetLeft - b.clientWidth / 2 + link.offsetWidth / 2,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      })
    },
    { dependencies: [active] },
  )

  const goTo = (e: MouseEvent<HTMLAnchorElement>, i: number) => {
    const stackEl = stack.current
    if (!stackEl) return
    e.preventDefault()
    const cards = Array.from(stackEl.querySelectorAll<HTMLElement>('[data-ps="card"]'))
    const card = cards[i]
    // Sticky cards report their stuck position, so rebuild the natural one from the flow.
    let top = stackEl.getBoundingClientRect().top + window.scrollY
    for (let k = 0; k < i; k++) top += cards[k].offsetHeight + parseFloat(getComputedStyle(cards[k]).marginBottom)
    const pinned = window.matchMedia(PIN_QUERY).matches
    const offset = pinned
      ? parseFloat(getComputedStyle(card).top)
      : (bar.current?.getBoundingClientRect().bottom ?? 0) + 16
    window.scrollTo({ top: top - offset + 1, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    card.focus({ preventScroll: true })
  }

  return (
    <section
      ref={root}
      id="process-stages"
      aria-labelledby="process-stages-title"
      className="relative isolate overflow-clip bg-teal-900 pt-20 pb-24 font-sans text-white sm:pt-24 lg:pt-[6.25rem] lg:pb-32"
    >
      {/* Soft green light from the top centre. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[38rem] w-[min(60rem,120%)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(129_216_112/0.16),rgb(129_216_112/0))]"
      />

      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-[16.75rem_minmax(0,1fr)] lg:items-center lg:gap-0">
          <p data-ps="label" className="flex items-center gap-2.5 text-[0.8125rem] leading-[18px] font-medium text-white/80">
            <span className="size-2 rounded-[1px] bg-green-500" aria-hidden="true" />
            The Product Journey · {TOTAL} stages
          </p>
          <h2
            id="process-stages-title"
            className="font-display text-[clamp(2.25rem,1.35rem+3vw,3.875rem)] leading-[1.1] font-normal tracking-[-0.005em]"
          >
            <span className={MASK}>
              <span data-ps="line" className="block">
                A Clear Path From
              </span>
            </span>
            <span className={MASK}>
              <span data-ps="line" className="block text-green-500">
                Concept to Release.
              </span>
            </span>
          </h2>
        </div>

        <nav
          ref={bar}
          aria-label="Process stages"
          className="sticky top-[5.25rem] z-30 mx-auto mt-10 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-white/10 bg-teal-800/85 p-1.5 [scrollbar-width:none] backdrop-blur-lg lg:top-[6.625rem] lg:mt-14 [&::-webkit-scrollbar]:hidden"
        >
          {STAGES.map((s, i) => {
            const state = i === active ? 'active' : i < active ? 'done' : 'todo'
            return (
              <a
                key={s.id}
                href={`#stage-${s.id}`}
                onClick={(e) => goTo(e, i)}
                aria-current={state === 'active' ? 'step' : undefined}
                className={`flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-[0.8125rem] font-semibold whitespace-nowrap no-underline transition-colors duration-300 ease-out ${
                  state === 'active'
                    ? 'bg-green-500 text-teal-900'
                    : state === 'done'
                      ? 'text-green-300 hover:bg-white/10'
                      : 'text-white/55 hover:bg-white/10 hover:text-white'
                }`}
              >
                <b className="text-[0.6875rem] font-bold tabular-nums opacity-80">{num(i)}</b>
                {s.short}
                {state === 'done' && <span className="sr-only">(completed)</span>}
              </a>
            )
          })}
        </nav>

        <div ref={stack} className="relative mt-6 lg:mt-8">
          {STAGES.map((s, i) => (
            <article
              key={s.id}
              id={`stage-${s.id}`}
              data-ps="card"
              tabIndex={-1}
              aria-labelledby={`stage-${s.id}-title`}
              style={{ '--i': i } as CSSProperties}
              className="relative mb-5 grid origin-top scroll-mt-40 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(160deg,#0e3138,#082228_70%)] shadow-[0_-1.25rem_3.75rem_-1.875rem_rgb(0_0_0/0.7)] outline-offset-4 last:mb-0 sm:mb-6 lg:grid-cols-[1.05fr_1fr] pin:sticky pin:top-[calc(10.75rem+var(--i)*0.625rem)] pin:mb-10 pin:last:mb-0"
            >
              <div className="flex flex-col p-6 sm:p-8 lg:p-9 xl:p-10">
                <div data-ps="part" className="mb-5 flex flex-wrap items-center gap-2 lg:mb-6">
                  <span className="rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-teal-900 tabular-nums">
                    {num(i)} / {TOTAL}
                  </span>
                  {s.tags.map((t) => (
                    <span key={t} className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/65">
                      {t}
                    </span>
                  ))}
                </div>

                <h3
                  id={`stage-${s.id}-title`}
                  data-ps="part"
                  className="mb-3.5 text-[clamp(1.875rem,1.45rem+1.6vw,2.75rem)] leading-[1.08] font-bold tracking-[-0.03em]"
                >
                  {s.title}
                </h3>
                <p data-ps="part" className="mb-6 max-w-[30rem] text-[0.9375rem] leading-[1.65] text-white/65">
                  {s.desc}
                </p>

                <ul data-ps="part" className="m-0 grid list-none gap-x-6 gap-y-2.5 p-0 sm:grid-cols-2">
                  {s.items.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm leading-[1.4] font-semibold text-white/85">
                      <svg aria-hidden="true" viewBox="0 0 18 18" className="mt-px size-[1.125rem] shrink-0 rounded-full bg-green-500/15">
                        <path d="M5 9.5l2.5 2.5L13 6.5" fill="none" stroke="#81D870" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <div data-ps="part" className="mt-auto pt-6">
                  <p className="flex w-fit flex-col rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-2.5">
                    <small className="text-[0.625rem] font-bold tracking-[0.14em] text-white/50 uppercase">Outcome</small>
                    <strong className="text-[0.84375rem] font-semibold text-green-500">{s.outcome}</strong>
                  </p>
                </div>
              </div>

              {/* Stage photo with the illustrative panel. */}
              <div aria-hidden="true" className="relative grid min-h-[18rem] place-items-center overflow-hidden border-t border-white/10 p-6 sm:p-8 lg:border-t-0 lg:border-l">
                <img
                  src={s.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="absolute inset-0 -z-0 size-full object-cover opacity-60 grayscale-[35%] select-none"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgb(129_216_112/0.28),transparent_55%),linear-gradient(160deg,rgb(14_49_56/0.55),rgb(3_23_29/0.82))]" />
                <div className="relative w-full max-w-[21.875rem]">
                  <StageVisual id={s.id} />
                </div>
              </div>

              {/* Darkens the card as the next one slides over it. */}
              <div data-ps="dim" aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-teal-900 opacity-0" />
            </article>
          ))}
        </div>

        <p className="mt-10 flex max-w-[47.5rem] items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-sm leading-[1.6] text-white/65 lg:mt-12">
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-green-500" aria-hidden="true" />
          Testing and quality checks can happen throughout the project. The dedicated Testing and QA stages provide a
          focused review before release.
        </p>
      </div>
    </section>
  )
}
