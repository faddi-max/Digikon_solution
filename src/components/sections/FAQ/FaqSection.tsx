import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { ScrollRevealText } from '@/components/motion/ScrollRevealText'

import './Faq.css'

type Qa = { q: string; a: string }

/** Copy taken verbatim from the supplied HTML, including its [X weeks] placeholders. */
const QS: readonly Qa[] = [
  {
    q: 'What does a first engagement look like?',
    a: 'It starts with a discovery call. We learn your goals, look at what you have today and agree on a clear first piece of work, usually an audit or a focused project, before anything is signed.',
  },
  {
    q: 'Can I use just one service?',
    a: 'Yes. Plenty of clients start with one thing, like a new website or SEO, and add more once they have seen how we work. Every service stands on its own.',
  },
  {
    q: 'How do you measure success?',
    a: 'We set a baseline and agree target metrics during Discover, then report against them every month: traffic, leads, conversions or whatever matters most to your business.',
  },
  {
    q: 'How long do projects take?',
    a: 'It depends on scope. A focused audit takes [X weeks]; a full website build takes [X to Y weeks]. You get a timeline with milestones before we start.',
  },
  {
    q: 'Will I own what you create?',
    a: 'Yes. Once the project is paid for, the designs, code, content and accounts are yours. No lock-in, and we hand everything over properly.',
  },
]

const TYPING_MS = 1100
const pad = (n: number) => (n < 10 ? '0' : '') + n

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  )
}

export type FaqItem = { q: string; a: string }

export function FaqSection({
  accent = '#81D870',
  items,
}: {
  accent?: string
  items?: readonly FaqItem[]
} = {}) {
  const qs = items && items.length > 0 ? items : QS
  const [history, setHistory] = useState<number[]>([0])
  const [typing, setTyping] = useState(false)
  const [seen, setSeen] = useState<Record<number, true>>({ 0: true })
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const ask = (i: number) => {
    if (history[history.length - 1] === i && !typing) return
    setHistory((h) => h.filter((x) => x !== i).concat(i))
    setSeen((s) => ({ ...s, [i]: true }))
    setTyping(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setTyping(false), TYPING_MS)
  }

  const current = history[history.length - 1]
  const thread = history.slice(-2).map((qi, k, arr) => {
    const isLast = k === arr.length - 1
    return { qi, typing: isLast && typing, old: !isLast }
  })
  const sugs = qs.map((x, i) => ({ q: x.q, i })).filter((x) => !seen[x.i]).slice(0, 2)
  const showSugs = !typing && sugs.length > 0
  const seenCount = Object.keys(seen).length

  return (
    <section
      id="faqs"
      className="dk-faq"
      aria-labelledby="faq-title"
      style={{ '--accent': accent, width: '100%', boxSizing: 'border-box', padding: '120px 0' } as CSSProperties}
    >
      <div className="glow" aria-hidden="true" />
      <div className="dots" aria-hidden="true" />

      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 clamp(16px, 5.5vw, 80px)',
          boxSizing: 'border-box',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 64,
          alignItems: 'stretch',
        }}
      >
        <div style={{ flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div className="eyebrow">
            <span className="dot" />
            FAQs
          </div>
          <h2 id="faq-title" className="serif dk-faq__heading">
            <ScrollRevealText
              as="span"
              className="dk-faq__heading-part"
              style={{ display: 'inline' }}
              text="Straight"
              split="words"
              mode="play"
              duration={1.2}
              stagger={0.1}
              yOffset={20}
              start="top 85%"
            />{' '}
            <ScrollRevealText
              as="span"
              className="dk-faq__heading-part dk-faq__heading-part--italic"
              style={{ display: 'inline' }}
              text="answers."
              split="words"
              mode="play"
              duration={1.2}
              stagger={0.1}
              yOffset={20}
              start="top 85%"
            />
          </h2>
          <p style={{ margin: '0 0 14px', maxWidth: 420, fontSize: 16, lineHeight: 1.6, color: 'rgba(3,23,29,.68)' }}>
            Pick a question and the team answers. No sales script, just how we actually work.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} role="group" aria-label="Questions">
            {qs.map((x, i) => {
              const on = i === current
              return (
                <button
                  key={x.q}
                  type="button"
                  className={on ? 'q on' : seen[i] ? 'q seen' : 'q'}
                  aria-pressed={on}
                  onClick={() => ask(i)}
                >
                  <span className="n">{pad(i + 1)}</span>
                  <span className="t">{x.q}</span>
                  <span className="ic" aria-hidden="true">
                    <ArrowRight />
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="chat">
          <div className="chead">
            <span className="av">DK</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Ask the team</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.62)' }}>
                <span className="live" />
                Real answers from the people doing the work
              </span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,.62)' }}>
              {pad(seenCount)} / {pad(qs.length)} READ
            </span>
          </div>

          <div className="cbody" aria-live="polite">
            {thread.map((m) => (
              <div
                key={m.qi}
                className={m.old ? 'old' : ''}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                <div className="me">{qs[m.qi]?.q ?? ''}</div>
                {m.typing ? (
                  <div className="them">
                    <span className="av sm" aria-hidden="true">DK</span>
                    <span className="typing" aria-label="Typing"><i /><i /><i /></span>
                  </div>
                ) : (
                  <div className="them">
                    <span className="av sm" aria-hidden="true">DK</span>
                    <div className="bub">{qs[m.qi]?.a ?? ''}</div>
                  </div>
                )}
              </div>
            ))}

            {showSugs && (
              <div className="sugs">
                {sugs.map((s) => (
                  <button key={s.i} type="button" className="sug" onClick={() => ask(s.i)}>
                    {s.q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="cfoot">
            <span style={{ fontSize: 15, color: 'rgba(255,255,255,.78)' }}>Question not here? Ask us directly.</span>
            <a href="#contact" className="cta">
              Book a call
              <span className="ar"><ArrowUpRight /></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
