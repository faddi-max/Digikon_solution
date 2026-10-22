import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import { ScrollRevealText } from '@/components/motion/ScrollRevealText'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

import {
  FAQ_CATEGORIES,
  FAQ_TOTAL,
  type FaqCategory,
  type FaqEntry,
} from './faqPageData'
import './FaqBrowser.css'

const ALL = 'all'
const itemDomId = (id: string) => `faq-${id}`

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M6 1v10M1 6h10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

type ItemProps = {
  item: FaqEntry
  open: boolean
  onToggle: (id: string) => void
}

/** One question. The answer opens with a grid-rows transition, so no height is measured. */
function FaqRow({ item, open, onToggle }: ItemProps) {
  const uid = useId()
  const btnId = `${uid}-q`
  const panelId = `${uid}-a`

  return (
    <li
      className={open ? 'dk-fq__item is-open' : 'dk-fq__item'}
      id={itemDomId(item.id)}
      data-fq="item"
    >
      <h4 className="dk-fq__q">
        <button
          id={btnId}
          type="button"
          className="dk-fq__btn"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onToggle(item.id)}
        >
          <span className="dk-fq__q-text">{item.q}</span>
          <span className="dk-fq__icon">
            <PlusIcon />
          </span>
        </button>
      </h4>
      <div
        id={panelId}
        className="dk-fq__a"
        role="region"
        aria-labelledby={btnId}
        inert={!open}
      >
        <div className="dk-fq__a-clip">
          <p className="dk-fq__a-text">{item.a}</p>
        </div>
      </div>
    </li>
  )
}

function FaqGroup({
  category,
  openIds,
  onToggle,
}: {
  category: FaqCategory
  openIds: ReadonlySet<string>
  onToggle: (id: string) => void
}) {
  const titleId = `faq-topic-${category.id}`
  return (
    <section
      className="dk-fq__group"
      id={category.id}
      aria-labelledby={titleId}
      data-fq="group"
    >
      <span className="dk-fq__rule" aria-hidden="true" data-fq="rule" />
      <div className="dk-fq__group-head" data-fq="head">
        <span className="dk-fq__square" aria-hidden="true" />
        <h3 id={titleId} className="dk-fq__group-title">
          {category.title}
        </h3>
        <p className="dk-fq__group-blurb">{category.blurb}</p>
      </div>
      <ul className="dk-fq__list">
        {category.items.map((item) => (
          <FaqRow
            key={item.id}
            item={item}
            open={openIds.has(item.id)}
            onToggle={onToggle}
          />
        ))}
      </ul>
    </section>
  )
}

/**
 * "All questions." — every FAQ, grouped by topic, with topic filters.
 *
 * Layout: a scrolling row of topic pills (a sliding dark indicator marks the active one), a
 * live count, then one block per topic: title and blurb on the left (sticky on desktop), the
 * questions on the right. Under 900px the title sits above its questions.
 *
 * Motion (GSAP + ScrollTrigger): heading words rise in, pills stagger in once, rules draw and
 * questions reveal in batches as they enter. Changing the filter replays the reveal for what
 * is now on screen. Answers open with a CSS grid-rows transition. Reduced motion: no reveals.
 *
 * Deep links: /faqs#faq-<question-id> opens that question and scrolls to it;
 * /faqs#<topic-id> scrolls to the topic.
 */
