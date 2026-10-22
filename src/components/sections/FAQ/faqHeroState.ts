/**
 * State shared between the FAQ hero (which writes it from DOM events and ScrollTrigger) and
 * its Three.js scene (which reads it every frame), so pointer moves and scrolling cause no
 * React renders.
 */
export type BubbleState = {
  /** Pointer position over the hero, -1..1 on each axis, and 1 while a mouse is over it. */
  px: number
  py: number
  on: number
  /** 0 while the hero is fully on screen, 1 once it has scrolled away. */
  scroll: number
  /** Seconds (performance clock) when the answer bubble should type its lines again. */
  replayAt: number
}

export const createBubbleState = (): BubbleState => ({
  px: 0,
  py: 0,
  on: 0,
  scroll: 0,
  replayAt: -100,
})

export const nowSeconds = () => performance.now() / 1000
