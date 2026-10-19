/**
 * Pure geometry for the team carousel. Kept free of DOM and GSAP so it is easy to reason
 * about and to test.
 *
 * Numbers are measured from the 1920px design: the active card is 400 x 533, the cards
 * beside it are 266 x 392 and the outer ones 199 x 323. Each card is the full-size card
 * scaled to the right height and then cropped at the sides (`clip`) to the right width,
 * so the text keeps its proportions and only the visible window changes.
 */
export type Pose = {
  /** Distance of the card centre from the stage centre, in px. */
  x: number
  scale: number
  /** Share of the card's width cropped from each side, in percent. */
  clip: number
  zIndex: number
  /** 1 when the card should be on screen, 0 when it is parked out of sight. */
  autoAlpha: number
}

/** Neighbours shown on each side of the active card. Phones get one, wider stages two. */
export type Reach = 1 | 2

/** Stage width from which two neighbours fit on each side. Matches the CSS @container rule. */
export const WIDE_STAGE = 880

export const reachFor = (stageWidth: number): Reach => (stageWidth >= WIDE_STAGE ? 2 : 1)

/** Signed, shortest distance from the active card around the loop, so -2..2 for five cards. */
export function offsetOf(index: number, active: number, count: number): number {
  let d = (((index - active) % count) + count) % count
  if (d > count / 2) d -= count
  return d
}

/**
 * Per level (0 = active, 1 = next to it, 2 = outermost):
 * - height: card height as a share of the active card's height
 * - width: visible width as a share of the active card's width
 * - x: centre distance as a share of the active card's width
 */
const LEVELS = [
  { height: 1, width: 1, x: 0 },
  { height: 392 / 533, width: 266 / 400, x: 332 / 400 },
  { height: 323 / 533, width: 199 / 400, x: 563 / 400 },
] as const

export function poseFor(offset: number, cardWidth: number, reach: Reach): Pose {
  const level = Math.min(Math.abs(offset), 2)
  const { height, width, x } = LEVELS[level]
  const side = Math.sign(offset)

  return {
    x: side * x * cardWidth,
    scale: height,
    clip: ((1 - width / height) / 2) * 100,
    zIndex: 10 - level,
    autoAlpha: Math.abs(offset) <= reach ? 1 : 0,
  }
}