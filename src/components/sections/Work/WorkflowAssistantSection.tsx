import { useEffect, useRef, useState, type FormEvent } from 'react'

import networkBg from '@/assets/images/automation-network-bg.png'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

/**
 * "Try a tiny workflow assistant.": a scripted, local demo of how an automation assistant
 * might structure a rough request. Nothing is sent anywhere and no AI service is called; the
 * replies are templates, and the section says so.
 *
 * Design: 1920 x 809 (min-height 584.51), 65px padding top and bottom, background
 * linear-gradient(136.24deg, #C8F0BE -19.97%, #03171D 37.3%, rgba(46,125,50,.8) 100%), with the
 * network picture over it at 13% in overlay. From 1280px it is the 1920px design scaled as a
 * unit (`--u` is 1/1920 of the width; small type keeps a readable floor). Below 1280px
 * everything stacks: label, heading, copy, then the demo panel at full width.
 *
 * Motion (GSAP, once, on scroll): the picture settles in, the heading rises word by word, the
 * panel lifts in and its contents follow. In the demo, messages slide in, a typing indicator
 * shows while the "assistant" works, and the steps arrive one after another. The picture
 * drifts with the pointer on fine pointers. Reduced motion shows the finished section and
 * adds messages instantly.
 *
 * Accessibility: the log is a polite live region, the field has a real label, chips are
 * buttons, and the form works from the keyboard.
 */

const COPY = {
  label: 'A taste of AI Assistance',
  lead: ['Try', 'a', 'tiny'],
  accent: ['workflow', 'assistant.'],
  body: 'This local demo shows how an assistant can turn a rough request into a clearer next step. It is a scripted prototype—not a connected AI service and does not send your input anywhere.',
  greeting:
    'Hi! I can demonstrate how an automation assistant might structure a task. Choose a sample request below, or type your own.',
}

type Sample = { label: string; prompt: string; steps: readonly string[] }

const SAMPLES: readonly Sample[] = [
  {
    label: 'Triage a new lead',
    prompt: 'Triage a new lead that came in through the contact form.',
    steps: [
      'Read the enquiry and pull out the name, company and what they need.',
      'Check it against your qualifying rules, such as size, timing and fit.',
      'Route it to the right owner and draft a short acknowledgement.',
      'Flag anything unclear for a person to review before it is sent.',
    ],
  },
  {
    label: 'Summarise a weekly report',
    prompt: 'Summarise our weekly report for the team.',
    steps: [
      'Collect the week’s figures from the sources you already use.',
      'Compare them with last week and mark what moved.',
      'Write a plain-language summary: what changed, why it may matter, what to watch.',
      'Send a draft to a person for approval before it goes out.',
    ],
  },
  {
    label: 'Draft a follow-up',
    prompt: 'Draft a follow-up after a sales call.',
    steps: [
      'Pull the key points and agreed next steps from your call notes.',
      'Draft a short follow-up in your usual tone.',
      'Attach the relevant document and propose a date for the next step.',
      'Hold it as a draft so a person can edit and send it.',
    ],
  },
]

const GENERIC_STEPS = [
  'Identify what starts the task and what a finished result looks like.',
  'List the information needed and where it already lives.',
  'Decide which steps can run automatically and which need a person.',
  'Add a review point before anything is sent or changed.',
]

type Msg =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'assistant'; text: string; steps?: readonly string[] }

