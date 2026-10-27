import { type CSSProperties } from 'react'
import { Link } from 'react-router-dom'

import { WORK_PROJECTS, type WorkProject } from './workProjects'
import './WorkShowcase.css'

/** Grid cell on the 3-track mosaic (see WorkShowcase.css), in card order. */
const CELLS = ['wide-left', 'narrow-right', 'narrow-left', 'wide-right', 'wide-left', 'narrow-right'] as const

function ArrowUpRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  )
}

function Card({ project, accent }: { project: WorkProject; accent: boolean }) {
  return (
    <article className="dk-ws__card">
      <img className="dk-ws__img" src={project.image} alt="" loading="lazy" decoding="async" />
      <span className="dk-ws__shade" aria-hidden="true" />
      <span className="dk-ws__tag">{project.tag}</span>
      <div className="dk-ws__body">
        <h3 className="dk-ws__title">{project.title}</h3>
        <p className="dk-ws__summary">{project.summary}</p>
      </div>
      <Link
        className="dk-ws__arrow"
        data-accent={accent ? 'true' : undefined}
        to={`/work/${project.slug}`}
        aria-label={`View ${project.title} project details`}
      >
        <ArrowUpRight />
      </Link>
    </article>
  )
}

/**
 * Dark mosaic of selected projects shown under the Work hero. Six image cards on a
 * 3-track grid (wide/narrow alternating per row); everything inside scales with the
 * grid width, so it reads the same as the design from phone to desktop. One column
 * on phones. Each card opens its project details page.
 */
export function WorkShowcase() {
  return (
    <section className="dk-ws" aria-labelledby="work-showcase-title">
      <div className="dk-ws__deco" aria-hidden="true">
        <span className="dk-ws__node dk-ws__node--a" />
        <span className="dk-ws__node dk-ws__node--b" />
        <span className="dk-ws__node dk-ws__node--c" />
      </div>

      <div className="dk-ws__inner">
        <div className="dk-ws__meta">
          <h2 id="work-showcase-title" className="dk-ws__eyebrow">
            Selected work
          </h2>
          <span className="dk-ws__years">2025 — 2026</span>
        </div>

        <ul className="dk-ws__grid">
          {WORK_PROJECTS.map((project, i) => (
            <li
              key={project.slug}
              className="dk-ws__item"
              data-cell={CELLS[i % CELLS.length]}
              style={{ '--i': i } as CSSProperties}
            >
              <Card project={project} accent={i === 1} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default WorkShowcase
