import { useMemo, useRef, type CSSProperties, type ElementType } from 'react'

import {
  gsap,
  prefersReducedMotion,
  ScrollTrigger,
  useGSAP,
} from '@/lib/motion'

type ScrollRevealTextProps = {
  text: string
  as?: ElementType
  /** Animate per character or per word. Accent colours work in word mode. */
  split?: 'chars' | 'words'
  /**
   * 'play': runs each time the element enters view, at a fixed pace.
   * 'scrub': ties the reveal to scroll position.
   */
  mode?: 'play' | 'scrub'
  /** Words to show in the accent colour, matched exactly. */
  accent?: string[]
  /** Seconds between each unit's start. Units overlap, which creates the wave. */
  stagger?: number
  /** Seconds per unit. Defaults to 1.4 in play mode and 0.8 in scrub mode. */
  duration?: number
  /** Scrub only: seconds of lag that smooth out fast or trackpad scrolling. */
  smoothing?: number
  /** Opacity the units start at. 0 is fully hidden. */
  startOpacity?: number
  /** Vertical travel in px. Positive rises from below. */
  yOffset?: number
  /** Horizontal travel in px. */
  xOffset?: number
  /** Starting blur in px. Costly, so it's off by default. */
  blur?: number
  /** Animate colour from hiddenColor to revealedColor. Off by default for smoothness. */
  colorShift?: boolean
  hiddenColor?: string
  revealedColor?: string
  /** When the reveal begins, as a ScrollTrigger start position. */
  start?: string
  /** Scrub only: when the reveal completes. */
  end?: string
  className?: string
  style?: CSSProperties
}

export function ScrollRevealText({
  text,
  as: Tag = 'p',
  split = 'words',
  mode = 'play',
  accent = [],
  stagger = 0.12,
  duration,
  smoothing = 1.5,
  startOpacity = 0,
  yOffset = 24,
  xOffset = 0,
  blur = 0,
  colorShift = false,
  hiddenColor = '#9ca3af',
  revealedColor = '#111827',
  start = 'top 85%',
  end = 'top 40%',
  className,
  style,
}: ScrollRevealTextProps) {
  const root = useRef<HTMLElement>(null)
  const accentKey = accent.join('|')
  const unitDuration = duration ?? (mode === 'play' ? 1.4 : 0.8)

  const tokens = useMemo(() => text.split(/(\s+)/), [text])

  useGSAP(
    () => {
      if (prefersReducedMotion() || !root.current) return

      const units = gsap.utils.toArray<HTMLElement>(
        '.dk-srt__unit',
        root.current,
      )
      if (units.length === 0) return

      const from: gsap.TweenVars = {
        opacity: startOpacity,
        x: -xOffset,
        y: yOffset,
        force3D: true,
      }
      if (blur > 0) from.filter = `blur(${blur}px)`
      if (colorShift) from.color = hiddenColor

      const to: gsap.TweenVars = {
        opacity: 1,
        x: 0,
        y: 0,
        duration: unitDuration,
        stagger,
        ease: 'power2.out',
        force3D: true,
        onComplete: () => {
          // Release the compositing hint once the unit has settled.
          units.forEach((u) => (u.style.willChange = 'auto'))
        },
      }
      if (blur > 0) to.filter = 'blur(0px)'
      if (colorShift) to.color = revealedColor

      if (mode === 'play') {
        const timeline = gsap.timeline({ paused: true })
        timeline.fromTo(units, from, to)

        ScrollTrigger.create({
          trigger: root.current,
          start,
          onEnter: () => timeline.restart(),
          onEnterBack: () => timeline.restart(),
          onLeaveBack: () => timeline.pause(0),
        })
        return
      }

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start,
            end,
            scrub: smoothing > 0 ? smoothing : true,
          },
        })
        .fromTo(units, from, { ...to, onComplete: undefined })
    },
    {
      scope: root,
      dependencies: [
        text,
        split,
        mode,
        accentKey,
        stagger,
        unitDuration,
        smoothing,
        startOpacity,
        yOffset,
        xOffset,
        blur,
        colorShift,
        hiddenColor,
        revealedColor,
        start,
        end,
      ],
    },
  )

  const unitStyle: CSSProperties = {
    display: 'inline-block',
    willChange: 'transform, opacity',
  }

  return (
    <Tag
      ref={root}
      className={className}
      style={{ display: 'block', ...style }}
      aria-label={text}
    >
      {tokens.map((token, i) => {
        // Plain whitespace keeps lines breakable.
        if (/^\s+$/.test(token)) return token

        const isAccent = accent.includes(token)

        if (split === 'words') {
          return (
            <span key={i} style={{ whiteSpace: 'nowrap' }} aria-hidden="true">
              <span className="dk-srt__unit" style={unitStyle}>
                {isAccent ? (
                  <span className="dk-srt__accent">{token}</span>
                ) : (
                  token
                )}
              </span>
            </span>
          )
        }

        return (
          <span key={i} style={{ whiteSpace: 'nowrap' }} aria-hidden="true">
            {Array.from(token).map((ch, j) => (
              <span key={j} className="dk-srt__unit" style={unitStyle}>
                {ch}
              </span>
            ))}
          </span>
        )
      })}
    </Tag>
  )
}
