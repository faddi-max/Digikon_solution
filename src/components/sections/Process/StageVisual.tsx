import type { ReactNode } from 'react'

import type { StageId } from './processStagesData'

/** Glass panel that floats over each stage photo. Purely illustrative, so hidden from AT. */
function Panel({ title, meta, children }: { title?: string; meta?: ReactNode; children: ReactNode }) {
  return (
    <div className="relative w-full max-w-[21.875rem] rounded-[1.25rem] border border-white/15 bg-white/[0.07] p-4 shadow-[0_1.875rem_3.75rem_-1.5rem_rgb(0_0_0/0.6)] backdrop-blur-md sm:p-5">
      {title && (
        <div className="mb-4 flex items-center justify-between text-[0.8125rem] font-bold text-white">
          {title}
          <span className="text-[0.625rem] font-semibold tracking-[0.12em] text-white/50 uppercase">{meta}</span>
        </div>
      )}
      {children}
    </div>
  )
}

type DotState = 'done' | 'busy' | 'todo'

function Dot({ state = 'done' }: { state?: DotState }) {
  if (state === 'busy')
    return <span className="size-5 shrink-0 animate-spin rounded-full border-2 border-green-500/30 border-t-green-500" />
  if (state === 'todo') return <span className="size-5 shrink-0 rounded-full border-[1.5px] border-dashed border-white/35" />
  return (
    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-green-500 text-teal-900">
      <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 6.5l2.2 2.2L9.5 3.5" />
      </svg>
    </span>
  )
}

function Row({ state, children, badge }: { state?: DotState; children: ReactNode; badge?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-2.5 text-[0.8125rem] font-semibold text-white/90 last:mb-0">
      <Dot state={state} />
      <span className="min-w-0 truncate">{children}</span>
      {badge && (
        <span className="ml-auto shrink-0 rounded-full bg-green-500/20 px-2 py-0.5 text-[0.625rem] font-bold text-green-500">
          {badge}
        </span>
      )}
    </div>
  )
}

function Progress({ value }: { value: number }) {
  return (
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
      <b className="block h-full rounded-full bg-gradient-to-r from-green-500 to-green-300" style={{ width: `${value}%` }} />
    </div>
  )
}

function Screen({ active = false, pattern }: { active?: boolean; pattern: readonly ('s' | 'b' | 'l')[] }) {
  return (
    <div
      className={`flex aspect-[3/4.4] flex-col gap-1.5 rounded-xl border bg-white/[0.07] p-2 ${active ? 'border-green-500 shadow-[0_0_0_4px_rgb(129_216_112/0.15)]' : 'border-white/20'}`}
    >
      {pattern.map((p, i) => (
        <i
          key={i}
          className={`block rounded-full ${p === 'b' ? 'h-5 rounded-md bg-green-500/35' : 'h-1.5 bg-white/25'} ${p === 's' ? 'w-3/5' : ''}`}
        />
      ))}
    </div>
  )
}