const TYPING_MS = 1100

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[1em] fill-none stroke-current stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function WorkflowAssistantSection() {
  const root = useRef<HTMLElement>(null)
  const log = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const nextId = useRef(1)
  const motion = !useMediaQuery('(prefers-reduced-motion: reduce)')

  const [messages, setMessages] = useState<Msg[]>([{ id: 0, role: 'assistant', text: COPY.greeting }])
  const [typing, setTyping] = useState(false)
  const [value, setValue] = useState('')

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // Animate the newest message in and keep the log scrolled to the bottom.
  useEffect(() => {
    const el = log.current
    if (!el) return
    const items = el.querySelectorAll<HTMLElement>('[data-wa="msg"]')
    const last = items[items.length - 1]
    if (last && messages.length > 1 && motion) {
      const own = last.dataset.role === 'user'
      gsap.fromTo(
        last,
        { autoAlpha: 0, y: 14, x: own ? 16 : -16 },
        { autoAlpha: 1, y: 0, x: 0, duration: 0.5, ease: 'power3.out' },
      )
      const steps = last.querySelectorAll('[data-wa="step"]')
      if (steps.length) {
        gsap.fromTo(
          steps,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.18, delay: 0.25, ease: 'power3.out' },
        )
      }
    }
    el.scrollTo({ top: el.scrollHeight, behavior: motion ? 'smooth' : 'auto' })
  }, [messages, typing, motion])

  const run = (prompt: string, steps: readonly string[], intro: string) => {
    if (typing) return
    window.clearTimeout(timer.current)
    setMessages((m) => [...m, { id: nextId.current++, role: 'user', text: prompt }])
    setTyping(true)
    timer.current = window.setTimeout(
      () => {
        setMessages((m) => [...m, { id: nextId.current++, role: 'assistant', text: intro, steps }])
        setTyping(false)
      },
      motion ? TYPING_MS : 0,
    )
  }

  const onSample = (s: Sample) =>
    run(s.prompt, s.steps, 'Here is one way an assistant could structure that. This is a scripted example:')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const text = value.trim()
    if (!text || typing) return
    setValue('')
    run(text, GENERIC_STEPS, 'Here is a general way to structure a request like that. This is a scripted example, so it does not read your wording:')
  }

  useGSAP(
    () => {
      const el = root.current
      if (!el || !motion) return
      const all = <T extends Element = HTMLElement>(sel: string) =>
        gsap.utils.toArray<T>(el.querySelectorAll(sel))
      const one = <T extends Element = HTMLElement>(sel: string) => el.querySelector<T>(sel)

      const mm = gsap.matchMedia(el)
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const bg = one('[data-wa="bg"]')
        const words = all('[data-wa="word"]')
        const fades = all('[data-wa="fade"]')
        const panel = one('[data-wa="panel"]')
        const inner = all('[data-wa="inner"]')

        gsap.set(bg, { autoAlpha: 0, scale: 1.08 })
        gsap.set(words, { yPercent: 115 })
        gsap.set(fades, { autoAlpha: 0, y: 18 })
        gsap.set(panel, { autoAlpha: 0, y: 40 })
        gsap.set(inner, { autoAlpha: 0, y: 14 })

        const entrance = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: el, start: 'top 72%', once: true },
        })
        entrance
          .to(bg, { autoAlpha: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 0)
          .to(words, { yPercent: 0, duration: 0.75, stagger: 0.06 }, 0.1)
          .to(fades, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.35)
          .to(panel, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.5)
          .to(inner, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0.85)

        // The picture follows the pointer a little (fine pointers only).
        const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
        const setX = bg ? gsap.quickTo(bg, 'x', { duration: 1.2, ease: 'power3.out' }) : null
        const setY = bg ? gsap.quickTo(bg, 'y', { duration: 1.2, ease: 'power3.out' }) : null
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          setX?.(((e.clientX - r.left) / r.width - 0.5) * -26)
          setY?.(((e.clientY - r.top) / r.height - 0.5) * -16)
        }
        if (fine) el.addEventListener('pointermove', onMove)

        return () => {
          if (fine) el.removeEventListener('pointermove', onMove)
          entrance.scrollTrigger?.kill()
          entrance.kill()
          ScrollTrigger.refresh()
        }
      })
    },
    { scope: root, dependencies: [motion] },
  )

  return (
    <section
      ref={root}
      aria-labelledby="automation-assistant-title"
      className="@container relative isolate overflow-clip bg-[linear-gradient(136.24deg,#C8F0BE_-19.97%,#03171D_37.3%,rgba(46,125,50,0.8)_100%)] text-white"
    >
      {/* The network picture: 13%, overlay, a little larger than the section so it can drift. */}
      <div data-wa="bg" aria-hidden="true" className="pointer-events-none absolute -inset-[2%] -z-10 mix-blend-overlay">
        <img
          src={networkBg}
          alt=""
          width={1672}
          height={941}
          loading="lazy"
          decoding="async"
          className="size-full object-cover opacity-[0.13]"
        />
      </div>

      <div className="[--u:calc(100cqw/1920)] relative px-5 py-16 sm:px-10 sm:py-[65px] min-[1280px]:u-h-809 min-[1280px]:u-min-h-[584.51] min-[1280px]:p-0">
        {/* Label. */}
        <p
          data-wa="fade"
          className="flex items-center gap-2.5 text-[0.9375rem] leading-5 font-medium text-green-500 min-[1280px]:absolute min-[1280px]:u-top-124 min-[1280px]:u-left-297 min-[1280px]:u-gap-10 min-[1280px]:u-text-[15.5] min-[1280px]:u-leading-20 [--tf:13px]"
        >
          <span className="size-2 rounded-[1px] bg-green-500 min-[1280px]:u-size-8" aria-hidden="true" />
          {COPY.label}
        </p>

        {/* Heading. */}
        <h2
          id="automation-assistant-title"
          className="font-display mt-5 text-[clamp(2.25rem,9.5vw,3.5rem)] leading-[1.13] font-normal tracking-[-0.005em] min-[1280px]:absolute min-[1280px]:u-top-157 min-[1280px]:u-left-297 min-[1280px]:mt-0 min-[1280px]:u-text-[55.2] min-[1280px]:text-wrap! [--tf:30px]"
        >
          <span className="block">
            {COPY.lead.map((w) => (
              <span key={w}>
                <span className="-mx-[0.1em] -mb-[0.2em] inline-block overflow-clip px-[0.1em] pb-[0.2em] align-bottom">
                  <span data-wa="word" className="inline-block">
                    {w}
                  </span>
                </span>{' '}
              </span>
            ))}
          </span>
          <span className="block">
            {COPY.accent.map((w, i) => (
              <span key={w}>
                <span className="-mx-[0.1em] -mb-[0.2em] inline-block overflow-clip px-[0.1em] pb-[0.2em] align-bottom">
                  <span data-wa="word" className="inline-block">
                    <em className="text-green-500 italic">{w}</em>
                  </span>
                </span>
                {i < COPY.accent.length - 1 ? ' ' : ''}
              </span>
            ))}
          </span>
        </h2>

        {/* Intro copy. */}
        <p
          data-wa="fade"
          className="mt-5 max-w-[34rem] text-[1rem] leading-[1.7] font-medium text-white/75 min-[1280px]:absolute min-[1280px]:u-top-173 min-[1280px]:u-left-961 min-[1280px]:mt-0 min-[1280px]:u-w-600 min-[1280px]:max-w-none min-[1280px]:u-text-[17.8] min-[1280px]:u-leading-29 min-[1280px]:text-wrap! [--tf:14px]"
        >
          {COPY.body}
        </p>

        {/* The demo panel. */}
        <div
          data-wa="panel"
          className="relative mt-10 flex flex-col overflow-clip rounded-[1.25rem] border border-white/[0.08] bg-[#03171d] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)] min-[1280px]:absolute min-[1280px]:u-top-328 min-[1280px]:u-left-261 min-[1280px]:u-w-1387 min-[1280px]:u-h-374 min-[1280px]:mt-0 min-[1280px]:u-rounded-26"
        >
          {/* Header. */}
          <div
            data-wa="inner"
            className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-4 py-3.5 text-[0.625rem] leading-none font-medium tracking-[0.06em] text-white/60 uppercase min-[1280px]:u-h-43 min-[1280px]:px-[calc(14*var(--u))] min-[1280px]:py-0 min-[1280px]:u-text-[10] [--tf:10px]"
          >
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgb(129_216_112/0.8)]" aria-hidden="true" />
              DigiKon workflow preview
            </span>
            <span>Demo mode</span>
          </div>

          {/* Conversation. */}
          <div
            ref={log}
            role="log"
            aria-live="polite"
            aria-label="Workflow assistant conversation"
            className="flex max-h-[22rem] min-h-[15rem] flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 pt-5 pb-3 min-[1280px]:max-h-none min-[1280px]:min-h-0 min-[1280px]:gap-[calc(12*var(--u))] min-[1280px]:px-[calc(20*var(--u))] min-[1280px]:pt-[calc(24*var(--u))]"
          >
            {messages.map((m) =>
              m.role === 'user' ? (
                <div
                  key={m.id}
                  data-wa="msg"
                  data-role="user"
                  className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-green-500 px-4 py-2.5 text-[0.8125rem] leading-[1.5] font-semibold text-teal-900 min-[1280px]:u-text-[12.5] min-[1280px]:u-leading-19 [--tf:13px]"
                >
                  {m.text}
                </div>
              ) : (
                <div
                  key={m.id}
                  data-wa="msg"
                  data-role="assistant"
                  className="max-w-full self-stretch rounded-xl bg-teal-800 px-4 py-3 text-[0.8125rem] leading-[1.6] text-white/85 min-[1280px]:u-text-[11.5] min-[1280px]:u-leading-17 min-[1280px]:px-[calc(14*var(--u))] min-[1280px]:py-[calc(11*var(--u))] [--tf:13px]"
                >
                  <p>{m.text}</p>
                  {m.steps && (
                    <ol className="mt-3 grid gap-2">
                      {m.steps.map((s, i) => (
                        <li key={s} data-wa="step" className="flex gap-3">
                          <span className="mt-px grid size-5 flex-none place-items-center rounded-full border border-green-500/60 text-[0.625rem] font-bold text-green-500">
                            {i + 1}
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ),
            )}
            {typing && (
              <div data-wa="typing" className="flex w-fit gap-1.5 rounded-xl bg-teal-800 px-4 py-3" role="status" aria-label="Assistant is typing">
                {[0, 1, 2].map((i) => (
                  <i
                    key={i}
                    className="size-1.5 animate-bounce rounded-full bg-white/60 motion-reduce:animate-none"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sample requests. */}
          <div
            data-wa="inner"
            role="group"
            aria-label="Sample requests"
            className="flex flex-wrap gap-2 px-4 pb-4 min-[1280px]:gap-[calc(8*var(--u))] min-[1280px]:px-[calc(20*var(--u))] min-[1280px]:pb-[calc(20*var(--u))]"
          >
            {SAMPLES.map((s) => (
              <button
                key={s.label}
                type="button"
                disabled={typing}
                onClick={() => onSample(s)}
                className="min-h-11 rounded-full border border-white/25 px-3.5 text-[0.75rem] leading-none font-medium text-white/85 transition-[background-color,border-color,color] duration-200 ease-out hover:border-green-500 hover:bg-green-500 hover:text-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 disabled:cursor-not-allowed disabled:opacity-50 min-[1280px]:u-h-28 min-[1280px]:min-h-7 min-[1280px]:px-[calc(10*var(--u))] min-[1280px]:u-text-[10] [--tf:11px]"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Input. */}
          <form
            data-wa="inner"
            onSubmit={onSubmit}
            className="flex items-center gap-3 border-t border-white/[0.08] p-4 min-[1280px]:u-w-750 min-[1280px]:u-h-71 min-[1280px]:gap-[calc(8*var(--u))] min-[1280px]:p-0 min-[1280px]:px-[calc(14*var(--u))]"
          >
            <label htmlFor="wa-input" className="sr-only">
              Describe a repetitive task
            </label>
            <input
              id="wa-input"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={200}
              autoComplete="off"
              placeholder="Describe a repetitive task…"
              className="h-11 min-w-0 flex-1 rounded-full border border-white/[0.14] bg-transparent px-4 text-base text-white placeholder:text-green-500 focus-visible:border-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 min-[1280px]:u-h-45 min-[1280px]:min-h-11 min-[1280px]:px-[calc(14*var(--u))] min-[1280px]:u-text-[11] min-[1280px]:text-[max(14px,calc(11*var(--u)))] [--tf:14px]"
            />
            <button
              type="submit"
              disabled={typing || !value.trim()}
              className="group inline-flex h-11 flex-none items-center gap-2 rounded-full bg-green-500 px-5 text-[0.8125rem] leading-none font-bold text-teal-900 transition-[background-color,transform,opacity] duration-200 ease-out hover:bg-green-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60 min-[1280px]:u-h-45 min-[1280px]:min-h-11 min-[1280px]:px-[calc(18*var(--u))] min-[1280px]:u-text-[11] min-[1280px]:text-[max(13px,calc(11*var(--u)))]"
            >
              Run Demo
              <span className="transition-transform duration-200 ease-out group-enabled:group-hover:translate-x-0.5">
                <Arrow />
              </span>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
