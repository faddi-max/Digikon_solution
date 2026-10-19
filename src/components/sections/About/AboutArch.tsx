import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type RefObject,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import {
  CanvasTexture,
  Float32BufferAttribute,
  Group,
  MeshBasicMaterial,
  OrthographicCamera,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  Vector2,
} from 'three'

import {
  gsap,
  prefersReducedMotion,
  ScrollTrigger,
  useGSAP,
} from '@/lib/motion'
import { useInView } from '@/lib/useInView'

/** Figma frame for the photo: 417 × 439. */
export const ARCH_W = 417
export const ARCH_H = 439
/** Top corners: radius 205.37. Bottom corners: radius 7. */
const ARCH_R_TOP = 205.37
const ARCH_R_BOTTOM = 7
/** Figma rotation of -2° is clockwise, which is -2° in three.js. */
const ARCH_ROTATION = (-2 * Math.PI) / 180

/** Figma box-shadow: 0 28px 70px 28px #81D870C7 (C7 ≈ 78% alpha). */
const GLOW = {
  offsetY: 28,
  blur: 70,
  spread: 28,
  rgb: '129, 216, 112',
  alpha: 0.78,
}
/** Space around the arch for the glow. The canvas is the arch box plus this on every side. */
export const GLOW_INSET = 140

type Pt = { x: number; y: number }

/** Outline of the arch in y-up centred coordinates, sampled along each corner. */
function outlinePoints(
  w: number,
  h: number,
  rTop: number,
  rBottom: number,
  seg = 40,
): Vector2[] {
  const hw = w / 2
  const hh = h / 2
  const rt = Math.min(rTop, hw, hh)
  const rb = Math.min(rBottom, hw, hh)
  const pts: Vector2[] = []

  const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + ((a1 - a0) * i) / seg
      pts.push(new Vector2(cx + r * Math.cos(a), cy + r * Math.sin(a)))
    }
  }

  arc(-hw + rb, -hh + rb, rb, Math.PI, Math.PI * 1.5) // bottom-left
  arc(hw - rb, -hh + rb, rb, Math.PI * 1.5, Math.PI * 2) // bottom-right
  arc(hw - rt, hh - rt, rt, 0, Math.PI / 2) // top-right
  arc(-hw + rt, hh - rt, rt, Math.PI / 2, Math.PI) // top-left

  return pts
}

function archGeometry(pts: Vector2[], w: number, h: number) {
  const geo = new ShapeGeometry(new Shape(pts))
  const pos = geo.attributes.position
  const uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) + w / 2) / w
    uv[i * 2 + 1] = (pos.getY(i) + h / 2) / h
  }
  geo.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  return geo
}

/**
 * Draws the box-shadow with the same offset, blur and spread as the CSS.
 * The shape is drawn off-canvas and only its shadow lands on the visible area.
 */
function createGlowTexture(
  w: number,
  h: number,
  rTop: number,
  rBottom: number,
) {
  const pad = GLOW_INSET
  const S = 2
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil((w + pad * 2) * S)
  canvas.height = Math.ceil((h + pad * 2) * S)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable for arch glow')

  ctx.setTransform(S, 0, 0, S, 0, 0)

  // Canvas y runs downward, so flip the outline into canvas space.
  const pts = outlinePoints(w, h, rTop, rBottom).map((p) => ({
    x: p.x + pad + w / 2,
    y: pad + h / 2 - p.y,
  }))

  ctx.save()
  ctx.shadowColor = `rgba(${GLOW.rgb}, ${GLOW.alpha})`
  ctx.shadowBlur = GLOW.blur * S
  ctx.shadowOffsetX = 10000
  ctx.shadowOffsetY = GLOW.offsetY * S
  ctx.translate(-10000 / S, 0)

  ctx.beginPath()
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
  ctx.closePath()

  // A stroke as wide as twice the spread grows the shape outward by the spread.
  ctx.fillStyle = `rgb(${GLOW.rgb})`
  ctx.strokeStyle = `rgb(${GLOW.rgb})`
  ctx.lineWidth = GLOW.spread * 2
  ctx.lineJoin = 'round'
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  return tex
}

type ArchSceneProps = {
  src: string
  tilt: MutableRefObject<Pt>
  motion: boolean
  triggerRef: RefObject<HTMLElement | null>
}

