import { useLayoutEffect, useRef } from 'react'

import type { ServiceHeroData } from './serviceHeroData'
import './SearchMock.css'

/** Width and height of the design the mock was drawn at (the 1920px layout). */
const DESIGN_W = 640

type Props = { mock: ServiceHeroData['mock'] }

/**
 * The dark browser window with a #1 search result and the growth card.
 *
 * It is live markup, not an image, so each part can animate on its own. Everything is laid
 * out in design pixels inside a 640 x 580 box, which is scaled as one unit to the width the
 * layout gives it: at 1920px it is 1:1 and pixel for pixel the design.
 *
 * Layers, outermost first, so pointer tilt, idle float and the entrance never fight over one
 * transform: tilt > float > enter > the shape itself (which holds the static -4.75deg turn).
 *
 * The whole thing is decorative, so it is hidden from assistive technology.
 */
export function SearchMock({ mock }: Props) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const fit = () => el.style.setProperty('--s', String(Math.min(1, el.clientWidth / DESIGN_W)))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={root} className="dk-sm" aria-hidden="true" data-sm="root">
      <div className="dk-sm__scale">
        <div className="dk-sm__tilt" data-sm="tilt">
          <div className="dk-sm__layer" data-sm="panel-float">
            <div className="dk-sm__enter" data-sm="panel-enter">
              <div className="dk-sm__panel">
                <div className="dk-sm__titlebar">
                  <span className="dk-sm__light dk-sm__light--r" />
                  <span className="dk-sm__light dk-sm__light--y" />
                  <span className="dk-sm__light dk-sm__light--g" />
                  <div className="dk-sm__url">
                    <span className="dk-sm__url-text" data-sm="url">
                      {mock.query}
                    </span>
                  </div>
                </div>

                <div className="dk-sm__search" data-sm="row">
                  <svg className="dk-sm__lens" viewBox="0 0 28 28" fill="none">
                    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M18.5 18.5 25 25"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="dk-sm__bar dk-sm__bar--query" data-sm="fill" />
                </div>

                <div className="dk-sm__result dk-sm__result--top" data-sm="row">
                  <span className="dk-sm__bar dk-sm__bar--title" data-sm="fill" />
                  <span className="dk-sm__bar dk-sm__bar--l1" data-sm="fill" />
                  <span className="dk-sm__bar dk-sm__bar--l2" data-sm="fill" />
                  <svg className="dk-sm__trend" viewBox="0 0 56 40" fill="none">
                    <path
                      data-sm="trend"
                      pathLength={1}
                      d="M1 38 14 19 25 28 52 4M36 3h16v16"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="dk-sm__no" data-sm="badge">
                    1
                  </span>
                </div>

                <div className="dk-sm__result dk-sm__result--two" data-sm="row">
                  <span className="dk-sm__bar dk-sm__bar--a" data-sm="fill" />
                  <span className="dk-sm__bar dk-sm__bar--b" data-sm="fill" />
                </div>
                <div className="dk-sm__result dk-sm__result--three" data-sm="row">
                  <span className="dk-sm__bar dk-sm__bar--c" data-sm="fill" />
                  <span className="dk-sm__bar dk-sm__bar--d" data-sm="fill" />
                </div>

                <span className="dk-sm__pill" data-sm="pill">
                  {mock.rank}
                </span>
              </div>
            </div>
          </div>

          <div className="dk-sm__layer" data-sm="card-float">
            <div className="dk-sm__enter" data-sm="card-enter">
              <div className="dk-sm__growth">
                <p className="dk-sm__g-label">{mock.metricLabel}</p>
                <p className="dk-sm__g-value">
                  <span data-sm="count" data-target={mock.metric}>
                    {`+${mock.metric}%`}
                  </span>
                </p>
                <p className="dk-sm__g-caption">{mock.metricCaption}</p>
                <span className="dk-sm__g-bar dk-sm__g-bar--1" data-sm="gbar" />
                <span className="dk-sm__g-bar dk-sm__g-bar--2" data-sm="gbar" />
                <span className="dk-sm__g-bar dk-sm__g-bar--3" data-sm="gbar" />
                <span className="dk-sm__g-bar dk-sm__g-bar--4" data-sm="gbar" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
