/**
 * Geometry shared by the Three.js chart layer and its static fallback image, so
 * both sit in exactly the same place.
 */

/** Width over height of the chart artwork (testimonials-chart.png, 2164 x 727). */
export const CHART_ASPECT = 2164 / 727

/**
 * Centres of the eight glowing nodes, measured from the artwork itself.
 * u runs left to right and v runs top to bottom, both as fractions of the image.
 */
export const CHART_NODES: ReadonlyArray<readonly [number, number]> = [
  [0.0366, 0.891],
  [0.2142, 0.6588],
  [0.3103, 0.6933],
  [0.5158, 0.5007],
  [0.587, 0.5842],
  [0.7639, 0.4719],
  [0.9334, 0.213],
  [0.9892, 0.0294],
]

/** The first and last nodes span this share of the hero width. */
const NODE_SPAN = 0.93
/** The last node sits this far across the hero. */
const TIP_X = 0.965
/** Below this width the chart stops shrinking and is cropped by the hero edge instead. */
const MIN_WIDTH = 720
/** Share of the artwork's height that runs past the bottom edge. It is the faded base. */
const BOTTOM_CROP = 0.04

export type ChartLayout = {
  /** Chart size and offset, in CSS px, from the top-left of the hero. */
  w: number
  h: number
  left: number
  top: number
}

/**
 * Places the chart along the bottom of the hero, rising to the right. Whatever the
 * hero's height, the curve stays visible, so the layout needs no per-breakpoint rules.
 */
export function chartLayout(heroW: number, heroH: number): ChartLayout {
  const first = CHART_NODES[0][0]
  const last = CHART_NODES[CHART_NODES.length - 1][0]
  const w = Math.max((NODE_SPAN * heroW) / (last - first), MIN_WIDTH)
  const h = w / CHART_ASPECT
  return {
    w,
    h,
    left: heroW * TIP_X - last * w,
    top: heroH - h * (1 - BOTTOM_CROP),
  }
}

/**
 * Mutable scene state. GSAP and DOM listeners write to it and the render loop reads
 * it every frame, so pointer and scroll input never trigger a React render.
 */
export type HeroSceneState = {
  /** Pointer in CSS px from the top-left of the hero. */
  px: number
  py: number
  /** 0 to 1. How strongly the pointer is influencing the chart. */
  hover: number
  /** 0 to 1. Left-to-right entrance wipe of the chart. */
  reveal: number
  /** 0 to 1. How far the hero has scrolled out of view. */
  scroll: number
  layout: ChartLayout
  /** Set by the scene so a layout change can request a frame while rendering is paused. */
  invalidate: (() => void) | null
}

export function createSceneState(): HeroSceneState {
  return {
    px: -9999,
    py: -9999,
    hover: 0,
    reveal: 0,
    scroll: 0,
    layout: { w: 0, h: 1, left: 0, top: 0 },
    invalidate: null,
  }
}
