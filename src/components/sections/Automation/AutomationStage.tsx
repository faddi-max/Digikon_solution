import type { CSSProperties } from 'react'
import type { AutomationHeroData } from './automationHeroData'
import { SignalGlyph } from './AutomationIcons'
import { AutomationHeroScene, type RobotState } from './AutomationHeroScene'
import { SCENE_H, SCENE_W } from './sceneSize'

/** Size of the stage, and of one design pixel on it. Coordinates below are in these pixels. */
export const STAGE_W = 700
export const STAGE_H = 550

/** Where the middle of the robot canvas sits on the stage. */
const ROBOT_X = 363
const ROBOT_Y = 208

/** Card positions on the stage, and how far each drifts with the pointer (parallax depth). */
const SIGNAL_POS = [
  { left: 29, top: 66, depth: 14 },
  { left: 514, top: 103, depth: 22 },
  { left: 74, top: 371, depth: 30 },
] as const

/**
 * Below `sm` the stage is under 330px wide and the cards would be unreadable at design scale,
 * so they are drawn 1.75 times as large and moved clear of the robot and the label.
 */
const SIGNAL_SMALL = [
  'max-sm:[--sl:4] max-sm:[--st:10]',
  'max-sm:[--sl:426] max-sm:[--st:150]',
  'max-sm:[--sl:4] max-sm:[--st:356]',
] as const

type Props = {
  data: AutomationHeroData
  state: RobotState
  motion: boolean
}

/**
 * The right half of the hero: the robot, three status cards that tell the "request in, work
 * done" story, the orbit rings and signal lines that tie them together, and a small label.
 *
 * Everything is placed in design pixels on a 700 x 550 stage. The stage is one unit: on
 * desktop it sits at a fixed spot in the hero and scales with it, and below `lg` it becomes a
 * block under the copy and scales with its own width. It is all illustration, so it is hidden
 * from assistive technology and replaced by one text description.
 */
export function AutomationStage({ data, state, motion }: Props) {
  return (
    <div
      role="img"
      aria-label={data.illustrationLabel}
      data-ah="stage"
      className="@container relative w-full"
      style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 [--u:calc(100cqw/700)]"
        // The rings and the robot's light spill past the stage edge on purpose.
        style={{ overflow: 'visible' }}
      >
        {/* Orbit rings and signal lines. Drawn first so the robot and cards sit above them. */}
        <svg
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
          viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
          fill="none"
          focusable="false"
        >
          <defs>
            <linearGradient id="ah-line-a" gradientUnits="userSpaceOnUse" x1="452" y1="152" x2="549" y2="105">
              <stop offset="0" stopColor="#81d870" stopOpacity="0.9" />
              <stop offset="1" stopColor="#81d870" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id="ah-line-b" gradientUnits="userSpaceOnUse" x1="470" y1="290" x2="590" y2="345">
              <stop offset="0" stopColor="#81d870" stopOpacity="0.9" />
              <stop offset="1" stopColor="#81d870" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <g stroke="#81d870" strokeWidth="1" strokeOpacity="0.13">
            <ellipse
              data-ah="ring"
              cx="370"
              cy="202"
              rx="222"
              ry="104"
              transform="rotate(-4 370 202)"
              pathLength={1}
            />
            <ellipse
              data-ah="ring"
              cx="350"
              cy="160"
              rx="168"
              ry="120"
              transform="rotate(18 350 160)"
              pathLength={1}
            />
          </g>
          <line data-ah="signal-line" x1="452" y1="152" x2="549" y2="105" stroke="url(#ah-line-a)" strokeWidth="1.3" pathLength={1} />
          <line data-ah="signal-line" x1="470" y1="290" x2="590" y2="345" stroke="url(#ah-line-b)" strokeWidth="1.3" pathLength={1} />
        </svg>

        {/* The glow the robot hovers over. It breathes with the float. */}
        <div
          data-ah="pad"
          className="u-w-240 u-h-14 u-left-240 u-top-397 absolute rounded-full bg-green-500/20 blur-[calc(5*var(--u))]"
        />

        {/* The robot. */}
        <div
          className="absolute"
          // Placed so the figure's centre lands on ROBOT_X / ROBOT_Y.
          style={positionStyle(ROBOT_X - SCENE_W / 2, ROBOT_Y - SCENE_H / 2, SCENE_W, SCENE_H)}
        >
          <AutomationHeroScene state={state} motion={motion} className="size-full" />
        </div>

        {/* Status cards. Three nested layers so the pointer parallax, the idle float and the
            entrance never fight over one transform. */}
        {data.signals.map((signal, i) => {
          const pos = SIGNAL_POS[i]
          return (
            <div
              key={signal.id}
              className={`absolute origin-top-left max-sm:scale-[1.75] ${SIGNAL_SMALL[i]}`}
              style={
                {
                  '--dl': pos.left,
                  '--dt': pos.top,
                  left: `calc(var(--sl, var(--dl)) * var(--u))`,
                  top: `calc(var(--st, var(--dt)) * var(--u))`,
                } as CSSProperties
              }
            >
            <div data-ah="depth" data-depth={pos.depth}>
              <div data-ah="float">
                <div
                  data-ah="signal"
                  className="u-w-158 u-h-58 u-rounded-16 relative bg-[#eef3ed] shadow-[0_calc(12*var(--u))_calc(26*var(--u))_rgb(0_0_0/0.3)]"
                >
                  <span className="u-left-14 u-top-14 u-size-30 u-rounded-9 absolute flex items-center justify-center bg-[#ddf4d5]">
                    <SignalGlyph icon={signal.icon} />
                  </span>
                  <span className="u-left-54 u-top-16 u-text-[10.4] u-leading-14 absolute font-semibold whitespace-nowrap text-teal-900">
                    {signal.title}
                  </span>
                  <span className="u-left-54 u-top-31 u-text-[8.1] u-leading-12 absolute font-medium whitespace-nowrap text-ink-muted">
                    {signal.caption}
                  </span>
                  <span className="u-size-6 absolute top-[calc(11*var(--u))] right-[calc(11*var(--u))] rounded-full bg-green-500" />
                </div>
              </div>
            </div>
            </div>
          )
        })}

        {/* Label under the robot. */}
        <div
          data-ah="core"
          className="u-left-260.5 u-top-488 absolute flex items-center u-gap-12"
        >
          <span className="u-size-6 rounded-full bg-green-500 shadow-[0_0_calc(8*var(--u))_rgb(129_216_112/0.7)]" />
          <span className="block">
            <span className="u-text-[8.2] u-leading-10 block font-bold tracking-[0.07em] text-[#a0b4a5] uppercase">
              {data.core.title}
            </span>
            <span className="u-text-[8.2] u-leading-12 u-mt-3 block font-medium text-[#546a62]">
              {data.core.caption}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

function positionStyle(left: number, top: number, width: number, height: number) {
  return {
    left: `calc(${left} * var(--u))`,
    top: `calc(${top} * var(--u))`,
    width: `calc(${width} * var(--u))`,
    height: `calc(${height} * var(--u))`,
  }
}
