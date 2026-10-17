import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { prefersReducedMotion } from '@/lib/motion'

import './Process.css'

type Phase = { title: string; desc: string; steps: string[]; tags: string[] }

/** Copy taken verbatim from the supplied HTML. */
const PHASES: readonly Phase[] = [
  {
    title: 'Discover',
    desc: 'We audit your website, search presence, data and goals, then define what success should look like.',
    steps: [
      'Kick-off call to understand your business and goals',
      'Audit of site, SEO, analytics and competitors',
      'Baseline metrics and a clear definition of success',
    ],
    tags: ['Audit report', 'Goals', 'Baseline'],
  },
  {
    title: 'Strategise',
    desc: 'We turn what we found into a prioritised roadmap: what to build, what to say and where to show up.',
    steps: ['Positioning and messaging direction', 'Channel and content plan', 'Roadmap with milestones and KPIs'],
    tags: ['Roadmap', 'Messaging', 'KPIs'],
  },
  {
    title: 'Build',
    desc: 'We design and develop the site, content and campaigns in short sprints, with your review at every step.',
    steps: [
      'Design and prototype key pages',
      'Development, content and integrations',
      'Testing, QA and launch preparation',
    ],
    tags: ['Website', 'Content', 'Campaigns'],
  },
  {
    title: 'Grow',
    desc: 'We launch, measure and keep improving every month, so results compound instead of fading.',
    steps: ['Launch and monitoring', 'Monthly reporting against your KPIs', 'Ongoing tests and optimisation'],
    tags: ['Reports', 'Optimisation', 'Support'],
  },
]

const DUR = 6000
const TICK = 100
const CIRC = 1445.13
/** Node centres on the dial, in % of its box: top, right, bottom, left. */
const POS: ReadonlyArray<readonly [number, number]> = [
  [50, 7.4],
  [92.6, 50],
  [50, 92.6],
  [7.4, 50],
]
const N = PHASES.length
const pad = (n: number) => (n < 10 ? '0' : '') + n