export function StageVisual({ id }: { id: StageId }) {
  switch (id) {
    case 'onboarding':
      return (
        <Panel title="Kick-off checklist" meta="Align">
          <Row>Goals &amp; success metrics</Row>
          <Row>Users &amp; constraints</Row>
          <Row state="busy">Roles &amp; communication</Row>
          <Row state="todo">Access &amp; resources</Row>
          <div className="mt-3.5 flex items-center">
            <i className="size-7 rounded-full border-2 border-teal-800 bg-gradient-to-br from-green-300 to-green-500" />
            <i className="-ml-2 size-7 rounded-full border-2 border-teal-800 bg-gradient-to-br from-canvas-50 to-ink-muted" />
            <i className="-ml-2 size-7 rounded-full border-2 border-teal-800 bg-gradient-to-br from-green-500 to-teal-900" />
            <span className="ml-2.5 text-xs text-white/60">You + DigiKon team</span>
          </div>
        </Panel>
      )
    case 'prototyping':
      return (
        <Panel title="User flow" meta="v0.3">
          <div className="relative my-1 grid grid-cols-3 items-center gap-3.5 before:absolute before:inset-x-[12%] before:top-1/2 before:-z-10 before:border-t-2 before:border-dashed before:border-green-500/60">
            <Screen pattern={['s', 'b', 'l', 's']} />
            <Screen active pattern={['s', 'l', 'b', 's']} />
            <Screen pattern={['l', 'b', 's', 'l']} />
          </div>
          <Progress value={66} />
        </Panel>
      )
    case 'uiux':
      return (
        <Panel title="Design system" meta="Tokens">
          <div className="mb-3.5 flex gap-2">
            {['bg-green-500', 'bg-green-300', 'bg-teal-800 ring-1 ring-white/25', 'bg-teal-900 ring-1 ring-white/25', 'bg-canvas-50'].map((c) => (
              <i key={c} className={`h-8 flex-1 rounded-lg ${c}`} />
            ))}
          </div>
          <div className="mb-3.5 flex items-baseline gap-3">
            <b className="font-display text-[2.5rem] leading-none font-normal text-white">Aa</b>
            <span className="text-xs leading-snug text-white/60">
              DM Serif Display + Manrope
              <br />
              Headings · Body · Labels
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-green-500 px-4 py-2 text-xs font-extrabold text-teal-900">Primary</span>
            <span className="rounded-full border border-white/25 px-4 py-2 text-xs font-bold text-white">Secondary</span>
            <span className="relative ml-auto h-[1.375rem] w-[2.375rem] rounded-full bg-green-500 after:absolute after:top-[3px] after:right-[3px] after:size-4 after:rounded-full after:bg-teal-900" />
          </div>
        </Panel>
      )
    case 'development':
      return (
        <Panel title="feature/checkout" meta="PR #42">
          <pre className="m-0 overflow-hidden font-mono text-[0.75rem] leading-[1.9] whitespace-pre text-white/60">
            <span className="text-white/35">{'// connect services'}</span>
            {'\n'}
            <span className="text-green-500">const</span> api = <span className="text-green-500">await</span> connect(
            <span className="text-green-300">'orders'</span>)
            {'\n'}
            <span className="text-green-500">export async function</span> place(cart) {'{'}
            {'\n  '}
            <span className="text-green-500">return</span> api.create(cart)
            {'\n}'}
          </pre>
          <div className="mt-3.5">
            <Row badge="Reviewed">Build passing</Row>
          </div>
        </Panel>
      )
    case 'testing':
      return (
        <Panel title="Test run" meta="Retest">
          <Row badge="Pass">Login flow</Row>
          <Row badge="Pass">Checkout on mobile</Row>
          <Row state="busy" badge={<span className="font-semibold text-white/60">running</span>}>
            Safari &amp; Chrome
          </Row>
          <Row badge="Fixed">Bug #18 retested</Row>
        </Panel>
      )
    case 'qa':
      return (
        <Panel>
          <div className="mx-auto mt-1 mb-4 grid size-[7.5rem] place-items-center rounded-full bg-green-500">
            <div className="grid size-24 place-items-center rounded-full bg-teal-800 text-center leading-none">
              <span>
                <svg viewBox="0 0 24 24" className="mx-auto size-7 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                <small className="mt-1 block text-[0.625rem] font-semibold text-white/60">Release ready</small>
              </span>
            </div>
          </div>
          <Row>Acceptance criteria met</Row>
          <Row>Release checklist signed off</Row>
        </Panel>
      )
    case 'deploy':
      return (
        <Panel
          title="Production"
          meta={
            <span className="inline-flex items-center gap-2 rounded-full bg-green-500/15 px-3 py-1 font-bold tracking-[0.08em] text-green-500">
              <i className="size-2 animate-pulse rounded-full bg-green-500" />
              Live
            </span>
          }
        >
          <Row>Environment configured</Row>
          <Row>Smoke tests passed</Row>
          <Row>Handover docs delivered</Row>
          <Progress value={100} />
        </Panel>
      )
  }
}
