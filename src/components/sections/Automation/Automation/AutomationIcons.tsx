import type { OutcomeIcon, SignalIcon } from './automationHeroData'

/** Small decorative icons for the Automation hero. All are aria-hidden: the text beside them says it. */

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function ArrowDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4v16M6 14l6 6 6-6" />
    </svg>
  )
}

/** Icon inside a status card tile. Drawn on a 16px grid. */
export function SignalGlyph({ icon }: { icon: SignalIcon }) {
  if (icon === 'mail') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1.5" y="3" width="13" height="10" rx="1.6" fill="#d9dcd8" />
        <path
          d="m2.4 4.4 5.6 4.3 5.6-4.3"
          stroke="#eef3ed"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (icon === 'table') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect
          x="2.5"
          y="2.5"
          width="11"
          height="11"
          rx="1.6"
          fill="#b9d3b3"
          stroke="#5f8a5c"
          strokeWidth="1.2"
        />
        <path d="M2.5 6h11M2.5 9.4h11" stroke="#5f8a5c" strokeWidth="1.1" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="m3.2 8.6 3 3.1 6.6-7.2"
        stroke="#2f6a3a"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Icon at the top of an outcome cell. Each is drawn to fit a 28px box. */
export function OutcomeGlyph({ icon }: { icon: OutcomeIcon }) {
  if (icon === 'forward') {
    // A chunky "forward" arrow: it fills the 28px box, as in the design.
    return (
      <svg
        width="28"
        height="28"
        viewBox="3 4.5 18 16"
        preserveAspectRatio="none"
        fill="#03171d"
        aria-hidden="true"
      >
        <path d="M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11Z" />
      </svg>
    )
  }
  if (icon === 'ring') {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="10.2" stroke="#03171d" strokeWidth="2.2" />
        <circle cx="14" cy="14" r="5.2" stroke="#03171d" strokeWidth="2.2" />
      </svg>
    )
  }
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="m5.6 13.4 8.2 1.7-1.2 3.6 9.6-2.4-8.3-1.5 1.1-3.3-9.4 1.9Z"
        fill="#03171d"
        stroke="#03171d"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
