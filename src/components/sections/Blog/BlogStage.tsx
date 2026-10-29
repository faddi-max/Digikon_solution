// @ts-nocheck
import { useId, type CSSProperties, type ReactNode } from 'react'

import { BlogOrbitScene, STAGE_H, STAGE_W, type BlogSceneState } from './BlogOrbitScene'

const G = '#81d870'
const GS = '#b2ee9e'
const PANEL = '#1b5a45'
const GREY = '#7f9795'

const at = (x: number, y: number, w: number, h: number): CSSProperties => ({
  left: `calc(${x} * var(--u))`,
  top: `calc(${y} * var(--u))`,
  width: `calc(${w} * var(--u))`,
  height: `calc(${h} * var(--u))`,
})

function Photo({ x, y, w, h, dot = true }: { x: number; y: number; w: number; h: number; dot?: boolean }) {
  const id = useId()
  return (
    <g>
      <clipPath id={id}>
        <rect x={x} y={y} width={w} height={h} rx="7" />
      </clipPath>
      <rect x={x} y={y} width={w} height={h} rx="7" fill={PANEL} />
      <g clipPath={`url(#${id})`}>
        <polygon
          points={`${x},${y + h} ${x + w * 0.32},${y + h * 0.38} ${x + w * 0.52},${y + h * 0.66} ${x + w * 0.74},${y + h * 0.42} ${x + w},${y + h * 0.7} ${x + w},${y + h}`}
          fill="#2f8f5f"
        />
        <polygon
          points={`${x},${y + h} ${x + w * 0.4},${y + h * 0.62} ${x + w * 0.6},${y + h * 0.82} ${x + w},${y + h * 0.58} ${x + w},${y + h}`}
          fill="#256f4c"
        />
      </g>
      {dot && <circle cx={x + w * 0.78} cy={y + h * 0.28} r={Math.max(4, w * 0.055)} fill={G} />}
    </g>
  )
}

const bar = (x: number, y: number, w: number, c = GREY, h = 5) => (
  <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx={h / 2} fill={c} opacity={c === GREY ? 0.6 : 1} />
)

type CardDef = {
  id: string
  x: number
  y: number
  w: number
  h: number
  rot: number
  depth: number
  art: ReactNode
}

