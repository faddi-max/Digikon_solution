import { useRef } from 'react'

import avatarFallback from '@/assets/images/testimonialimg.jpg?url'
import { ScrollRevealText } from '@/components/motion/ScrollRevealText'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/motion'

import { REVIEW_COPY, REVIEWS, type Review } from './testimonialsReviewData'
import './Testimonialsreview.css'

function ReviewCard({ review, slot }: { review: Review; slot: number }) {
  return (
    <li className="dk-tr__item" data-slot={slot} data-tr="card">
      <figure className="dk-tr__card" data-tone={review.tone} data-size={review.size}>
        <span className="dk-tr__mark" aria-hidden="true">
          “
        </span>

        <blockquote className="dk-tr__quote">
          <p>{review.quote}</p>
        </blockquote>

        <figcaption className="dk-tr__who">
          <img
            className="dk-tr__avatar"
            src={review.avatar ?? avatarFallback}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <span className="dk-tr__meta">
            <span className="dk-tr__name">{review.name}</span>
            <span className="dk-tr__role">
              {review.role}, {review.company}
            </span>
          </span>
        </figcaption>
      </figure>
    </li>
  )
}

export function Testimonialsreview() {
  const root = useRef<HTMLElement>(null)

  // Cards rise in as they scroll into view. Reduced motion shows everything at once.
  useGSAP(
    () => {
      const el = root.current
      if (!el || prefersReducedMotion()) return

      const cards = gsap.utils.toArray<HTMLElement>('[data-tr="card"]', el)
      const eyebrow = el.querySelector<HTMLElement>('[data-tr="eyebrow"]')

      gsap.set(cards, { autoAlpha: 0, y: 24 })
      if (eyebrow) gsap.set(eyebrow, { autoAlpha: 0, x: -16 })

      if (eyebrow) {
        ScrollTrigger.create({
          trigger: eyebrow,
          start: 'top 88%',
          once: true,
          onEnter: () => gsap.to(eyebrow, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'power3.out' }),
        })
      }

      ScrollTrigger.batch(cards, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.09,
            ease: 'power3.out',
            overwrite: true,
          }),
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="dk-tr" aria-labelledby="reviews-title">
      <div className="dk-tr__inner">
        <div className="dk-tr__frame">
          <header className="dk-tr__head">
            <p className="dk-tr__eyebrow" data-tr="eyebrow">
              <span className="dk-tr__eyebrow-dot" aria-hidden="true" />
              {REVIEW_COPY.eyebrow}
            </p>

            <h2 id="reviews-title" className="dk-tr__heading">
              <ScrollRevealText
                as="span"
                className="dk-tr__line"
                text={REVIEW_COPY.lead}
                split="words"
                mode="play"
                duration={1.1}
                stagger={0.1}
                yOffset={20}
                start="top 85%"
              />
              <ScrollRevealText
                as="span"
                className="dk-tr__line"
                text={REVIEW_COPY.accent}
                split="words"
                mode="play"
                accent={[...REVIEW_COPY.accentWords]}
                duration={1.1}
                stagger={0.1}
                yOffset={20}
                start="top 85%"
              />
            </h2>
          </header>

          <ul className="dk-tr__grid" role="list">
            {REVIEWS.map((review, i) => (
              <ReviewCard key={review.id} review={review} slot={i + 1} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}