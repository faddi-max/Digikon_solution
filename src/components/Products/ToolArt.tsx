import type { ReactNode } from 'react'

import type { ToolKind } from './productsData'

/**
 * Brand-coloured interface illustrations, one per tool. They are shapes only:
 * no numbers or labels, so nothing here reads as a real metric or client result.
 * Drop a screenshot named after the tool's `art` key into src/assets/images/products/
 * and it replaces the illustration automatically.
 */

const PANEL = '#0b2a2f'
const TILE = '#123a3b'
const EDGE = 'rgba(247, 248, 245, 0.16)'
const SOFT = 'rgba(247, 248, 245, 0.22)'
const GREEN = '#81d870'
const GREEN_SOFT = '#b2ee9e'
const INK = '#03171d'

/** Where the green glow sits on each card, so neighbouring cards don't look cloned. */
const GLOW: Record<ToolKind, [number, number]> = {
  analytics: [0.8, 0.12],
  automation: [0.2, 0.18],
  seo: [0.75, 0.3],
  portal: [0.25, 0.1],
  content: [0.7, 0.15],
  performance: [0.5, 0.05],
}

function Window({ children }: { children: ReactNode }) {
  return (
    <g transform="translate(14 22)">
      <rect width="172" height="156" rx="10" fill={PANEL} stroke={EDGE} />
      <circle cx="12" cy="11" r="2.2" fill={GREEN} />
      <circle cx="20" cy="11" r="2.2" fill={SOFT} />
      <circle cx="28" cy="11" r="2.2" fill={SOFT} />
      <path d="M0 22H172" stroke={EDGE} />
      {children}
    </g>
  )
}

function Analytics() {
  const bars = [24, 36, 30, 50, 42, 62, 54]
  return (
    <Window>
      <rect x="12" y="30" width="46" height="30" rx="6" fill={GREEN} />
      <rect x="19" y="38" width="20" height="4" rx="2" fill={INK} opacity="0.55" />
      <rect x="19" y="47" width="30" height="6" rx="3" fill={INK} />
      <rect x="63" y="30" width="46" height="30" rx="6" fill={TILE} />
      <rect x="70" y="38" width="20" height="4" rx="2" fill={SOFT} />
      <rect x="70" y="47" width="28" height="6" rx="3" fill={GREEN_SOFT} />
      <rect x="114" y="30" width="46" height="30" rx="6" fill={TILE} />
      <rect x="121" y="38" width="20" height="4" rx="2" fill={SOFT} />
      <rect x="121" y="47" width="24" height="6" rx="3" fill={GREEN_SOFT} />
      {bars.map((h, i) => (
        <rect
          key={i}
          x={14 + i * 21.5}
          y={140 - h}
          width="13"
          height={h}
          rx="3"
          fill={i % 2 ? GREEN_SOFT : GREEN}
          opacity={0.9}
        />
      ))}
      <polyline
        points="20,104 41,96 63,101 85,82 106,87 128,68 150,72"
        fill="none"
        stroke="#f7f8f5"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="128" cy="68" r="3.2" fill="#f7f8f5" />
    </Window>
  )
}

function Automation() {
  return (
    <Window>
      <path
        d="M38 54V70H86V84M134 54V70H86"
        fill="none"
        stroke={GREEN}
        strokeWidth="1.4"
        strokeDasharray="3 3"
      />
      <path d="M86 110V122" fill="none" stroke={GREEN} strokeWidth="1.4" strokeDasharray="3 3" />
      <rect x="12" y="32" width="52" height="22" rx="6" fill={TILE} stroke={EDGE} />
      <circle cx="24" cy="43" r="4" fill={GREEN} />
      <rect x="32" y="40" width="24" height="6" rx="3" fill={SOFT} />
      <rect x="108" y="32" width="52" height="22" rx="6" fill={TILE} stroke={EDGE} />
      <circle cx="120" cy="43" r="4" fill={GREEN_SOFT} />
      <rect x="128" y="40" width="24" height="6" rx="3" fill={SOFT} />
      <rect x="58" y="84" width="56" height="26" rx="7" fill={GREEN} />
      <path d="M88 89 80 99h5l-2 8 9-11h-5l1-7z" fill={INK} />
      <rect x="58" y="122" width="56" height="22" rx="6" fill={TILE} stroke={EDGE} />
      <path
        d="M76 133l4 4 8-8"
        fill="none"
        stroke={GREEN}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Window>
  )
}

function Seo() {
  const rows = [
    { y: 56, hi: true, w: 58 },
    { y: 80, hi: false, w: 46 },
    { y: 104, hi: false, w: 66 },
  ]
  return (
    <Window>
      <rect x="12" y="30" width="148" height="20" rx="10" fill={TILE} />
      <circle cx="25" cy="40" r="4.5" fill="none" stroke={SOFT} strokeWidth="1.5" />
      <path d="M28.5 43.5 32 47" stroke={SOFT} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="40" y="37" width="50" height="6" rx="3" fill={SOFT} />
      {rows.map((r) => (
        <g key={r.y}>
          <rect
            x="12"
            y={r.y}
            width="148"
            height="20"
            rx="6"
            fill={r.hi ? 'rgba(129,216,112,0.14)' : TILE}
            stroke={r.hi ? GREEN : 'none'}
          />
          <rect x="17" y={r.y + 4} width="22" height="12" rx="6" fill={r.hi ? GREEN : GREEN_SOFT} opacity={r.hi ? 1 : 0.55} />
          <rect x="46" y={r.y + 7} width={r.w} height="6" rx="3" fill={SOFT} />
          <rect x="122" y={r.y + 7} width="32" height="6" rx="3" fill={GREEN} opacity={r.hi ? 0.9 : 0.35} />
        </g>
      ))}
      <polyline
        points="12,148 44,142 76,145 108,134 140,128 160,122"
        fill="none"
        stroke={GREEN_SOFT}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0 -4)"
      />
    </Window>
  )
}

