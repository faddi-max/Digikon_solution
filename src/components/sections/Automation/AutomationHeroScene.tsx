import { useEffect, useRef, useState } from 'react'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'

import { useWebGLSupport } from '@/hooks/useWebGLSupport'

import { RobotFallback } from './RobotFallback'
import { createRobot, createRobotEnvironment } from './robotModel'
import { FOV, SCENE_H, SCENE_W } from './sceneSize'

/**
 * State shared between the hero (which writes it from DOM events and the GSAP timeline) and
 * the scene (which reads it every frame), so pointer moves and tweens cause no React renders.
 */
export type RobotState = {
  /** Pointer position over the hero, -1 to 1 from its centre. */
  px: number
  py: number
  /** Entrance progress, 0 to 1. */
  intro: number
  /** Idle float, -1 to 1. */
  float: number
  /** Set by the scene: ask for a frame when nothing is looping (reduced motion, off screen). */
  wake: (() => void) | null
}

export const createRobotState = (): RobotState => ({
  px: 0,
  py: 0,
  intro: 0,
  float: 0,
  wake: null,
})

type Props = {
  state: RobotState
  /** False for reduced motion: one still frame, no idle motion, no pointer follow. */
  motion: boolean
  className?: string
}

/**
 * The 3D DigiKon assistant.
 *
 * - Purpose: it is the "AI core" of the page's story, the thing that takes work off your plate.
 *   It reacts to the pointer by looking toward it, blinks, floats, and arrives with the
 *   headline.
 * - Camera: perspective, 24deg, distance chosen so one world unit is one design pixel.
 * - Light: a prefiltered studio map for the glossy shell, plus a key, a green rim and a
 *   hemisphere fill. No shadows are cast; the grounding glow under the robot is DOM.
 * - Loop: runs only while the canvas is on screen, the tab is visible and motion is allowed.
 *   Otherwise it renders on demand (`state.wake`) so a tween or resize still gets a frame.
 * - Failure: no WebGL, a failed init or a lost context all fall back to the flat SVG robot.
 * - Cleanup: every geometry, material, texture, the renderer and its context are released.
 */
export function AutomationHeroScene({ state, motion, className }: Props) {
  const supported = useWebGLSupport()
  const [failed, setFailed] = useState(false)
  const holder = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = holder.current
    const el = canvas.current
    if (!host || !el || !supported) return

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({
        canvas: el,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      })
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to a failed external system
      setFailed(true)
      return
    }
    renderer.setClearColor(0x000000, 0)

    const scene = new Scene()
    const camera = new PerspectiveCamera(FOV, SCENE_W / SCENE_H, 10, 4000)
    camera.position.z = SCENE_H / 2 / Math.tan((FOV / 2) * (Math.PI / 180))

    const env = createRobotEnvironment(renderer)
    const robot = createRobot()
    robot.setEnvironment(env.texture)
    scene.add(robot.group)

    let raf = 0
    let last = performance.now()
    let onScreen = true
    let tabVisible = !document.hidden
    let disposed = false

    // Drag to turn the figure. It springs back to facing forward when let go.
    let spin = 0
    let spinV = 0
    let dragging = false
    let lastX = 0
    let moved = 0
    let poke = -100

    const frame = (now: number) => {
      raf = 0
      if (disposed) return
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      if (!dragging) {
        // Damped spring back to zero.
        spinV += (-spin * 40 - spinV * 7) * dt
        spin += spinV * dt
        if (Math.abs(spin) < 0.001 && Math.abs(spinV) < 0.001) spin = spinV = 0
      }
      robot.update({
        spin,
        poke,
        px: motion ? state.px : 0,
        py: motion ? state.py : 0,
        intro: motion ? state.intro : 1,
        float: motion ? state.float : 0,
        time: now / 1000,
        dt: motion ? dt : 1,
        motion,
      })
      renderer.render(scene, camera)
      if (motion && onScreen && tabVisible) raf = requestAnimationFrame(frame)
    }
    const request = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(frame)
    }
    state.wake = request

    const resize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      if (!w || !h) return
      // Cap the pixel ratio: the figure is soft shapes, so 2x is plenty, and it saves a lot of
      // fill on phones.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      request()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        if (onScreen) {
          last = performance.now()
          request()
        }
      },
      { rootMargin: '120px' },
    )
    io.observe(host)

    const onVisibility = () => {
      tabVisible = !document.hidden
      if (tabVisible) {
        last = performance.now()
        request()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    // A lost context cannot be drawn to. Fall back to the flat robot instead of a dead canvas.
    const onLost = (e: Event) => {
      e.preventDefault()
      setFailed(true)
    }
    el.addEventListener('webglcontextlost', onLost)

    const onDown = (e: PointerEvent) => {
      if (!motion) return
      dragging = true
      moved = 0
      lastX = e.clientX
      spinV = 0
      el.setPointerCapture(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      lastX = e.clientX
      moved += Math.abs(dx)
      spin = Math.max(-Math.PI, Math.min(Math.PI, spin + dx * 0.014))
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      // A tap (not a drag) makes it wave.
      if (moved < 6) poke = performance.now() / 1000
      request()
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)

    request()

    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      disposed = true
      state.wake = null
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      el.removeEventListener('webglcontextlost', onLost)
      robot.dispose()
      env.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    }
  }, [motion, state, supported])

  if (!supported || failed) {
    return (
      <div className={className} aria-hidden="true">
        <RobotFallback />
      </div>
    )
  }

  return (
    <div ref={holder} className={`${className ?? ''} pointer-events-auto`} aria-hidden="true">
      <canvas ref={canvas} className="block size-full cursor-grab touch-pan-y active:cursor-grabbing" />
    </div>
  )
}
