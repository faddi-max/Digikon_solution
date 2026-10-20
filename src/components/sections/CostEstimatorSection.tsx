import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/motion'

/**
 * "What is manual work costing you?": a small, honest estimator. Three sliders (hours of
 * manual work a week, cost of an hour, share of that time that could be reclaimed) feed one
 * result card. Nothing is sent anywhere and nothing is promised; the card says so.
 *
 * Design: a pale green field with a fine grid and dots at its crossings, then one dark green
 * panel (225deg: green, near black, green) holding the sliders on the left and the result on
 * a white card on the right. From 1280px it is the 1920px design scaled as a unit (`--u` is
 * 1/1920 of the width); below that everything stacks (two columns from 900px).
 *
 * Sums: monthly hours = hours a week x 4.33 x share reclaimed; value = hours x hourly cost;
 * a year is twelve months. The defaults (15 hrs, $45, 55%) give 35.7 hrs and $1,608 a month.
 *
 * Motion (GSAP, nothing runs off screen): on scroll the grid fades in, the heading rises word
 * by word, the panel lifts into place, the three bars fill and the result counts up. After
 * that every slider change moves the bar straight away and eases the figures to their new
 * values. A soft light follows the pointer across the panel. Reduced motion shows the finished
 * section and updates figures instantly. The sliders are real range inputs (keyboard, touch,
 * screen readers); the bar is drawn behind them.
 */

const WEEKS_PER_MONTH = 4.33

const COPY = {
  label: 'Make the case for change',
  lead: ['What', 'is', 'manual', 'work'],
  accent: ['costing', 'you?'],
  body: 'Use this simple estimator to explore the potential value of automating repetitive tasks. Adjust the assumptions to fit your team.',
}

type SliderSpec = {
  id: 'hours' | 'rate' | 'share'
  label: string
  min: number
  max: number
  step: number
  lo: string
  hi: string
  show: (v: number) => string
}

const SLIDERS: readonly SliderSpec[] = [
  { id: 'hours', label: 'Manual hours per week', min: 0, max: 40, step: 1, lo: '0 hrs', hi: '40 hrs', show: (v) => `${v} hrs` },
  { id: 'rate', label: 'Average hourly cost', min: 0, max: 80, step: 1, lo: '$0', hi: '$80', show: (v) => `$${v}` },
  { id: 'share', label: 'Potential time reclaimed', min: 0, max: 85, step: 1, lo: '0%', hi: '85%', show: (v) => `${v}%` },
]

