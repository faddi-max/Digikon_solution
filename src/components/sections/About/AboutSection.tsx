import { useEffect, useRef } from 'react'

import { CtaButton } from '../../ui/CtaButton'
import { ScrollRevealText } from '@/components/motion/ScrollRevealText'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'
import teamImg from '@/assets/images/team.jpg?url'
import polaroidImg from '@/assets/images/polaroid.jpg?url'

import { AboutArch } from './AboutArch'
import { AboutGridBackground } from './AboutGridBackground'
import './About.css'

const PILLARS = [
  {
    no: '01 / Connect',
    title: 'Built to work as one',
    body: 'Search, creative and technology move in the same direction, so each improvement strengthens the whole system.',
  },
  {
    no: '02 / Measure',
    title: 'Evidence over assumptions',
    body: 'We begin with the signal that matters, define what success looks like and let insight guide the next move.',
  },
  {
    no: '03 / Craft',
    title: 'Quality with intention',
    body: 'Thoughtful design, clean execution and focused deliverables. Less noise, more value in every detail.',
  },
]

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function AboutSection() {
  const root = useRef<HTMLElement>(null)
  const visual = useRef<HTMLDivElement>(null)
  const polaroid = useRef<HTMLElement>(null)
  const card = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!root.current || !polaroid.current || !card.current) return

      // Static starting tilt applies even with reduced motion.
      gsap.set(polaroid.current, { rotation: -5 })

      if (prefersReducedMotion()) return

      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top 72%',
          toggleActions: 'restart none restart reset',
        },
      })

      intro
        .from('[data-about="label"]', {
          autoAlpha: 0,
          x: -16,
          duration: 1,
          ease: 'power3.out',
        })
        .from(
          '[data-about="badge"]',
          { autoAlpha: 0, y: 14, duration: 1, ease: 'power3.out' },
          '-=0.6',
        )
        .from(
          '[data-about="lead"]',
          { autoAlpha: 0, y: 24, duration: 1.3, ease: 'power3.out' },
          '-=0.7',
        )
        .from(
          '[data-about="action"]',
          {
            autoAlpha: 0,
            y: 18,
            duration: 1.1,
            stagger: 0.14,
            ease: 'power3.out',
          },
          '-=1.0',
        )
        .from(
          polaroid.current,
          { autoAlpha: 0, y: 60, duration: 1.6, ease: 'power3.out' },
          0.5,
        )
        .from(
          card.current,
          {
            autoAlpha: 0,
            y: 44,
            scale: 0.96,
            duration: 1.4,
            ease: 'power3.out',
          },
          0.9,
        )
        .from(
          '[data-about="rule"]',
          { scaleX: 0, duration: 1.4, stagger: 0.14, ease: 'power3.inOut' },
          0.6,
        )
        .from(
          '[data-about="pillar"]',
          {
            autoAlpha: 0,
            y: 30,
            duration: 1.2,
            stagger: 0.14,
            ease: 'power3.out',
          },
          0.9,
        )

      // Gentle float after the intro settles.
      gsap.to(polaroid.current, {
        y: -12,
        rotation: -3,
        duration: 3.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 2.4,
      })
      gsap.to(card.current, {
        y: -8,
        duration: 4.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 3,
      })

      // The visual column drifts slower than the text as the section scrolls.
      if (visual.current) {
        gsap.to(visual.current, {
          yPercent: -6,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
    },
    { scope: root },
  )

  // Card tilts toward the pointer on fine pointers.
  useEffect(() => {
    const el = card.current
    if (
      !el ||
      prefersReducedMotion() ||
      !window.matchMedia('(pointer: fine)').matches
    )
      return

    gsap.set(el, { transformPerspective: 900 })
    const rx = gsap.quickTo(el, 'rotationX', {
      duration: 0.6,
      ease: 'power3.out',
    })
    const ry = gsap.quickTo(el, 'rotationY', {
      duration: 0.6,
      ease: 'power3.out',
    })

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1
      ry(nx * 6)
      rx(-ny * 6)
    }
    const onLeave = () => {
      rx(0)
      ry(0)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <section
      ref={root}
      id="about"
      className="dk-about"
      aria-label="About DigiKon"
    >
      <AboutGridBackground />

      <div className="dk-about__inner">
        <header className="dk-about__intro">
          <p data-about="label" className="dk-about__label">
            <span className="dk-about__label-dot" aria-hidden="true" />
            About us
          </p>
          <ScrollRevealText
            as="h2"
            className="dk-about__statement"
            text="We build digital systems where search, design and data work as one, so growth stops being a guess."
            split="words"
            mode="play"
            accent={['growth', 'stops']}
            duration={2.2}
            stagger={0.16}
            yOffset={20}
            start="top 85%"
          />
        </header>

        <div className="dk-about__hero">
          <div className="dk-about__copy">
            <p data-about="badge" className="dk-about__badge">
              <span className="dk-about__badge-dot" aria-hidden="true" />
              Search · Design · Data
            </p>

            <ScrollRevealText
              as="h2"
              className="dk-about__headline"
              text="Digital should feel connected. And work harder."
              split="words"
              mode="play"
              accent={['connected.']}
              duration={2}
              stagger={0.14}
              yOffset={18}
              start="top 85%"
            />
            <p data-about="lead" className="dk-about__lead">
              We connect strategy, creative thinking and technology to create
              clearer digital experiences where every decision has a purpose and
              every improvement contributes to meaningful progress.
            </p>

            <div className="dk-about__actions">
              <span data-about="action">
                <CtaButton className="dk-about__cta" href="#contact">
                  Discover our approach <ArrowIcon />
                </CtaButton>
              </span>

              <a data-about="action" className="dk-about__link" href="#guides">
                What guides us <ArrowIcon />
              </a>
            </div>
          </div>

          <div ref={visual} className="dk-about__visual">
            <AboutArch src={teamImg} />

            <figure
              ref={polaroid}
              className="dk-about__polaroid"
              data-about="polaroid"
              aria-hidden="true"
            >
              <img src={polaroidImg} alt="" draggable={false} />
            </figure>

            <article ref={card} className="dk-about__card" data-about="card">
              <span className="dk-about__card-dot" aria-hidden="true" />
              <p className="dk-about__card-label">Our mindset</p>
              <h3 className="dk-about__card-title">
                One system. Shared momentum.
              </h3>
              <p className="dk-about__card-body">
                Connected thinking, with a clear purpose behind every detail.
              </p>
            </article>
          </div>
        </div>

        <div className="dk-about__pillars">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className="dk-about__pillar"
              data-about="pillar"
            >
              <span
                className="dk-about__rule"
                data-about="rule"
                aria-hidden="true"
              />
              <p className="dk-about__pillar-no">{pillar.no}</p>
              <h3 className="dk-about__pillar-title">{pillar.title}</h3>
              <p className="dk-about__pillar-body">{pillar.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