function ArchScene({ src, tilt, motion, triggerRef }: ArchSceneProps) {
  const { size, camera, invalidate } = useThree()
  const group = useRef<Group>(null)
  const imgMat = useRef<MeshBasicMaterial>(null)
  const glowMat = useRef<MeshBasicMaterial>(null)

  const texture = useTexture(src)
  useEffect(() => {
    texture.colorSpace = SRGBColorSpace
    invalidate()
  }, [texture, invalidate])

  // The canvas is the arch box plus GLOW_INSET on each side, so the arch is the canvas minus that margin.
  const archW = Math.max(120, size.width - GLOW_INSET * 2)
  const archH = archW * (ARCH_H / ARCH_W)
  const scale = archW / ARCH_W
  const rTop = ARCH_R_TOP * scale
  const rBottom = ARCH_R_BOTTOM * scale

  const { geometry, glowTex } = useMemo(
    () => ({
      geometry: archGeometry(
        outlinePoints(archW, archH, rTop, rBottom),
        archW,
        archH,
      ),
      glowTex: createGlowTexture(archW, archH, rTop, rBottom),
    }),
    [archW, archH, rTop, rBottom],
  )

  useEffect(
    () => () => {
      geometry.dispose()
      glowTex.dispose()
    },
    [geometry, glowTex],
  )

  useEffect(() => {
    const cam = camera as OrthographicCamera
    cam.left = -size.width / 2
    cam.right = size.width / 2
    cam.top = size.height / 2
    cam.bottom = -size.height / 2
    cam.updateProjectionMatrix()
  }, [camera, size.width, size.height])

  // Static Figma rotation, set once so the pointer tilt in useFrame isn't overwritten.
  useEffect(() => {
    if (group.current) group.current.rotation.z = ARCH_ROTATION
    invalidate()
  }, [invalidate])

  // Entrance: the photo fades in and settles, and the glow blooms behind it.
  useEffect(() => {
    const g = group.current
    const img = imgMat.current
    const glow = glowMat.current
    if (!g || !img || !glow) return

    if (!motion) {
      img.opacity = 1
      glow.opacity = 1
      invalidate()
      return
    }

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
    tl.eventCallback('onUpdate', invalidate)
    tl.fromTo(g.scale, { x: 0.94, y: 0.94 }, { x: 1, y: 1, duration: 2.2 }, 0)
      .fromTo(
        img,
        { opacity: 0 },
        { opacity: 1, duration: 1.4, ease: 'power2.out' },
        0,
      )
      .fromTo(
        glow,
        { opacity: 0 },
        { opacity: 1, duration: 2.2, ease: 'power2.out' },
        0.2,
      )

    const trigger = triggerRef.current
    const st = trigger
      ? ScrollTrigger.create({
          trigger,
          start: 'top 80%',
          onEnter: () => tl.restart(),
          onEnterBack: () => tl.restart(),
          onLeaveBack: () => tl.pause(0),
        })
      : null
    if (!trigger) tl.play()

    return () => {
      st?.kill()
      tl.kill()
    }
  }, [motion, triggerRef, invalidate])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return

    // Ease the tilt toward the pointer and float gently.
    const k = 1 - Math.exp(-6 * dt)
    g.rotation.x += (-tilt.current.y * 0.1 - g.rotation.x) * k
    g.rotation.y += (tilt.current.x * 0.12 - g.rotation.y) * k
    if (motion) g.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 4
  })

  return (
    <group ref={group}>
      {/* Glow sits behind the photo. Its texture already carries the shadow shape and alpha. */}
      <mesh position={[0, 0, -3]}>
        <planeGeometry
          args={[archW + GLOW_INSET * 2, archH + GLOW_INSET * 2]}
        />
        <meshBasicMaterial
          ref={glowMat}
          map={glowTex}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      <mesh geometry={geometry}>
        <meshBasicMaterial ref={imgMat} map={texture} transparent opacity={0} />
      </mesh>
    </group>
  )
}

export function AboutArch({ src }: { src: string }) {
  const [wrapRef, active] = useInView<HTMLDivElement>()
  const motion = !prefersReducedMotion()
  const tilt = useRef<Pt>({ x: 0, y: 0 })

  useGSAP(
    () => {
      const el = wrapRef.current
      if (!el || !motion) return

      const xTo = gsap.quickTo(tilt.current, 'x', {
        duration: 0.9,
        ease: 'power3.out',
      })
      const yTo = gsap.quickTo(tilt.current, 'y', {
        duration: 0.9,
        ease: 'power3.out',
      })

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        xTo(((e.clientX - r.left) / r.width) * 2 - 1)
        yTo(((e.clientY - r.top) / r.height) * 2 - 1)
      }
      const onLeave = () => {
        xTo(0)
        yTo(0)
      }

      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      return () => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
      }
    },
    { dependencies: [motion] },
  )

  return (
    <div ref={wrapRef} className="dk-about__arch" aria-hidden="true">
      <div className="dk-about__arch-canvas">
        <Canvas
          orthographic
          dpr={[1, 2]}
          frameloop={active && motion ? 'always' : 'demand'}
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 0, 10], zoom: 1 }}
        >
          <Suspense fallback={null}>
            <ArchScene
              src={src}
              tilt={tilt}
              motion={motion}
              triggerRef={wrapRef}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}
