import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'

import { gsap, prefersReducedMotion } from '@/lib/motion'

import { OrbitStage } from './OrbitStage'
import './HeroOrbit.css'

type Pt = { x: number; y: number }

export function HeroOrbit() {
  const wrap = useRef<HTMLDivElement>(null)
  const hoverRef = useRef(-1)
  /** Pointer position in CSS px inside the canvas, or null when outside. */
  const pointerRef = useRef<Pt | null>(null)
  /** Pointer position normalised to -1..1. Eased by GSAP. */
  const tiltRef = useRef<Pt>({ x: 0, y: 0 })

  const [inView, setInView] = useState(true)
  const [visible, setVisible] = useState(() => !document.hidden)
  const [motion, setMotion] = useState(() => !prefersReducedMotion())

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setMotion(!mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Pause rendering when off-screen or the tab is hidden.
  useEffect(() => {
    const el = wrap.current
    const io = el
      ? new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 })
      : null
    if (el && io) io.observe(el)

    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      io?.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  // Pointer tracking. quickTo eases the tilt smoothly and handles interruptions.
  useEffect(() => {
    const el = wrap.current
    if (!el) return

    const xTo = gsap.quickTo(tiltRef.current, 'x', { duration: 0.9, ease: 'power3.out' })
    const yTo = gsap.quickTo(tiltRef.current, 'y', { duration: 0.9, ease: 'power3.out' })

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      xTo(((e.clientX - r.left) / r.width) * 2 - 1)
      yTo(((e.clientY - r.top) / r.height) * 2 - 1)
      pointerRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
      pointerRef.current = null
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={wrap} className="dk-orbit" aria-hidden="true">
      <Canvas
        frameloop={inView && visible ? 'always' : 'demand'}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        camera={{ fov: 30, near: 1, far: 4000, position: [0, 0, 1000] }}
      >
        <OrbitStage
          hoverRef={hoverRef}
          pointerRef={pointerRef}
          tiltRef={tiltRef}
          motion={motion}
        />
      </Canvas>
    </div>
  )
}