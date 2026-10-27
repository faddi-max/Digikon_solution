import { Link } from 'react-router-dom'

import { nextProject, type WorkProject } from './workProjects'
import './WorkDetail.css'

function Close() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  )
}

/**
 * Project details: close button, eyebrow, title, intro, framed hero image, four-up facts,
 * overview and approach columns, three result cards, a two-image gallery and a link to the
 * next project. The content column is a size container, so everything scales together.
 */
export function WorkDetail({ project }: { project: WorkProject }) {
  const next = nextProject(project.slug)
  const facts = [
    ['Client', project.meta.client],
    ['Year', project.meta.year],
    ['Role', project.meta.role],
    ['Timeline', project.meta.timeline],
  ] as const

  return (
    <article className="dk-wd" aria-labelledby="work-detail-title">
      <div className="dk-wd__inner">
        <Link className="dk-wd__close" to="/work" aria-label="Back to all work">
          <Close />
        </Link>

        <header className="dk-wd__head">
          <p className="dk-wd__eyebrow">{project.tag}</p>
          <h1 id="work-detail-title" className="dk-wd__title">
            {project.title}
          </h1>
          <p className="dk-wd__intro">{project.intro}</p>
        </header>

        <figure className="dk-wd__hero">
          <img src={project.image} alt={`${project.title} project preview`} decoding="async" />
        </figure>

        <dl className="dk-wd__facts">
          {facts.map(([label, value]) => (
            <div key={label} className="dk-wd__fact">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="dk-wd__story">
          <section>
            <h2>Overview</h2>
            <p>{project.overview}</p>
          </section>
          <section>
            <h2>The approach</h2>
            <p>{project.approach}</p>
          </section>
        </div>

        <ul className="dk-wd__stats">
          {project.stats.map((s) => (
            <li key={s.label} className="dk-wd__stat">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>

        <div className="dk-wd__gallery">
          <img src={project.gallery[0]} alt="" loading="lazy" decoding="async" />
          <img src={project.gallery[1]} alt="" loading="lazy" decoding="async" />
        </div>

        <Link className="dk-wd__next" to={`/work/${next.slug}`}>
          <span className="dk-wd__next-text">
            <span className="dk-wd__next-label">Next project</span>
            <span className="dk-wd__next-title">{next.title}</span>
          </span>
          <ArrowUpRight />
        </Link>
      </div>
    </article>
  )
}

export default WorkDetail