/** Everything is placed in stage design px (a 560 x 340 box). */
const CARDS: readonly CardDef[] = [
  {
    id: 'main',
    x: 158, y: 41, w: 295, h: 177, rot: 0, depth: 8,
    art: (
      <>
        <circle cx="14" cy="13" r="3" fill={G} />
        <circle cx="24" cy="13" r="3" fill={GREY} />
        <circle cx="34" cy="13" r="3" fill={GREY} />
        <rect x="50" y="7" width="190" height="12" rx="6" fill="#fff" opacity=".09" />
        <circle cx="270" cy="13" r="5" fill="none" stroke="#cfe0dc" strokeWidth="1.4" />
        <Photo x={12} y={32} w={128} h={86} />
        {bar(154, 40, 112, G, 8)}
        {bar(154, 58, 126, '#c6d3d0', 5)}
        {bar(154, 70, 126)}
        {bar(154, 82, 100)}
        <circle cx="160" cy="132" r="5" fill="#9bb0ae" />
        {bar(172, 129, 90)}
        {bar(172, 139, 64)}
      </>
    ),
  },
  {
    id: 'note',
    x: 38, y: 71, w: 92, h: 85, rot: -4, depth: 18,
    art: (
      <>
        <rect x="26" y="16" width="34" height="44" rx="7" fill="none" stroke={G} strokeWidth="2.2" />
        {bar(33, 28, 20, '#c6d3d0', 3)}
        {bar(33, 37, 20, '#c6d3d0', 3)}
        {bar(33, 46, 12, '#c6d3d0', 3)}
        <path d="M52 52l16-18 5 4-16 18-7 3z" fill="#0b2a2d" stroke={G} strokeWidth="2" strokeLinejoin="round" />
      </>
    ),
  },
  {
    id: 'photo',
    x: 45, y: 171, w: 110, h: 134, rot: -4, depth: 22,
    art: (
      <>
        <Photo x={10} y={12} w={90} h={54} />
        {bar(10, 78, 58, G, 7)}
        {bar(10, 94, 90)}
        {bar(10, 105, 70)}
        {bar(10, 116, 80)}
      </>
    ),
  },
  {
    id: 'list',
    x: 162, y: 178, w: 72, h: 68, rot: 0, depth: 14,
    art: (
      <>
        <rect x="19" y="12" width="34" height="24" rx="5" fill="#1f6a50" />
        {bar(25, 19, 22, '#c6d3d0', 3)}
        {bar(25, 26, 14, '#c6d3d0', 3)}
        {bar(10, 46, 52)}
        {bar(10, 56, 38)}
      </>
    ),
  },
  {
    id: 'bars',
    x: 240, y: 190, w: 70, h: 68, rot: 0, depth: 16,
    art: (
      <>
        {[18, 28, 24, 40].map((hh, i) => (
          <rect key={i} x={12 + i * 13} y={46 - hh} width="9" height={hh} rx="2" fill={i === 3 ? G : '#3f9b62'} />
        ))}
        {bar(12, 54, 46)}
      </>
    ),
  },
  {
    id: 'donut',
    x: 318, y: 196, w: 84, h: 68, rot: 0, depth: 12,
    art: (
      <>
        <circle cx="42" cy="28" r="15" fill="none" stroke="#2a5a55" strokeWidth="7" />
        <circle
          cx="42" cy="28" r="15" fill="none" stroke={G} strokeWidth="7" strokeLinecap="round"
          strokeDasharray="62 100" transform="rotate(-90 42 28)"
        />
        {bar(16, 54, 52)}
      </>
    ),
  },
  {
    id: 'save',
    x: 392, y: 177, w: 118, h: 132, rot: 6, depth: 20,
    art: (
      <>
        <Photo x={10} y={12} w={98} h={62} dot={false} />
        <path d="M82 18h14v22l-7-5-7 5z" fill={G} />
        {bar(10, 86, 62, G, 7)}
        {bar(10, 102, 98)}
        {bar(10, 113, 76)}
      </>
    ),
  },
  {
    id: 'chat',
    x: 459, y: 136, w: 81, h: 61, rot: 8, depth: 26,
    art: (
      <>
        <rect x="14" y="12" width="53" height="30" rx="8" fill="#0b2a2d" stroke={G} strokeWidth="1.6" />
        {bar(23, 20, 34, G, 4)}
        {bar(23, 29, 24, G, 4)}
        <path d="M24 42l-2 9 9-7z" fill="#0b2a2d" stroke={G} strokeWidth="1.6" strokeLinejoin="round" />
      </>
    ),
  },
]

type Props = { state: BlogSceneState; motion: boolean; label: string }

/**
 * Right half of the blog hero: a dashboard of cards over a green Three.js orbit. All of it is
 * illustration with no text, so it is one labelled image for assistive technology. Each card
 * has three layers (depth, float, card) so pointer parallax, idle float and entrance never
 * fight over one transform.
 */
export function BlogStage({ state, motion, label }: Props) {
  return (
    <div
      role="img"
      aria-label={label}
      data-bh="stage"
      className="@container relative w-full"
      style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }}
    >
      <div aria-hidden="true" className="absolute inset-0 [--u:calc(100cqw/560)]">
        <BlogOrbitScene state={state} motion={motion} />

        {/* Green sparks, top left of the window. */}
        <svg
          data-bh="spark"
          className="absolute overflow-visible"
          style={at(66, 2, 50, 36)}
          viewBox="0 0 50 36"
          fill="none"
        >
          <path d="M6 28l9-14M34 14l4 18" stroke={G} strokeWidth="3" strokeLinecap="round" />
        </svg>

        {CARDS.map((c) => (
          <div key={c.id} className="absolute" style={at(c.x, c.y, c.w, c.h)}>
            <div data-bh="depth" data-depth={c.depth} className="size-full">
              <div data-bh="float" className="size-full">
                <div
                  data-bh="card"
                  className="relative size-full rounded-[calc(12*var(--u))] border border-green-500/30 bg-[linear-gradient(150deg,#0f3b3c,#072428)] shadow-[0_calc(10*var(--u))_calc(24*var(--u))_rgb(0_0_0/0.4)]"
                  style={{ rotate: `${c.rot}deg` }}
                >
                  <svg viewBox={`0 0 ${c.w} ${c.h}`} className="size-full" fill="none">
                    {c.art}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