const usd = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`
const year = (v: number) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : usd(v))
const hrs = (v: number) => `${v.toFixed(1)} hrs`

export function CostEstimatorSection() {
  const root = useRef<HTMLElement>(null)
  const motion = !useMediaQuery('(prefers-reduced-motion: reduce)')
  const [vals, setVals] = useState({ hours: 15, rate: 45, share: 55 })

  const monthlyHours = vals.hours * WEEKS_PER_MONTH * (vals.share / 100)
  const monthlyValue = monthlyHours * vals.rate
  const yearlyValue = monthlyValue * 12

  // The figures ease to their new value; the text is also always correct on first paint.
  const figs = useRef({ value: monthlyValue, hours: monthlyHours, year: yearlyValue })
  const shown = useRef({ value: monthlyValue, hours: monthlyHours, year: yearlyValue })
  const ready = useRef(false)
  const tween = useRef<gsap.core.Tween | null>(null)

  const paint = () => {
    const el = root.current
    if (!el) return
    const set = (k: string, t: string) => {
      const n = el.querySelector(`[data-rc-out="${k}"]`)
      if (n && n.textContent !== t) n.textContent = t
    }
    set('value', usd(shown.current.value))
    set('hours', hrs(shown.current.hours))
    set('year', year(shown.current.year))
  }

  useEffect(() => {
    figs.current = { value: monthlyValue, hours: monthlyHours, year: yearlyValue }
    if (!ready.current) return
    tween.current?.kill()
    if (!motion) {
      shown.current = { ...figs.current }
      paint()
      return
    }
    tween.current = gsap.to(shown.current, {
      value: figs.current.value,
      hours: figs.current.hours,
      year: figs.current.year,
      duration: 0.55,
      ease: 'power2.out',
      onUpdate: paint,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthlyValue, monthlyHours, yearlyValue, motion])

  useEffect(() => () => void tween.current?.kill(), [])

  useGSAP(
    () => {
      const el = root.current
      ready.current = true
      if (!el || !motion) return
      const all = <T extends Element = HTMLElement>(sel: string) =>
        gsap.utils.toArray<T>(el.querySelectorAll(sel))
      const one = <T extends Element = HTMLElement>(sel: string) => el.querySelector<T>(sel)

      const mm = gsap.matchMedia(el)
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const grid = one('[data-rc="grid"]')
        const words = all('[data-rc="word"]')
        const fades = all('[data-rc="fade"]')
        const panel = one('[data-rc="panel"]')
        const inner = all('[data-rc="inner"]')
        const card = one('[data-rc="card"]')
        const fills = all('[data-rc="fill"]')
        const light = one('[data-rc="light"]')

        gsap.set(grid, { autoAlpha: 0 })
        gsap.set(words, { yPercent: 115 })
        gsap.set(fades, { autoAlpha: 0, y: 18 })
        gsap.set(panel, { autoAlpha: 0, y: 36 })
        gsap.set(inner, { autoAlpha: 0, y: 16 })
        gsap.set(card, { autoAlpha: 0, y: 26 })
        gsap.set(fills, { scaleX: 0, transformOrigin: '0% 50%' })
        shown.current = { value: 0, hours: 0, year: 0 }
        paint()

        const entrance = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: el, start: 'top 70%', once: true },
        })
        entrance
          .to(grid, { autoAlpha: 1, duration: 1.2, ease: 'power1.out' }, 0)
          .to(words, { yPercent: 0, duration: 0.75, stagger: 0.05 }, 0.1)
          .to(fades, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.35)
          .to(panel, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.5)
          .to(inner, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.07 }, 0.8)
          .to(card, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.95)
          .to(fills, { scaleX: 1, duration: 1.1, stagger: 0.12, ease: 'power3.inOut' }, 1.0)
          .to(
            shown.current,
            {
              value: figs.current.value,
              hours: figs.current.hours,
              year: figs.current.year,
              duration: 1.3,
              ease: 'power2.out',
              onUpdate: paint,
            },
            1.05,
          )

        // A soft light follows the pointer across the panel.
        const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
        const lx = light ? gsap.quickTo(light, 'x', { duration: 0.9, ease: 'power3.out' }) : null
        const ly = light ? gsap.quickTo(light, 'y', { duration: 0.9, ease: 'power3.out' }) : null
        const onMove = (e: PointerEvent) => {
          if (!panel) return
          const r = panel.getBoundingClientRect()
          lx?.(e.clientX - r.left)
          ly?.(e.clientY - r.top)
        }
        const onEnter = () => light && gsap.to(light, { autoAlpha: 1, duration: 0.5 })
        const onLeave = () => light && gsap.to(light, { autoAlpha: 0, duration: 0.6 })
        if (fine && panel) {
          panel.addEventListener('pointermove', onMove)
          panel.addEventListener('pointerenter', onEnter)
          panel.addEventListener('pointerleave', onLeave)
        }

        return () => {
          if (fine && panel) {
            panel.removeEventListener('pointermove', onMove)
            panel.removeEventListener('pointerenter', onEnter)
            panel.removeEventListener('pointerleave', onLeave)
          }
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
      aria-labelledby="automation-estimator-title"
      className="@container relative isolate overflow-clip bg-[radial-gradient(ellipse_50%_34%_at_38%_0%,rgb(196_238_188/0.7),transparent),linear-gradient(180deg,#e2f6df_0%,#e5f7e1_27%,#edfaea_50%,#f5fcf4_66%,#fcfefc_83%,#fff_95%)] text-[#03171d]"
    >
      {/* A fine grid with a dot at each crossing, fading out above the panel. */}
      <div
        data-rc="grid"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34%] [--u:calc(100cqw/1920)] [mask-image:linear-gradient(180deg,#000_72%,transparent)] bg-[radial-gradient(circle,rgb(3_23_29/0.13)_0,rgb(3_23_29/0.13)_2px,transparent_2.5px),linear-gradient(rgb(3_23_29/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(3_23_29/0.06)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] bg-[position:0_0] min-[1280px]:bg-[size:calc(133.6*var(--u))_calc(129.3*var(--u)),calc(133.6*var(--u))_calc(129.3*var(--u)),calc(133.6*var(--u))_calc(129.3*var(--u))] min-[1280px]:bg-[position:calc(33.3*var(--u))_calc(-64.65*var(--u)),calc(100*var(--u))_0,calc(100*var(--u))_0]"
      />

      <div className="[--u:calc(100cqw/1920)] max-[1279px]:px-5 max-[1279px]:pt-16 max-[1279px]:pb-20 sm:max-[1279px]:px-10 sm:max-[1279px]:pt-20 min-[1280px]:u-pl-357 min-[1280px]:u-pr-371 min-[1280px]:u-pt-167 min-[1280px]:pb-[calc(153*var(--u))]">
        {/* Heading row. */}
        <div className="min-[1280px]:flex">
          <p
            data-rc="fade"
            className="flex items-center gap-2.5 text-[0.9375rem] leading-5 font-semibold min-[1280px]:u-w-269.5 min-[1280px]:flex-none min-[1280px]:u-mt-22 min-[1280px]:u-gap-10 min-[1280px]:u-text-[15.5] min-[1280px]:u-leading-20 [--tf:13px]"
          >
            <span className="size-2 rounded-full bg-green-500 shadow-[0_0_10px_rgb(129_216_112/0.8)] min-[1280px]:u-size-8" aria-hidden="true" />
            {COPY.label}
          </p>
          <div className="mt-5 min-[1280px]:mt-0">
            <h2
              id="automation-estimator-title"
              className="font-display text-[clamp(2.1rem,8.6vw,3.25rem)] leading-[1.13] font-normal tracking-[-0.005em] min-[1280px]:u-text-[54.6] min-[1280px]:leading-[1.1] min-[1280px]:text-wrap! [--tf:30px]"
            >
              {COPY.lead.map((w) => (
                <span key={w}>
                  <span className="-mx-[0.1em] -mb-[0.2em] inline-block overflow-clip px-[0.1em] pb-[0.2em] align-bottom">
                    <span data-rc="word" className="inline-block">
                      {w}
                    </span>
                  </span>{' '}
                </span>
              ))}
              <br className="hidden min-[1280px]:block" />
              {COPY.accent.map((w, i) => (
                <span key={w}>
                  <span className="-mx-[0.1em] -mb-[0.2em] inline-block overflow-clip px-[0.1em] pb-[0.2em] align-bottom">
                    <span data-rc="word" className="inline-block">
                      <em className="text-green-500 italic">{w}</em>
                    </span>
                  </span>
                  {i < COPY.accent.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h2>
            <p
              data-rc="fade"
              className="mt-4 max-w-[34rem] text-[1rem] leading-[1.7] font-medium text-[#03171d]/60 min-[1280px]:u-mt-17.5 min-[1280px]:u-w-581 min-[1280px]:max-w-none min-[1280px]:u-text-[17.8] min-[1280px]:leading-[1.63] min-[1280px]:text-wrap! [--tf:14px]"
            >
              {COPY.body}
            </p>
          </div>
        </div>

        {/* The panel. */}
        <div
          data-rc="panel"
          className="relative isolate mt-10 overflow-clip rounded-[1.5rem] bg-[linear-gradient(225deg,#4b864e_0%,#04181d_58%,#285234_100%)] text-white max-[1279px]:p-5 sm:max-[1279px]:p-8 min-[1280px]:u-mt-57 min-[1280px]:u-min-h-647 min-[1280px]:rounded-[calc(28*var(--u))] min-[1280px]:px-[calc(41*var(--u))] min-[1280px]:pt-[calc(42*var(--u))] min-[1280px]:pb-[calc(42*var(--u))] min-[1280px]:pl-[calc(45*var(--u))]"
        >
          {/* A soft light that follows the pointer. */}
          <div
            data-rc="light"
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 -z-10 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(129_216_112/0.22),transparent_62%)] opacity-0"
          />

          <div className="grid gap-8 min-[900px]:max-[1279px]:grid-cols-2 min-[1280px]:grid-cols-[calc(477*var(--u))_calc(595*var(--u))] min-[1280px]:gap-x-[calc(34*var(--u))]">
            {/* Left: the sliders. */}
            <div className="min-[1280px]:u-pt-6">
              <p
                data-rc="inner"
                className="flex items-center gap-2 text-[0.6875rem] leading-4 font-semibold tracking-[0.12em] uppercase min-[1280px]:u-gap-8 min-[1280px]:u-text-[10] min-[1280px]:u-leading-16 [--tf:10px]"
              >
                <span className="size-1.5 bg-green-500 min-[1280px]:u-size-6" aria-hidden="true" />
                Workflow value estimator
              </p>
              <h3
                data-rc="inner"
                className="mt-5 text-[clamp(1.75rem,7vw,2.4rem)] leading-[1.1] font-normal tracking-[-0.03em] min-[1280px]:u-mt-22.5 min-[1280px]:u-text-[46] min-[1280px]:text-wrap! [--tf:30px]"
              >
                Turn repeated hours<br className="hidden min-[1280px]:block" />{' '}
                into{' '}
                <em className="font-display text-green-500 text-[0.97em] tracking-normal italic">room to grow.</em>
              </h3>
              <p
                data-rc="inner"
                className="mt-4 max-w-[26rem] text-[0.875rem] leading-[1.8] font-medium text-white/65 min-[1280px]:u-mt-20 min-[1280px]:u-w-380 min-[1280px]:max-w-none min-[1280px]:u-text-[12.9] min-[1280px]:leading-[1.85] min-[1280px]:text-wrap! [--tf:12.5px]"
              >
                Estimate the monthly value of time that could be returned to your team. This is a planning tool, not a guarantee of savings.
              </p>

              <div className="mt-8 grid gap-6 min-[1280px]:u-mt-30.5 min-[1280px]:gap-[calc(26*var(--u))]">
                {SLIDERS.map((s) => {
                  const v = vals[s.id]
                  const pct = ((v - s.min) / (s.max - s.min)) * 100
                  const labelId = `est-${s.id}-label`
                  return (
                    <div key={s.id} data-rc="inner">
                      <div className="flex items-baseline justify-between text-[0.75rem] leading-4 font-medium min-[1280px]:u-text-[11.5] min-[1280px]:u-leading-16 [--tf:11px]">
                        <label id={labelId} htmlFor={`est-${s.id}`} className="text-white/85">
                          {s.label}
                        </label>
                        <output htmlFor={`est-${s.id}`} className="font-semibold text-green-500">
                          {s.show(v)}
                        </output>
                      </div>
                      {/* The bar is drawn here; the real input sits invisibly on top of it. */}
                      <div className="relative mt-3.5 h-4 min-[1280px]:u-mt-14 min-[1280px]:u-h-16">
                        <div className="absolute inset-0 rounded-full bg-white" />
                        <div data-rc="fill" className="absolute inset-y-0 left-0 rounded-full bg-green-500 transition-[width] duration-150 ease-out" style={{ width: `${pct}%` }} />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 scale-50 rounded-full border-2 border-green-500 bg-white opacity-0 shadow-[0_2px_10px_rgb(0_0_0/0.35)] transition-[transform,opacity] duration-200 ease-out peer-hover:scale-100 peer-hover:opacity-100 peer-focus-visible:scale-100 peer-focus-visible:opacity-100 peer-active:scale-110 peer-active:opacity-100"
                          style={{ left: `clamp(0.75rem, ${pct}%, calc(100% - 0.75rem))`, order: 2 }}
                        />
                        <input
                          id={`est-${s.id}`}
                          type="range"
                          min={s.min}
                          max={s.max}
                          step={s.step}
                          value={v}
                          aria-labelledby={labelId}
                          aria-valuetext={s.show(v)}
                          onChange={(e) => setVals((p) => ({ ...p, [s.id]: Number(e.target.value) }))}
                          className="peer absolute -inset-y-3 -inset-x-0 h-[calc(100%+1.5rem)] w-full cursor-pointer opacity-0"
                        />
                      </div>
                      <div className="mt-2.5 flex justify-between text-[0.625rem] leading-4 text-white/45 min-[1280px]:u-mt-11 min-[1280px]:u-text-[9.5] min-[1280px]:u-leading-16 [--tf:10px]">
                        <span>{s.lo}</span>
                        <span>{s.hi}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: the result. */}
            <div
              data-rc="card"
              className="self-start rounded-2xl bg-[#f7fbf5] p-6 text-[#03171d] shadow-[0_24px_50px_-28px_rgb(0_0_0/0.7)] min-[1280px]:u-min-h-390 min-[1280px]:rounded-[calc(16*var(--u))] min-[1280px]:px-[calc(29*var(--u))] min-[1280px]:pt-[calc(32*var(--u))] min-[1280px]:pb-[calc(33*var(--u))]"
              aria-live="polite"
            >
              <p className="text-[0.625rem] leading-4 font-semibold tracking-[0.08em] text-[#03171d]/55 uppercase min-[1280px]:u-text-[9.5] min-[1280px]:u-leading-14 [--tf:10px]">
                Estimated monthly value of time reclaimed
              </p>
              <p className="mt-4 flex items-baseline gap-2 min-[1280px]:u-mt-22 min-[1280px]:u-gap-8">
                <span
                  data-rc-out="value"
                  className="font-display text-[clamp(2.75rem,12vw,3.5rem)] leading-none tracking-[-0.01em] min-[1280px]:u-text-[56] [--tf:40px]"
                >
                  {usd(monthlyValue)}
                </span>
                <span className="text-[0.75rem] font-medium text-[#03171d]/60 min-[1280px]:u-text-[11] [--tf:11px]">/ month</span>
              </p>
              <p className="mt-3 text-[0.6875rem] leading-4 text-[#03171d]/55 min-[1280px]:u-mt-21 min-[1280px]:u-text-[10] [--tf:10px]">
                Based on {vals.hours} hrs/week, ${vals.rate}/hr and {vals.share}% reclaimed.
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[#03171d]/10 pt-5 min-[1280px]:u-mt-24 min-[1280px]:grid-cols-[calc(276*var(--u))_1fr] min-[1280px]:gap-0 min-[1280px]:pt-[calc(18*var(--u))]">
                <div>
                  <dd data-rc-out="hours" className="m-0 text-[1rem] leading-[1.2] font-bold min-[1280px]:u-text-[15] [--tf:15px]">
                    {hrs(monthlyHours)}
                  </dd>
                  <dt className="mt-1 text-[0.625rem] leading-4 font-medium text-[#03171d]/55 min-[1280px]:u-mt-8 min-[1280px]:u-text-[9.5] [--tf:10px]">
                    Estimated hours reclaimed per month
                  </dt>
                </div>
                <div>
                  <dd data-rc-out="year" className="m-0 text-[1rem] leading-[1.2] font-bold min-[1280px]:u-text-[15] [--tf:15px]">
                    {year(yearlyValue)}
                  </dd>
                  <dt className="mt-1 text-[0.625rem] leading-4 font-medium text-[#03171d]/55 min-[1280px]:u-mt-8 min-[1280px]:u-text-[9.5] [--tf:10px]">
                    Potential value across a year
                  </dt>
                </div>
              </dl>
              <p className="mt-5 text-[0.625rem] leading-[1.45] text-[#03171d]/50 min-[1280px]:u-mt-22 min-[1280px]:leading-[1.45] min-[1280px]:u-text-[9.5] min-[1280px]:text-wrap! [--tf:10px]">
                Illustrative only. It uses the assumptions above and {WEEKS_PER_MONTH} weeks a month, and is not a quote or a promise of savings. Real results depend on your workflows, systems and volumes.
              </p>
              <Link
                to="/contact"
                className="group mt-5 inline-flex items-center gap-2.5 rounded-full bg-green-500 px-5 py-2.5 text-[0.75rem] leading-none font-bold text-[#03171d] transition-[transform,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-green-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#03171d] min-[1280px]:u-mt-22 min-[1280px]:-ml-[calc(10*var(--u))] min-[1280px]:h-[calc(38*var(--u))] min-[1280px]:min-h-9 min-[1280px]:px-[calc(19*var(--u))] min-[1280px]:u-text-[11.5] min-[1280px]:py-0 [--tf:11px]"
              >
                Discuss your workflow
                <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3 fill-none stroke-current stroke-[1.8] transition-transform duration-200 group-hover:translate-x-0.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h9M8.5 4 12.5 8l-4 4" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
