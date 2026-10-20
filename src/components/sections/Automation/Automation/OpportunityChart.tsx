/**
 * The rising chart behind the Opportunity section: a glowing line, the area under it, and
 * four markers with dashed drop lines. It is drawn here, not shipped as an image, so it stays
 * sharp at any width and can be drawn in as the section scrolls into view.
 *
 * Coordinates are in a 1920 x 659 box that is anchored to the bottom and cropped (not
 * stretched) when the section is narrower or taller, so the circles stay round.
 */

export const CHART_W = 1920
export const CHART_H = 659
/** The curve is drawn on a 640px-high grid; it is dropped by the difference to sit on the floor. */
const DROP = CHART_H - 640

const POINTS: ReadonlyArray<readonly [number, number]> = [
  [-40, 600],
  [44, 576],
  [200, 541],
  [380, 506],
  [580, 444],
  [760, 458],
  [940, 428],
  [1124, 372],
  [1300, 338],
  [1480, 282],
  [1620, 226],
  [1800, 128],
  [1960, -20],
]

/** The markers sit on the line, with a drop line down to the floor of the chart. */
const MARKERS = [
  [44, 576],
  [580, 444],
  [1124, 372],
  [1800, 128],
] as const

/** A smooth curve through the points (Catmull-Rom converted to cubic Béziers). */
function smooth(points: ReadonlyArray<readonly [number, number]>) {
  let d = `M${points[0][0]} ${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0]} ${p2[1]}`
  }
  return d
}

const LINE = smooth(POINTS)
const FLOOR = 640
const AREA = `${LINE} L${POINTS[POINTS.length - 1][0]} ${FLOOR} L${POINTS[0][0]} ${FLOOR} Z`

export function OpportunityChart({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      preserveAspectRatio="xMidYMax slice"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="op-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#81d870" stopOpacity="0.14" />
          <stop offset="1" stopColor="#81d870" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="op-drop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#81d870" stopOpacity="0.55" />
          <stop offset="1" stopColor="#81d870" stopOpacity="0" />
        </linearGradient>
        <filter id="op-blur" x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      <g transform={`translate(0 ${DROP})`}>
      <path data-op="area" d={AREA} fill="url(#op-area)" />

      {MARKERS.map(([x, y]) => (
        <line
          key={x}
          data-op="drop"
          x1={x}
          x2={x}
          y1={y}
          y2={FLOOR}
          stroke="url(#op-drop)"
          strokeWidth="1.4"
          strokeDasharray="3 6"
        />
      ))}

      {/* The glow, then the line itself. */}
      <path
        data-op="glow"
        d={LINE}
        stroke="#81d870"
        strokeOpacity="0.22"
        strokeWidth="14"
        strokeLinecap="round"
        filter="url(#op-blur)"
        pathLength={1}
      />
      <path
        data-op="line"
        d={LINE}
        stroke="#9be08c"
        strokeOpacity="0.42"
        strokeWidth="2.4"
        strokeLinecap="round"
        pathLength={1}
      />

      {MARKERS.map(([x, y]) => (
        // Each marker is drawn around (0, 0) and moved into place, so scaling it in
        // place needs no transform-origin.
        <g key={x} transform={`translate(${x} ${y})`}>
          <g data-op="marker">
            <circle r="17" fill="#81d870" fillOpacity="0.14" />
            <circle r="8" fill="#fff" stroke="#81d870" strokeWidth="2.4" />
          </g>
        </g>
      ))}
      </g>
    </svg>
  )
}
