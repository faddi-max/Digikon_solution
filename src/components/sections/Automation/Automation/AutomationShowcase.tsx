import { useEffect, useRef, useState } from 'react'

import robotArt from '@/assets/images/automation-robot-3d.png?url'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useWebGLSupport } from '@/hooks/useWebGLSupport'
import { gsap, ScrollTrigger } from '@/lib/motion'

import { createShowcaseScene } from './showcaseScene'

/**
 * A light-green card with the DigiKon assistant and its floating panels, in real 3D.
 *
 * - Purpose: it shows what the service is about, an assistant working across your tools,
 *   with depth the flat picture cannot give.
 * - Scene: see showcaseScene.ts. The picture is the art; depth is built from it, and the
 *   pointer tilts it in perspective while soft motes drift in front of and behind it.
 * - Layers: the faint grid behind drifts against the pointer; the canvas draws the figure;
 *   the plain `<img>` underneath is what shows before the scene is ready, without WebGL, if
 *   it fails, and for reduced motion (a still frame of the same art in the same place).
 * - Loop: runs only while the card is on screen and the tab is visible. Resize, context
 *   loss and teardown are handled; every GPU resource is released.
 */

/** The art frame (the whole PNG, margins included) inside the card, as in the design. */
const ART = { w: 55, cx: 50, cy: 50 }

export function AutomationShowcase({
  className = '',
  fill = false,
}: {
  className?: string
  /** Run edge to edge: no rounding, and a height that grows with the width (the art scales to fit). */
  fill?: boolean
}) {
  const supported = useWebGLSupport()
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const motion = !reduced
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const card = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const glow = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = card.current
    const el = canvas.current
    if (!host || !el || !supported || failed) return

    let scene: ReturnType<typeof createShowcaseScene>
    try {
      const small = window.matchMedia('(max-width: 640px)').matches
      scene = createShowcaseScene(el, robotArt, { motes: small ? 18 : 36, segments: small ? 56 : 96 })
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to a failed external system
      setFailed(true)
      return
    }

    const state = { px: 0, py: 0, tx: 0, ty: 0, intro: motion ? 0 : 1 }
    let raf = 0
    let last = performance.now()
    let onScreen = true
    let tabVisible = !document.hidden
    let disposed = false
    let loaded = false

    const frame = (now: number) => {
      raf = 0
      if (disposed || !loaded) return
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const k = 1 - Math.exp(-dt * 5)
      state.px += (state.tx - state.px) * k
      state.py += (state.ty - state.py) * k
      scene.render({ px: motion ? state.px : 0, py: motion ? state.py : 0, intro: state.intro, time: now / 1000, dt, motion })
      if (grid.current) {
        grid.current.style.transform = `translate3d(${(-state.px * 10).toFixed(2)}px, ${(-state.py * 8).toFixed(2)}px, 0)`
      }
      if (motion && onScreen && tabVisible) raf = requestAnimationFrame(frame)
    }
    const request = () => {
      if (!raf && !disposed && loaded) raf = requestAnimationFrame(frame)
    }

    const resize = () => {
      scene.resize(host.clientWidth, host.clientHeight, window.devicePixelRatio || 1)
      request()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()

    scene.ready
      .then(() => {
        if (disposed) return
        loaded = true
        setReady(true)
        // The entrance: the figure rises in as the card scrolls into view.
        if (motion) {
          ScrollTrigger.create({
            trigger: host,
            start: 'top 85%',
            once: true,
            onEnter: () => {
              gsap.to(state, { intro: 1, duration: 1.4, ease: 'power3.out', onUpdate: request })
              if (glow.current) gsap.fromTo(glow.current, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 1.6, ease: 'power2.out' })
            },
          })
        }
        request()
      })
      .catch(() => {
        if (!disposed) setFailed(true)
      })

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        if (onScreen) {
          last = performance.now()
          request()
        }
      },
      { rootMargin: '100px' },
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

    const onMove = (e: PointerEvent) => {
      if (!motion || e.pointerType === 'touch') return
      const r = host.getBoundingClientRect()
      state.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      state.ty = ((e.clientY - r.top) / r.height - 0.5) * 2
      request()
    }
    const onLeave = () => {
      state.tx = 0
      state.ty = 0
      request()
    }
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)

    const onLost = (e: Event) => {
      e.preventDefault()
      setFailed(true)
    }
    el.addEventListener('webglcontextlost', onLost)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('webglcontextlost', onLost)
      gsap.killTweensOf(state)
      scene.dispose()
    }
  }, [motion, supported, failed])

  const scene3d = supported && !failed && motion
  // With reduced motion the scene is not run at all: the still picture is the whole figure.
  const showImg = !scene3d || !ready

  return (
    <div
      ref={card}
      role="img"
      aria-label="The DigiKon assistant pointing at a chart and holding a tablet, surrounded by floating panels for cloud, settings, a profile and a message."
      className={`${fill ? 'h-[clamp(22rem,42vw,44rem)]' : 'aspect-[480/287] rounded-[1.5rem]'} relative isolate w-full overflow-clip [--k:min(calc(100cqw/480),calc(100cqh/287))] bg-[linear-gradient(180deg,#e3f6df_0%,#f1faee_55%,#fff_100%)] ${className}`}
      style={{ containerType: 'size' }}
    >
      {/* Light from the top centre. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_62%_82%_at_50%_0%,#c9edc2_0%,rgb(201_237_194/0.55)_45%,transparent_100%)]"
      />
      {/* Grid, fading out toward the bottom; it drifts against the pointer. */}
      <div
        ref={grid}
        aria-hidden="true"
        className="absolute -inset-[3%] -z-10 [mask-image:linear-gradient(180deg,#000_0%,#000_18%,transparent_44%)] bg-[radial-gradient(circle,rgb(129_216_112/0.4)_1.6px,transparent_2.2px),linear-gradient(rgb(129_216_112/0.17)_1px,transparent_1px),linear-gradient(90deg,rgb(129_216_112/0.17)_1px,transparent_1px)] [background-position:calc(var(--k)*27-var(--k)*33.2/2+3cqw)_calc(var(--k)*29-var(--k)*29.5/2+3cqh),calc(var(--k)*27+3cqw)_calc(var(--k)*29+3cqh),calc(var(--k)*27+3cqw)_calc(var(--k)*29+3cqh)] [background-size:calc(var(--k)*33.2)_calc(var(--k)*29.5)]"
      />
      {/* A soft pool of light under the figure. */}
      <div
        ref={glow}
        aria-hidden="true"
        className="absolute -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(129_216_112/0.3),transparent)]"
        style={{ left: '22%', top: '24%', width: '56%', height: '66%' }}
      />

      <img
        src={robotArt}
        alt=""
        width={1312}
        height={1199}
        decoding="async"
        draggable={false}
        className={`pointer-events-none absolute h-auto -translate-x-1/2 -translate-y-1/2 select-none ${showImg ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: `calc(var(--k) * ${(480 * ART.w) / 100})`, left: `${ART.cx}%`, top: `${ART.cy}%` }}
      />
      {scene3d ? <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 size-full" /> : null}
    </div>
  )
}