import { SCENE_H, SCENE_W } from './sceneSize'

/**
 * Flat version of the robot, drawn at the same size and place as the 3D one. It is what shows
 * when WebGL is missing, fails to start or loses its context, so the hero never has a hole in it.
 * The coordinates are the model's (origin at the middle of the figure, +Y up) with Y flipped.
 */
export function RobotFallback() {
  const cx = SCENE_W / 2
  const cy = SCENE_H / 2
  return (
    <svg
      className="size-full"
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="rf-shell" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2f8ef" />
          <stop offset="0.55" stopColor="#d4e6d2" />
          <stop offset="1" stopColor="#9fbfa5" />
        </linearGradient>
        <linearGradient id="rf-limb" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c4dac7" />
          <stop offset="1" stopColor="#8fb298" />
        </linearGradient>
        <radialGradient id="rf-glow">
          <stop offset="0" stopColor="#96f082" stopOpacity="0.85" />
          <stop offset="1" stopColor="#81d870" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={`translate(${cx} ${cy})`}>
        {/* legs */}
        <rect x="-42.6" y="112" width="34" height="38" rx="17" fill="url(#rf-limb)" />
        <rect x="12.1" y="112" width="34" height="38" rx="17" fill="url(#rf-limb)" />
        {/* arms */}
        <g transform="translate(-63.5 20.6) rotate(8)">
          <rect x="-13.5" y="0" width="27" height="88" rx="13.5" fill="url(#rf-limb)" />
          <rect x="-14.8" y="29" width="29.6" height="13" fill="#4d7a5c" />
          <circle cx="0" cy="84" r="13.75" fill="#b7d1bb" />
        </g>
        <g transform="translate(69 21.9) rotate(-25)">
          <rect x="-13.5" y="0" width="27" height="62" rx="13.5" fill="url(#rf-limb)" />
          <rect x="-14.8" y="30" width="29.6" height="13" fill="#4d7a5c" />
          <circle cx="0" cy="58" r="15.5" fill="#b7d1bb" />
        </g>
        {/* torso */}
        <rect x="-61.3" y="-3" width="123.75" height="126" rx="27.5" fill="url(#rf-shell)" />
        <path
          d="M-5.8 -8.1h9M-1.35 -12.6v9M-5 -11.8l7.3 7.3M2.3 -11.8l-7.3 7.3"
          stroke="#0e2a2a"
          strokeWidth="1.3"
          strokeLinecap="round"
          transform="translate(0 0)"
        />
        <rect x="-16.9" y="102" width="30.75" height="4.25" rx="2.1" fill="#8be07a" />
        {/* head */}
        <rect x="-72.9" y="-120.5" width="148.5" height="116" rx="32" fill="url(#rf-shell)" />
        <rect x="-61.3" y="-101" width="122" height="79" rx="20" fill="#05201b" />
        <rect x="-96.5" y="-81.9" width="17.5" height="37.5" rx="8" fill="#9fbfa5" />
        <rect x="68.5" y="-81.9" width="17.5" height="37.5" rx="8" fill="#6f9a7d" />
        <circle cx="-20.5" cy="-63.5" r="20" fill="url(#rf-glow)" />
        <circle cx="21.5" cy="-63.5" r="20" fill="url(#rf-glow)" />
        <ellipse cx="-20.5" cy="-63.5" rx="6.9" ry="8.75" fill="#8be07a" />
        <ellipse cx="21.5" cy="-63.5" rx="6.9" ry="8.75" fill="#8be07a" />
        <path
          d="M-13.5 -50.5q11.5 6.5 23 0"
          stroke="#8be07a"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* antenna */}
        <rect x="-3.6" y="-148" width="2.2" height="22" fill="#a9c6ad" />
        <circle cx="-2.5" cy="-143" r="17" fill="url(#rf-glow)" />
        <circle cx="-2.5" cy="-143" r="5.5" fill="#8be07a" />
      </g>
    </svg>
  )
}
