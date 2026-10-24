import { PageMeta } from './PageMeta'

export function OurTeam() {
  return (
    <section className="dk-page__intro" aria-labelledby="contact-title">
      <PageMeta title="Contact" />
      <p className="dk-page__eyebrow">Start a project</p>
      <h1 id="contact-title">Let&apos;s build your next digital system.</h1>
      <p>
        Tell us where growth feels disconnected. We&apos;ll help you identify
        the next practical step.
      </p>
      <a className="dk-page__email" href="mailto:hello@example.com">
        hello@example.com
      </a>
    </section>
  )
}