export function FaqBrowser() {
  const root = useRef<HTMLElement>(null)
  const pillsRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const [filter, setFilter] = useState<string>(ALL)
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set())
  const firstFilter = useRef(true)

  const visible =
    filter === ALL
      ? FAQ_CATEGORIES
      : FAQ_CATEGORIES.filter((c) => c.id === filter)
  const shownCount = visible.reduce((n, c) => n + c.items.length, 0)

  const toggle = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // Deep link to a question or topic on first load.
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''))
    if (!hash) return
    const question = hash.startsWith('faq-')
      ? FAQ_CATEGORIES.flatMap((c) => c.items).find(
          (i) => itemDomId(i.id) === hash,
        )
      : undefined
    const topic = FAQ_CATEGORIES.find((c) => c.id === hash)
    if (!question && !topic) return
    // Defer state updates to after mount, then scroll once the panel is open.
    const raf = requestAnimationFrame(() => {
      if (question) setOpenIds(new Set([question.id]))
      window.setTimeout(() => {
        const target = document.getElementById(hash)
        // Show the linked topic at once instead of waiting for its scroll reveal.
        const group = target?.closest('[data-fq="group"]')
        if (group) {
          gsap.set(
            group.querySelectorAll('[data-fq="item"], [data-fq="head"]'),
            { autoAlpha: 1, y: 0 },
          )
          gsap.set(group.querySelectorAll('[data-fq="rule"]'), { scaleX: 1 })
        }
        target?.scrollIntoView({ block: 'start', behavior: 'instant' })
        ScrollTrigger.refresh()
      }, 60)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  // Slide the dark indicator under the active pill and keep that pill in view in the row.
  const placeIndicator = useCallback((instant = false) => {
    const row = pillsRef.current
    const ind = indicatorRef.current
    const active = row?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!row || !ind || !active) return
    ind.style.transition = instant ? 'none' : ''
    ind.style.width = `${active.offsetWidth}px`
    ind.style.transform = `translateX(${active.offsetLeft}px)`
  }, [])

  useLayoutEffect(() => {
    placeIndicator(firstFilter.current)
    const row = pillsRef.current
    const active = row?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (row && active && !firstFilter.current) {
      // Scroll the row only (not the page) so the chosen pill is centred.
      const left =
        active.offsetLeft - (row.clientWidth - active.offsetWidth) / 2
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)')
        .matches
      row.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' })
    }
  }, [filter, placeIndicator])

  useEffect(() => {
    const row = pillsRef.current
    if (!row) return
    const ro = new ResizeObserver(() => placeIndicator(true))
    ro.observe(row)
    // Fonts change pill widths once they load.
    document.fonts?.ready.then(() => placeIndicator(true)).catch(() => {})
    return () => ro.disconnect()
  }, [placeIndicator])

  // After a filter change, bring the list start back into view if the user was far below it,
  // and let ScrollTrigger re-measure the shorter or longer page.
  useEffect(() => {
    if (firstFilter.current) {
      firstFilter.current = false
      return
    }
    const list = root.current?.querySelector<HTMLElement>('[data-fq="filters"]')
    if (list && list.getBoundingClientRect().top < 0) {
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)')
        .matches
      list.scrollIntoView({
        block: 'start',
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
    ScrollTrigger.refresh()
  }, [filter])

  // One-time reveals: eyebrow, pills.
  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia(el)
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const eyebrow = el.querySelector('[data-fq="eyebrow"]')
        const pills = gsap.utils.toArray<HTMLElement>(
          el.querySelectorAll('[data-fq="pill"]'),
        )
        const meta = el.querySelector('[data-fq="meta"]')
        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        })
        tl.from(eyebrow, { autoAlpha: 0, x: -16, duration: 0.5 }, 0)
        tl.from(
          pills,
          { autoAlpha: 0, y: 14, duration: 0.5, stagger: 0.045 },
          0.25,
        )
        tl.from(meta, { autoAlpha: 0, duration: 0.5 }, 0.55)

        // The green glow drifts slightly against the scroll, for depth.
        const glow = el.querySelector('[data-fq="glow"]')
        if (glow) {
          gsap.fromTo(
            glow,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          )
        }
      })
    },
    { scope: root },
  )

  // Topic blocks and questions: rebuilt on every filter change so what is on screen re-reveals.
  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia(el)
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const rules = gsap.utils.toArray<HTMLElement>(
          el.querySelectorAll('[data-fq="rule"]'),
        )
        const heads = gsap.utils.toArray<HTMLElement>(
          el.querySelectorAll('[data-fq="head"]'),
        )
        const items = gsap.utils.toArray<HTMLElement>(
          el.querySelectorAll('[data-fq="item"]'),
        )

        gsap.set(rules, { scaleX: 0, transformOrigin: '0 50%' })
        gsap.set(heads, { autoAlpha: 0, y: 20 })
        gsap.set(items, { autoAlpha: 0, y: 18 })

        const batch = (targets: HTMLElement[], vars: gsap.TweenVars) =>
          ScrollTrigger.batch(targets, {
            start: 'top 92%',
            once: true,
            onEnter: (els) => gsap.to(els, { ...vars, overwrite: true }),
          })

        const triggers = [
          ...batch(rules, {
            scaleX: 1,
            duration: 0.9,
            ease: 'power2.inOut',
            stagger: 0.1,
          }),
          ...batch(heads, {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.1,
          }),
          ...batch(items, {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: 'power3.out',
            stagger: 0.06,
          }),
        ]
        return () => triggers.forEach((t) => t.kill())
      })
    },
    { scope: root, dependencies: [filter], revertOnUpdate: true },
  )

  return (
    <section
      ref={root}
      className="dk-fq"
      id="all-questions"
      aria-labelledby="faq-all-title"
    >
      <div className="dk-fq__glow" aria-hidden="true" data-fq="glow" />

      <div className="dk-fq__inner">
        <header className="dk-fq__head">
          <p className="dk-fq__eyebrow" data-fq="eyebrow">
            <span aria-hidden="true" />
            Questions &amp; answers
          </p>
          <h2 id="faq-all-title" className="dk-fq__title">
            <ScrollRevealText
              as="span"
              text="All questions."
              split="words"
              mode="play"
              duration={1.1}
              stagger={0.1}
              yOffset={20}
              start="top 85%"
              style={{ display: 'inline' }}
            />
          </h2>
        </header>

        <div className="dk-fq__filters" data-fq="filters">
          <div
            className="dk-fq__pills"
            ref={pillsRef}
            role="group"
            aria-label="Filter questions by topic"
          >
            <span
              className="dk-fq__indicator"
              ref={indicatorRef}
              aria-hidden="true"
            />
            {[
              { id: ALL, title: 'All', n: FAQ_TOTAL },
              ...FAQ_CATEGORIES.map((c) => ({
                id: c.id,
                title: c.title,
                n: c.items.length,
              })),
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className="dk-fq__pill"
                aria-pressed={filter === p.id}
                onClick={() => setFilter(p.id)}
                data-fq="pill"
              >
                {p.title}
                <span className="dk-fq__pill-n">{p.n}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="dk-fq__meta" aria-live="polite" data-fq="meta">
          {filter === ALL
            ? `Showing all ${FAQ_TOTAL} questions in ${FAQ_CATEGORIES.length} topics`
            : `Showing ${shownCount} questions in ${visible[0]?.title ?? ''}`}
        </p>

        <div className="dk-fq__groups">
          {visible.map((c) => (
            <FaqGroup
              key={c.id}
              category={c}
              openIds={openIds}
              onToggle={toggle}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
