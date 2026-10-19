import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'

import { ScrollTrigger } from '@/lib/motion'

import { FILTERS, PROJECTS, type Project, type WorkFilter } from './workData'
import './Work.css'

const ART = import.meta.glob(
  '../../../assets/images/work/*.{png,webp,jpg,jpeg,avif}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
) as Record<string, string>

function artFor(name: string): string | undefined {
  const hit = Object.keys(ART).find(
    (p) =>
      p
        .split('/')
        .pop()
        ?.replace(/\.[^.]+$/, '') === name,
  )
  return hit ? ART[hit] : undefined
}

const pad = (n: number) => (n < 10 ? '0' : '') + n
const MARQUEE = ['Platforms', 'Product', 'Editorial', 'Analytics', 'Mobile']

function Icon({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}
const ARROW_L = 'M19 12H5M11 18l-6-6 6-6'
const ARROW_R = 'M5 12h14M13 6l6 6-6 6'
const ARROW_UR = 'M7 17L17 7M8 7h9v9'
const PLUS = 'M12 5v14M5 12h14'

type CardProps = {
  project: Project
  index: number
  total: number
  active: boolean
  onSelect: () => void
}

function WorkCard({ project, index, total, active, onSelect }: CardProps) {
  const art = artFor(project.art)

  return (
    <article
      className="dk-work__card"
      data-active={active}
      style={{ '--i': index } as CSSProperties}
      aria-label={`${project.title}, ${index + 1} of ${total}`}
    >
      {/* Collapsed face. Doubles as the control that opens the card. */}
      <button
        type="button"
        className="dk-work__tab"
        onClick={onSelect}
        aria-expanded={active}
        tabIndex={active ? -1 : 0}
        aria-hidden={active || undefined}
      >
        <span className="dk-work__tab-no">{pad(index + 1)}</span>
        <span className="dk-work__tab-title">{project.title}</span>
        <span className="dk-work__tab-meta">{project.category}</span>
        <span className="dk-work__tab-plus" aria-hidden="true">
          <Icon d={PLUS} size={14} />
        </span>
      </button>

      {/* Expanded face. Fixed width so text never reflows while the card animates. */}
      <div
        className="dk-work__body"
        {...({ inert: active ? undefined : '' } as object)}
      >
        <div className="dk-work__media">
          {art ? (
            <img
              src={art}
              alt=""
              draggable={false}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="dk-work__media-empty" aria-hidden="true" />
          )}
        </div>

        <div className="dk-work__info">
          <p className="dk-work__kicker">
            <span className="dk-work__kicker-dot" aria-hidden="true" />
            {project.category} · {project.year}
          </p>
          <h3 className="dk-work__title">{project.title}</h3>
          <p className="dk-work__summary">{project.summary}</p>
          <div className="dk-work__foot">
            <ul className="dk-work__tags">
              {project.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <a className="dk-work__cta" href={project.href}>
              View client story
              <span className="dk-work__cta-ic">
                <Icon d={ARROW_UR} size={13} />
              </span>
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

export function WorkSection() {
  const root = useRef<HTMLElement>(null)
  const [filter, setFilter] = useState<WorkFilter>('All work')
  const [activeId, setActiveId] = useState(PROJECTS[0].id)
  const [inView, setInView] = useState(false)
  const [marqueeOn, setMarqueeOn] = useState(false)

  const list =
    filter === 'All work'
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === filter)
  const activeIndex = Math.max(
    0,
    list.findIndex((p) => p.id === activeId),
  )
  const active = list[activeIndex]

  // Start entrances when the section scrolls in, and run the marquee only while it is visible.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting)
        setMarqueeOn(e.isIntersecting)
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Card widths animate for 600ms, which shifts content below.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 650)
    return () => window.clearTimeout(id)
  }, [activeId, filter])

  const go = (i: number) => {
    const n = list.length
    setActiveId(list[((i % n) + n) % n].id)
  }

  const pickFilter = (f: WorkFilter) => {
    if (f === filter) return
    setFilter(f)
    const next =
      f === 'All work' ? PROJECTS : PROJECTS.filter((p) => p.category === f)
    if (!next.some((p) => p.id === activeId)) setActiveId(next[0].id)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      go(activeIndex + 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      go(activeIndex - 1)
    }
  }

  return (
    <section
      ref={root}
      id="work"
      className="dk-work"
      data-in={inView}
      aria-label="Selected work"
    >
      <div className="dk-work__glow" aria-hidden="true" />

      <div className="dk-work__inner">
        <header className="dk-work__head">
          <div className="dk-work__headline">
            <p className="dk-work__eyebrow">
              <span className="dk-work__eyebrow-dot" aria-hidden="true" />
              Selected work
            </p>
            <h2 className="dk-work__h2">
              <span className="dk-work__h2-line">Digital work.</span>
              <span className="dk-work__h2-line">
                <em>Real impact.</em>
              </span>
            </h2>
          </div>

          <div className="dk-work__counter">
            <p className="dk-work__count" aria-live="polite" aria-atomic="true">
              <span key={active.id} className="dk-work__count-now">
                {pad(activeIndex + 1)}
              </span>
              <span className="dk-work__count-total">/ {pad(list.length)}</span>
            </p>
            <div className="dk-work__nav">
              <button
                type="button"
                className="dk-work__nav-btn"
                aria-label="Previous project"
                onClick={() => go(activeIndex - 1)}
              >
                <Icon d={ARROW_L} />
              </button>
              <button
                type="button"
                className="dk-work__nav-btn"
                aria-label="Next project"
                onClick={() => go(activeIndex + 1)}
              >
                <Icon d={ARROW_R} />
              </button>
            </div>
          </div>
        </header>

        <div
          className="dk-work__filters"
          role="group"
          aria-label="Filter projects"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className="dk-work__chip"
              aria-pressed={f === filter}
              onClick={() => pickFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div
          key={filter}
          className="dk-work__list"
          style={{ '--n': list.length } as CSSProperties}
          onKeyDown={onKeyDown}
        >
          {list.map((p, i) => (
            <WorkCard
              key={p.id}
              project={p}
              index={i}
              total={list.length}
              active={p.id === active.id}
              onSelect={() => setActiveId(p.id)}
            />
          ))}
        </div>

        <div
          className="dk-work__progress"
          role="group"
          aria-label="Project progress"
        >
          {list.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className="dk-work__seg"
              data-on={i === activeIndex}
              data-done={i < activeIndex}
              aria-label={`Show ${p.title}`}
              aria-current={i === activeIndex}
              onClick={() => go(i)}
            >
              <span className="dk-work__seg-fill" />
            </button>
          ))}
        </div>
      </div>

      <div className="dk-work__marquee" aria-hidden="true" data-run={marqueeOn}>
        <div className="dk-work__marquee-track">
          {[0, 1].map((copy) => (
            <div className="dk-work__marquee-set" key={copy}>
              {MARQUEE.map((w) => (
                <span className="dk-work__marquee-item" key={w}>
                  <span className="dk-work__marquee-word">{w}</span>
                  <span className="dk-work__marquee-dash" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