export function ProcessSection({ accent = '#81D870', autoplay = true }: { accent?: string; autoplay?: boolean }) {
  const [active, setActive] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [offscreen, setOffscreen] = useState(false)
  const root = useRef<HTMLElement>(null)

  // Autoplay is off for reduced-motion users; the phases stay fully usable by click and keyboard.
  const auto = autoplay && !prefersReducedMotion()

  // Don't run the timer while the section is off-screen.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!auto || paused || offscreen) return
    const id = window.setInterval(() => {
      setElapsed((e) => {
        const next = e + TICK
        if (next >= DUR) {
          setActive((a) => (a + 1) % N)
          return 0
        }
        return next
      })
    }, TICK)
    return () => window.clearInterval(id)
  }, [auto, paused, offscreen])

  const go = (i: number) => {
    setActive((i + N) % N)
    setElapsed(0)
  }

  const part = auto ? elapsed / DUR : 0
  const frac = (active + part) / N
  const ang = ((-90 + 360 * frac) * Math.PI) / 180
  const tipX = (270 + 230 * Math.cos(ang)).toFixed(1)
  const tipY = (270 + 230 * Math.sin(ang)).toFixed(1)
  const cur = PHASES[active]
  const nextLabel = active === N - 1 ? 'Start again' : 'Next: ' + PHASES[active + 1].title

  return (
    <section
      ref={root}
      id="how-it-works"
      className="dk-proc pw"
      aria-labelledby="proc-title"
      style={{ '--accent': accent, width: '100%', boxSizing: 'border-box', padding: '120px 0' } as CSSProperties}
    >
      <div className="bgglow" aria-hidden="true" />
      <div className="grid" aria-hidden="true" />

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 clamp(16px, 5.5vw, 80px)', boxSizing: 'border-box' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 28,
            marginBottom: 64,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 820 }}>
            <div className="eyebrow">
              <span className="dot" />
              How it works
            </div>
            <h2
              id="proc-title"
              className="serif h2"
              style={{ margin: 0, fontSize: 'clamp(44px, 6vw, 84px)', lineHeight: 1, letterSpacing: '-0.02em', color: '#03171D' }}
            >
              From first call to <em>steady growth.</em>
            </h2>
          </div>
          <p style={{ margin: 0, maxWidth: 340, fontSize: 16, lineHeight: 1.6, color: 'rgba(3,23,29,.68)' }}>
            Four phases, one team, no hand-offs. Tap a phase on the dial to see what happens and what you get.
          </p>
        </div>

        <div className="stage">
          <div className="dialwrap">
            <div
              className="dial"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
            >
              <svg viewBox="0 0 540 540" fill="none" aria-hidden="true">
                <g className="spin">
                  <circle className="dash" cx="270" cy="270" r="262" strokeDasharray="2 9" />
                </g>
                <g className="spin rev">
                  <circle className="dash" cx="270" cy="270" r="196" strokeDasharray="40 14" />
                </g>
                <circle className="track" cx="270" cy="270" r="230" />
                <circle
                  className="arc"
                  cx="270"
                  cy="270"
                  r="230"
                  strokeDasharray={CIRC}
                  style={{ strokeDashoffset: (CIRC * (1 - frac)).toFixed(1) }}
                  transform="rotate(-90 270 270)"
                />
                <path className="tick" d="M270 22V34M270 506V518M22 270H34M506 270H518" />
                <circle className="tiph" cx={tipX} cy={tipY} r="10" />
                <circle className="tip" cx={tipX} cy={tipY} r="9" />
              </svg>

              <div className="core" aria-live="polite">
                <span key={active} className="lbl pop">Phase {pad(active + 1)} / 04</span>
                <span key={`b${active}`} className="big serif pop">{pad(active + 1)}</span>
                <span key={`t${active}`} className="ttl serif pop">{cur.title}</span>
              </div>

              {PHASES.map((p, i) => {
                const on = i === active
                return (
                  <button
                    key={p.title}
                    type="button"
                    className={on ? 'node on' : i < active ? 'node done' : 'node'}
                    style={{ left: `${POS[i][0]}%`, top: `${POS[i][1]}%` }}
                    aria-pressed={on}
                    aria-label={`Phase ${pad(i + 1)}: ${p.title}`}
                    onClick={() => go(i)}
                  >
                    <span className="n">{pad(i + 1)}</span>
                    <span className="t">{p.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card">
            <div className="prog" aria-hidden="true">
              {PHASES.map((p, i) => {
                const fill = i < active ? 100 : i === active ? (auto ? Math.round(part * 100) : 100) : 0
                return (
                  <span key={p.title}>
                    <i style={{ width: `${fill}%` }} />
                  </span>
                )
              })}
            </div>

            <div key={active}>
              <span className="ghost" aria-hidden="true">{pad(active + 1)}</span>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div className="meta r1">Phase {pad(active + 1)}</div>
                <h3 className="serif r1" style={{ margin: 0, fontSize: 'clamp(40px, 4.4vw, 60px)', lineHeight: 1, color: '#FFFFFF' }}>
                  {cur.title}
                </h3>
                <p className="r2" style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: 'rgba(255,255,255,.78)', maxWidth: 480 }}>
                  {cur.desc}
                </p>
                <div
                  className="r3"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    padding: '22px 0',
                    borderTop: '1px solid rgba(255,255,255,.12)',
                    borderBottom: '1px solid rgba(255,255,255,.12)',
                  }}
                >
                  {cur.steps.map((t, k) => (
                    <div className="step" key={t}>
                      <b>{pad(k + 1)}</b>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
                <div className="r3" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.62)' }}>
                    What you get
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {cur.tags.map((t) => (
                      <span className="tag" key={t}>{t}</span>
                    ))}
                  </div>
                </div>
                <div
                  className="r4"
                  style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginTop: 6 }}
                >
                  <button type="button" className="nextbtn" onClick={() => go(active + 1)}>
                    {nextLabel}{' '}
                    <span className="ar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </button>
                  <button type="button" className="navbtn" aria-label="Previous phase" onClick={() => go(active - 1)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 12H5M11 18l-6-6 6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
