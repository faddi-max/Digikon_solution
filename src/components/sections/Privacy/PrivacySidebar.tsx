import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import type { PolicySection } from './privacyData'

type Props = {
  title: string
  sections: readonly PolicySection[]
  legalCenter: { label: string; href: string }
}

function ArrowUpRight() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  )
}

/**
 * Sticky section index. Highlights the card nearest the top of the viewport
 * and scrolls to a card on click. Works without JS as plain anchor links.
 */
export function PrivacySidebar({ title, sections, legalCenter }: Props) {
  const [active, setActive] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)
    if (els.length === 0) return

    // A card is "current" while it crosses a band near the top of the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting)
        if (hit.length === 0) return
        const top = hit.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        setActive(top.target.id)
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [sections])

  return (
    <aside className="dk-psb" aria-label="Legal sections">
      <div className="dk-psb__top">
        <p className="dk-psb__label">{title}</p>
        <p className="dk-psb__count" aria-hidden="true">
          {String(sections.length).padStart(2, '0')}
        </p>
      </div>

      <nav aria-label="Browse sections">
        <ul className="dk-psb__list">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="dk-psb__link"
                aria-current={active === s.id ? 'true' : undefined}
                onClick={() => setActive(s.id)}
              >
                <span className="dk-psb__dot" aria-hidden="true" />
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Link to={legalCenter.href} className="dk-psb__legal">
        {legalCenter.label}
        <ArrowUpRight />
      </Link>
    </aside>
  )
}