function Portal() {
  const rows = [
    { y: 74, p: 0.8 },
    { y: 98, p: 0.5 },
    { y: 122, p: 0.28 },
  ]
  return (
    <Window>
      <rect x="8" y="30" width="38" height="118" rx="7" fill={TILE} />
      <circle cx="27" cy="46" r="7" fill={GREEN} />
      {[68, 82, 96].map((y) => (
        <rect key={y} x="15" y={y} width="24" height="5" rx="2.5" fill={SOFT} />
      ))}
      <rect x="56" y="32" width="58" height="8" rx="4" fill={SOFT} />
      <rect x="56" y="46" width="40" height="5" rx="2.5" fill={EDGE} />
      <circle cx="140" cy="46" r="16" fill="none" stroke="#1b4a44" strokeWidth="6" />
      <circle
        cx="140"
        cy="46"
        r="16"
        fill="none"
        stroke={GREEN}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="70 100"
        transform="rotate(-90 140 46)"
      />
      {rows.map((r) => (
        <g key={r.y}>
          <rect x="56" y={r.y} width="104" height="18" rx="6" fill={TILE} />
          <rect x="62" y={r.y + 5} width="38" height="4" rx="2" fill={SOFT} />
          <rect x="62" y={r.y + 12} width="92" height="3" rx="1.5" fill={EDGE} />
          <rect x="62" y={r.y + 12} width={92 * r.p} height="3" rx="1.5" fill={GREEN} />
        </g>
      ))}
    </Window>
  )
}

function Content() {
  return (
    <g transform="translate(14 22)">
      <rect x="40" y="38" width="118" height="116" rx="9" fill={TILE} stroke={EDGE} />
      <rect x="16" y="0" width="112" height="146" rx="9" fill="#eef3ec" />
      <rect x="28" y="14" width="64" height="10" rx="4" fill={INK} />
      <rect x="28" y="32" width="88" height="4" rx="2" fill="#b9c8bf" />
      <rect x="28" y="42" width="78" height="4" rx="2" fill="#b9c8bf" />
      <rect x="28" y="56" width="88" height="42" rx="6" fill="#c8eebf" />
      <path d="M28 98 52 74l14 14 14-20 36 30z" fill={GREEN} />
      <circle cx="100" cy="66" r="5" fill="#f7f8f5" />
      <rect x="28" y="108" width="88" height="4" rx="2" fill="#b9c8bf" />
      <rect x="28" y="118" width="60" height="4" rx="2" fill="#b9c8bf" />
      <rect x="116" y="52" width="36" height="14" rx="7" fill={GREEN} />
      <rect x="123" y="57" width="22" height="4" rx="2" fill={INK} />
      <rect x="116" y="76" width="36" height="5" rx="2.5" fill={SOFT} />
      <rect x="116" y="88" width="26" height="5" rx="2.5" fill={EDGE} />
      <rect x="116" y="100" width="32" height="5" rx="2.5" fill={EDGE} />
    </g>
  )
}

function Performance() {
  return (
    <Window>
      <path
        d="M36 116A50 50 0 0 1 136 116"
        fill="none"
        stroke="#1b4a44"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M36 116A50 50 0 0 1 136 116"
        fill="none"
        stroke={GREEN}
        strokeWidth="10"
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray="68 100"
      />
      <circle cx="86" cy="116" r="4" fill="#f7f8f5" />
      <path d="M86 116 108 82" stroke="#f7f8f5" strokeWidth="2" strokeLinecap="round" />
      <rect x="12" y="128" width="46" height="18" rx="5" fill={TILE} />
      <rect x="63" y="128" width="46" height="18" rx="5" fill={TILE} />
      <rect x="114" y="128" width="46" height="18" rx="5" fill={TILE} />
      <rect x="18" y="135" width="20" height="4" rx="2" fill={GREEN_SOFT} />
      <rect x="69" y="135" width="24" height="4" rx="2" fill={GREEN_SOFT} />
      <rect x="120" y="135" width="16" height="4" rx="2" fill={GREEN_SOFT} />
      <polyline
        points="12,64 32,56 52,60 72,46 92,50 112,38 132,44 160,32"
        fill="none"
        stroke={GREEN_SOFT}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0 -2)"
      />
    </Window>
  )
}

const ART: Record<ToolKind, () => ReactNode> = {
  analytics: Analytics,
  automation: Automation,
  seo: Seo,
  portal: Portal,
  content: Content,
  performance: Performance,
}

export function ToolArt({ kind }: { kind: ToolKind }) {
  const id = `dk-pa-${kind}`
  const [cx, cy] = GLOW[kind]
  const Art = ART[kind]

  return (
    <svg
      className="dk-prod__svg"
      viewBox="0 0 200 280"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#17403d" />
          <stop offset="1" stopColor="#04191f" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx={cx} cy={cy} r="0.75">
          <stop offset="0" stopColor={GREEN} stopOpacity="0.4" />
          <stop offset="1" stopColor={GREEN} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="280" fill={`url(#${id}-bg)`} />
      <rect width="200" height="280" fill={`url(#${id}-glow)`} />
      <Art />
    </svg>
  )
}
