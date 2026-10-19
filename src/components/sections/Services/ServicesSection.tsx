import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

import { Reveal } from '@/components/motion/Reveal'
import { ScrollRevealText } from '@/components/motion/ScrollRevealText'
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/motion'

import { SERVICES, type Service } from './servicesData'
import './Services.css'

/** Exported mockups are picked up by filename. A missing file leaves an empty frame, not a build error. */
const ART = import.meta.glob('../../../assets/images/services/*.{png,webp,jpg,jpeg,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function artFor(name: string): string | undefined {
  const hit = Object.keys(ART).find((p) => p.split('/').pop()?.replace(/\.[^.]+$/, '') === name)
  return hit ? ART[hit] : undefined
}

function Arrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

type ItemProps = {
  service: Service
  open: boolean
  onSelect: () => void
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void
  registerBar: (el: HTMLButtonElement | null) => void
}

function ServiceItem({ service, open, onSelect, onKeyDown, registerBar }: ItemProps) {
  const art = artFor(service.art)
  const stage = useRef<HTMLDivElement>(null)
  const tilt = useRef<HTMLDivElement>(null)

  // Pointer tilt on the mockup, fine pointers only, only while this item is open.
  useEffect(() => {
    const host = stage.current
    const el = tilt.current
    if (!open || !host || !el || prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return

    gsap.set(el, { transformPerspective: 1000 })
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.7, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.7, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      ry(((e.clientX - r.left) / r.width - 0.5) * 8)
      rx(-((e.clientY - r.top) / r.height - 0.5) * 8)
    }
    const leave = () => {
      rx(0)
      ry(0)
    }
    host.addEventListener('pointermove', move)
    host.addEventListener('pointerleave', leave)
    return () => {
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
      gsap.set(el, { clearProps: 'rotationX,rotationY,transformPerspective' })
    }
  }, [open])

  return (
    <article id={service.id} className="dk-svc__item" data-theme={service.theme} data-open={open}>
      <h3 className="dk-svc__head">
        <button
          ref={registerBar}
          type="button"
          className="dk-svc__bar"
          aria-expanded={open}
          aria-controls={`svc-${service.id}`}
          id={`svc-${service.id}-bar`}
          onClick={onSelect}
          onKeyDown={onKeyDown}
        >
          <span className="dk-svc__no">{service.no}</span>
          <span className="dk-svc__title">{service.title}</span>
        </button>
      </h3>

      <span className="dk-svc__ghost" aria-hidden="true">{service.no}</span>

      <div
        id={`svc-${service.id}`}
        role="region"
        aria-labelledby={`svc-${service.id}-bar`}
        className="dk-svc__panel"
        // Closed panels are removed from the tab order and the accessibility tree.
        {...({ inert: open ? undefined : '' } as object)}
      >
        <div className="dk-svc__panel-inner">
          <div className="dk-svc__copy">
            {service.points.map((p) => (
              <div className="dk-svc__point" key={p.label}>
                <p className="dk-svc__label">{p.label}</p>
                <p className="dk-svc__text">
                  {p.lead}
                  {p.tail && <> <span className="dk-svc__soft">{p.tail}</span></>}
                </p>
              </div>
            ))}
            <a className="dk-svc__btn" href={service.href} tabIndex={open ? 0 : -1}>
              Explore in detail <Arrow />
            </a>
          </div>
        </div>
      </div>

      <div ref={stage} className="dk-svc__art" aria-hidden="true">
        <div ref={tilt} className="dk-svc__art-tilt">
          <div className="dk-svc__art-card">
            {art ? (
              <img src={art} alt="" draggable={false} loading="lazy" decoding="async" />
            ) : (
              import.meta.env.DEV && (
                <span className="dk-svc__art-missing">Add src/assets/images/services/{service.art}.png</span>
              )
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export function ServicesSection() {
  const [open, setOpen] = useState(0)
  const bars = useRef<(HTMLButtonElement | null)[]>([])

  // Opening a panel changes the page height, so scroll triggers further down need new positions.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 520)
    return () => window.clearTimeout(id)
  }, [open])

  const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = SERVICES.length - 1
    const target =
      e.key === 'ArrowDown' ? (i === last ? 0 : i + 1)
      : e.key === 'ArrowUp' ? (i === 0 ? last : i - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : -1
    if (target < 0) return
    e.preventDefault()
    bars.current[target]?.focus()
  }

  return (
    <section id="services" className="dk-svc" aria-label="Services">
      <div className="dk-svc__glow" aria-hidden="true" />

      <div className="dk-svc__inner">
        <header className="dk-svc__intro">
          <p className="dk-svc__eyebrow">
            <span className="dk-svc__eyebrow-dot" aria-hidden="true" />
            Services
          </p>
          <ScrollRevealText
            as="h2"
            className="dk-svc__heading"
            text="Five disciplines, one system."
            split="words"
            mode="play"
            duration={1.8}
            stagger={0.12}
            yOffset={20}
            start="top 85%"
          />
        </header>
      </div>

      <Reveal className="dk-svc__list" stagger>
          {SERVICES.map((s, i) => (
            <ServiceItem
              key={s.id}
              service={s}
              open={open === i}
              onSelect={() => setOpen(i)}
              onKeyDown={onKeyDown(i)}
              registerBar={(el) => {
                bars.current[i] = el
              }}
            />
          ))}
      </Reveal>
    </section>
  )
}