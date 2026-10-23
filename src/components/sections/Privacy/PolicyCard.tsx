import type { PolicySection } from './privacyData'
import './PolicyCard.css'

/** One legal section. Reusable: pass any PolicySection. */
export function PolicyCard({ section, index }: { section: PolicySection; index: number }) {
  const titleId = `${section.id}-title`

  return (
    <article id={section.id} className="dk-policy" aria-labelledby={titleId} data-policy-card>
      <span className="dk-policy__index" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="dk-policy__corner" aria-hidden="true" />

      <header className="dk-policy__head">
        <h2 id={titleId} className="dk-policy__title">
          {section.title}
        </h2>
        <p className="dk-policy__status">{section.status}</p>
      </header>

      <div className="dk-policy__body">
        <p className="dk-policy__intro">{section.intro}</p>
        {section.blocks.map((block) => (
          <section key={block.heading} className="dk-policy__block">
            <h3 className="dk-policy__subtitle">{block.heading}</h3>
            <p className="dk-policy__text">{block.body}</p>
          </section>
        ))}
      </div>
    </article>
  )
}
