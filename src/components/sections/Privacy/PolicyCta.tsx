import { CtaButton } from '@/components/ui/CtaButton'
import { Reveal } from '@/components/motion/Reveal'

import './PolicyCta.css'

function ArrowUpRight() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  )
}

export function PolicyCta() {
  return (
    <section className="dk-pcta" aria-labelledby="policy-cta-title">
      <Reveal className="dk-pcta__inner" stagger>
        <div className="dk-pcta__copy">
          <p className="dk-pcta__eyebrow">
            <span className="dk-pcta__square" aria-hidden="true" />
            Need a little more clarity?
          </p>
          <h2 id="policy-cta-title" className="dk-pcta__title">
            Questions about our policies?
          </h2>
          <p className="dk-pcta__text">
            If you need clarification about our policies or how they apply to your use of
            DigiKon&rsquo;s website and services, please contact our team.
          </p>
        </div>

        <CtaButton className="dk-pcta__btn" href="/contact">
          Contact our team
          <ArrowUpRight />
        </CtaButton>
      </Reveal>
    </section>
  )
}