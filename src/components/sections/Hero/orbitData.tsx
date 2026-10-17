import aiIcon from '@/assets/images/AI.svg?url'
import automationIcon from '@/assets/images/Automation.svg?url'
import contentIcon from '@/assets/images/Content.svg?url'
import dataIcon from '@/assets/images/DATA.svg?url'
import seoIcon from '@/assets/images/Seo.svg'
import webIcon from '@/assets/images/Web.svg?url'

/** Cluster design width in CSS px. The stage scales everything from this. */
export const DESIGN_SIZE = 640

/** Disc box size from Figma (design px). */
export const DISC_W = 185.28529357910156
export const DISC_H = 192.30601501464844

/**
 * Orbit radius, centre to each outer disc. Tuned so the outer discs sit close
 * to the centre, as in the Figma frame. The centre disc is drawn on top.
 */
export const ORBIT_RADIUS = 192

/** Icon box size in design px. The SVG is scaled to fit this square. */
export const ICON_SIZE = 100

type Stops = Array<[number, string]>

export type OrbitNode = {
  id: string
  label: string
  /** True when the icon SVG already contains its own label. */
  hideLabel?: boolean
  gradientAngle: number
  stops: Stops
  /** CSS border-radius in design px. Clamped to the box, as CSS does. */
  radius: number
  ink: string
  iconSrc: string
  x: number
  y: number
  z: number
  w: number
  h: number
}

const INK_DARK = '#03171D'
const INK_LIGHT = '#F7F8F5'

const polar = (deg: number, radius: number) => {
  const r = (deg * Math.PI) / 180
  return { x: radius * Math.cos(r), y: radius * Math.sin(r) }
}

type Draft = Omit<OrbitNode, 'x' | 'y' | 'z' | 'w' | 'h'> & { angle: number }

/*
 * Angles: 0° = 3 o'clock, counter-clockwise (three.js y-up).
 * Start positions match the Figma frame:
 *   SEO (top-left), WEB (top-right), AI (left), DATA (right),
 *   CONTENT (bottom-left), AUTOMATION (bottom-right).
 */
const DRAFT_NODES: Draft[] = [
  {
    id: 'seo',
    label: 'SEO',
    gradientAngle: 135,
    stops: [
      [0, '#80D873'],
      [0.52, '#67BD5D'],
      [1, '#3C9145'],
    ],
    radius: 165.13,
    ink: INK_DARK,
    iconSrc: seoIcon,
    angle: 120,
  },
  {
    id: 'web',
    label: 'WEB',
    gradientAngle: 145,
    stops: [
      [0.0617, '#203438'],
      [0.763, '#061A1E'],
    ],
    radius: 165.13,
    ink: INK_LIGHT,
    iconSrc: webIcon,
    angle: 60,
  },
  {
    id: 'data',
    label: 'DATA',
    gradientAngle: 135,
    stops: [
      [0, '#B5EFAA'],
      [1, '#8BDB7F'],
    ],
    radius: 165.13,
    ink: INK_DARK,
    iconSrc: dataIcon,
    angle: 0,
  },
  {
    id: 'automation',
    label: 'AUTOMATION',
    hideLabel: true,
    gradientAngle: 145,
    stops: [
      [0.0617, '#2D773E'],
      [0.8681, '#0D2927'],
    ],
    radius: 107.88,
    ink: INK_LIGHT,
    iconSrc: automationIcon,
    angle: -60,
  },
  {
    id: 'content',
    label: 'CONTENT',
    gradientAngle: 145,
    stops: [
      [0.0617, '#F4FFF2'],
      [0.9383, '#C9EFC2'],
    ],
    radius: 165.13,
    ink: INK_DARK,
    iconSrc: contentIcon,
    angle: -120,
  },
  {
    id: 'ai',
    label: 'AI',
    gradientAngle: 140,
    stops: [
      [0.0738, '#061B20'],
      [0.5463, '#102E2B'],
      [0.9633, '#1C5135'],
    ],
    radius: 165.13,
    ink: INK_LIGHT,
    iconSrc: aiIcon,
    angle: 180,
  },
]

/** Centre disc. Drawn in front of the orbit. The DK mark is rendered in OrbitStage. */
export const CENTER_NODE = {
  gradientAngle: 135,
  stops: [
    [0, '#14292D'],
    [1, '#061A1E'],
  ] as Stops,
  radius: 165.13,
  z: 40,
  w: DISC_W,
  h: DISC_H,
}

export const ORBIT_NODES: OrbitNode[] = DRAFT_NODES.map(({ angle, ...node }) => ({
  ...node,
  ...polar(angle, ORBIT_RADIUS),
  z: 0,
  w: DISC_W,
  h: DISC_H,
}))