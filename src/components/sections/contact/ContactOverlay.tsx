import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { createPortal } from 'react-dom'

import dkMark from '@/assets/images/dk-mark.svg?url'
const glowSrc = ''
const meshSrc = ''

import './ContactOverlay.css'

/** PLACEHOLDERS from the design. Replace with approved contact details before launch. */
const INFO = {
  address: ['Suite 502, Orion Tower', 'Add your office address'],
  hours: 'Monday to Friday, 9:00am – 6:00pm',
  email: 'hello@example.com',
}

/** Placeholder links. Replace '#' with the real profile URLs. */
const SOCIAL = [
  { id: 'facebook', label: 'Facebook', href: '#' },
  { id: 'linkedin', label: 'LinkedIn', href: '#' },
  { id: 'instagram', label: 'Instagram', href: '#' },
] as const

/** Optional. If unset, the form opens the visitor's email app instead of pretending to send. */
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined

type Status = 'idle' | 'sending' | 'sent' | 'mailto' | 'error'

const FIELDS = [
  { name: 'name', label: 'Your name', type: 'text', autoComplete: 'name' },
  { name: 'company', label: 'Your company name', type: 'text', autoComplete: 'organization' },
  { name: 'email', label: 'Your business email', type: 'email', autoComplete: 'email' },
] as const

const idx = (i: number) => ({ '--i': i }) as CSSProperties

function SocialIcon({ id }: { id: (typeof SOCIAL)[number]['id'] }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      {id === 'facebook' && (
        <path
          fill="currentColor"
          d="M2 1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-3.4V9.9h1.7l.3-2H10.6V6.6c0-.6.2-1 1-1h1.1V3.8c-.2 0-.8-.1-1.600-.1-1.600 0-2.600 1-2.600 2.700v1.500H6.800v2h1.700V15H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Z"
        />
      )}
      {id === 'linkedin' && (
        <path
          fill="currentColor"
          d="M2 1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Zm1.400 5.400V12.600h1.900V6.400H3.400ZM4.350 3.400a1.100 1.100 0 1 0 0 2.200 1.100 1.100 0 0 0 0-2.200Zm2.500 3v6.200h1.900V9.300c0-.9.400-1.500 1.200-1.500.700 0 1 .500 1 1.400v3.400h1.900V8.900c0-1.800-1-2.700-2.300-2.700-.9 0-1.500.5-1.800 1V6.400H6.850Z"
        />
      )}
      {id === 'instagram' && (
        <>
          <rect x="1.500" y="1.500" width="13" height="13" rx="3.800" fill="none" stroke="currentColor" strokeWidth="1.500" />
          <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.500" />
          <circle cx="11.700" cy="4.300" r="0.900" fill="currentColor" />
        </>
      )}
    </svg>
  )
}

export function ContactOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    if (!open) return
    const root = document.getElementById('root')
    const previous = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    root?.setAttribute('inert', '')
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 80)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKey)
      root?.removeAttribute('inert')
      document.body.style.overflow = prevOverflow
      previous?.focus?.()
    }
  }, [open, onClose])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>

    if (!ENDPOINT) {
      const body = `Name: ${data.name}\nCompany: ${data.company}\nEmail: ${data.email}\n\n${data.details}`
      window.location.href = `mailto:${INFO.email}?subject=${encodeURIComponent(
        `Project enquiry from ${data.name}`,
      )}&body=${encodeURIComponent(body)}`
      setStatus('mailto')
      return
    }

    setStatus('sending')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(String(res.status))
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const message =
    status === 'sent'
      ? 'Thanks. We’ve received your request and will reply soon.'
      : status === 'mailto'
        ? 'Your email app should open with your message ready to send.'
        : status === 'error'
          ? `Something went wrong. Please try again or email ${INFO.email}.`
          : 'We’ll only use your details to respond to your enquiry.'

  return createPortal(
    <div
      id="contact-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-overlay-title"
      aria-hidden={!open}
      data-open={open}
      className="dk-contact"
      {...({ inert: open ? undefined : '' } as object)}
    >
      <div className="dk-contact__scrim" aria-hidden="true" />

      <button
        ref={closeRef}
        type="button"
        className="dk-contact__close"
        aria-label="Close contact form"
        onClick={onClose}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.200" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className="dk-contact__sheet">
        <div className="dk-contact__bg" aria-hidden="true">
          <span className="dk-contact__mesh" style={{ backgroundImage: `url(${meshSrc})` }} />
          <span className="dk-contact__glow" style={{ backgroundImage: `url(${glowSrc})` }} />
        </div>

        <div className="dk-contact__scroll">
          <div className="dk-contact__inner">
            <section className="dk-contact__copy">
              <h2 id="contact-overlay-title" className="dk-contact__title" style={idx(0)}>
                Let’s <em>Automate</em> Your Growth
              </h2>
              <p className="dk-contact__lead" style={idx(1)}>
                Looking to streamline operations, grow your digital presence, or build something
                better? We’re here to turn your vision into reality.
              </p>

              <dl className="dk-contact__facts">
                <div style={idx(2)}>
                  <dt>Address</dt>
                  <dd>
                    {INFO.address[0]}
                    <br />
                    <span className="dk-contact__soft">{INFO.address[1]}</span>
                  </dd>
                </div>
                <div style={idx(3)}>
                  <dt>Office hours</dt>
                  <dd>{INFO.hours}</dd>
                </div>
                <div style={idx(4)}>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${INFO.email}`}>{INFO.email}</a>
                  </dd>
                </div>
                <div style={idx(5)}>
                  <dt>Follow</dt>
                  <dd>
                    <ul className="dk-contact__social">
                      {SOCIAL.map((s) => (
                        <li key={s.id}>
                          <a
                            href={s.href}
                            aria-label={s.label}
                            onClick={(e) => {
                              if (s.href === '#') e.preventDefault()
                            }}
                          >
                            <SocialIcon id={s.id} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </section>

            <div className="dk-contact__cardwrap" style={idx(2)}>
              <form className="dk-contact__card" onSubmit={onSubmit}>
                <span className="dk-contact__badge" aria-hidden="true">
                  <img src={dkMark} alt="" draggable={false} />
                </span>

                {FIELDS.map((f) => (
                  <div className="dk-contact__field" key={f.name}>
                    <label htmlFor={`contact-${f.name}`} className="dk-contact__sr">{f.label}</label>
                    <input
                      id={`contact-${f.name}`}
                      name={f.name}
                      type={f.type}
                      autoComplete={f.autoComplete}
                      placeholder={`${f.label}*`}
                      required
                    />
                  </div>
                ))}

                <div className="dk-contact__field">
                  <label htmlFor="contact-details" className="dk-contact__sr">Share project details</label>
                  <textarea
                    id="contact-details"
                    name="details"
                    rows={4}
                    placeholder="Share project details*"
                    required
                  />
                </div>

                <button type="submit" className="dk-contact__submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send Your Request'}
                </button>
                <p className="dk-contact__note" role="status" aria-live="polite" data-state={status}>
                  {message}
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
