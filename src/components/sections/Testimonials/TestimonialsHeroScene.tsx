import { Component, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { ExtrudeGeometry, Shape, type Group } from 'three'

import { useWebGLSupport } from '@/hooks/useWebGLSupport'
import { useInView } from '@/lib/useInView'

/**
 * Shared mutable state: the hero writes it from pointer events, the scene reads it every
 * frame, so pointer movement never triggers a React render.
 */
export type TestimonialsSceneState = { px: number; py: number; on: number }
export const createTestimonialsState = (): TestimonialsSceneState => ({ px: 0, py: 0, on: 0 })

const GREEN = '#81d870'
const GREEN_SOFT = '#b2ee9e'
const SLAB = '#0f2a2e'
const EDGE = '#2c5a4d'
const LINE = '#4f7a72'
const AVATAR_BG = '#cfe6d3'
const AVATAR_FG = '#4d806a'

/** Composition size in world units; the group is scaled to fit any canvas aspect. */
const DW = 6.6
const DH = 4.8

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const easeOutBack = (x: number) => {
  const t = clamp01(x)
  const c1 = 1.6
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt))

/* ------------------------------------------------------------------ glyph geometry */

function useGlyphs() {
  const g = useMemo(() => {
    const opts = { depth: 0.02, bevelEnabled: false, curveSegments: 12 }

    const star = new Shape()
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.45 : 1
      const a = Math.PI / 2 + (i * Math.PI) / 5
      const x = Math.cos(a) * r
      const y = Math.sin(a) * r
      if (i) star.lineTo(x, y)
      else star.moveTo(x, y)
    }
    star.closePath()

    // A comma-shaped quote mark: round head, curved tail.
    const quote = new Shape()
    quote.moveTo(-0.5, 0.2)
    quote.absarc(0, 0.2, 0.5, Math.PI, 0, true)
    quote.quadraticCurveTo(0.5, -0.5, -0.4, -0.9)
    quote.quadraticCurveTo(-0.5, -0.4, -0.5, 0.2)

    const heart = new Shape()
    heart.moveTo(0, -0.6)
    heart.bezierCurveTo(-0.9, 0.1, -0.5, 0.8, 0, 0.35)
    heart.bezierCurveTo(0.5, 0.8, 0.9, 0.1, 0, -0.6)

    return {
      star: new ExtrudeGeometry(star, opts),
      quote: new ExtrudeGeometry(quote, opts),
      heart: new ExtrudeGeometry(heart, opts),
    }
  }, [])
  useEffect(
    () => () => {
      g.star.dispose()
      g.quote.dispose()
      g.heart.dispose()
    },
    [g],
  )
  return g
}
type Glyphs = ReturnType<typeof useGlyphs>

/* ------------------------------------------------------------------ pieces */

function ReviewCard({
  w,
  h,
  lines,
  glyphs,
}: {
  w: number
  h: number
  lines: readonly number[]
  glyphs: Glyphs
}) {
  const D = 0.1
  const z = D / 2 + 0.006
  const left = -w / 2
  const top = h / 2
  return (
    <group>
      {/* Edge: a slightly larger slab behind the face reads as a 1px border. */}
      <RoundedBox args={[w + 0.035, h + 0.035, D - 0.01]} radius={0.12} smoothness={4}>
        <meshStandardMaterial color={EDGE} roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[w, h, D]} radius={0.115} smoothness={4}>
        <meshStandardMaterial color={SLAB} roughness={0.45} metalness={0.1} />
      </RoundedBox>

      {/* Avatar */}
      <group position={[left + 0.3, top - 0.3, z]}>
        <mesh>
          <circleGeometry args={[0.16, 32]} />
          <meshBasicMaterial color={AVATAR_BG} />
        </mesh>
        <mesh position={[0, 0.045, 0.002]}>
          <circleGeometry args={[0.048, 24]} />
          <meshBasicMaterial color={AVATAR_FG} />
        </mesh>
        <mesh position={[0, -0.07, 0.002]} scale={[1, 0.6, 1]}>
          <circleGeometry args={[0.095, 24]} />
          <meshBasicMaterial color={AVATAR_FG} />
        </mesh>
      </group>

      {/* Quote mark */}
      <mesh geometry={glyphs.quote} position={[w / 2 - 0.3, top - 0.24, z]} scale={0.085}>
        <meshBasicMaterial color={GREEN} />
      </mesh>
      <mesh geometry={glyphs.quote} position={[w / 2 - 0.18, top - 0.24, z]} scale={0.085}>
        <meshBasicMaterial color={GREEN} />
      </mesh>

      {/* Text lines */}
      {lines.map((len, i) => (
        <RoundedBox
          key={i}
          args={[len, 0.06, 0.012]}
          radius={0.028}
          smoothness={2}
          position={[left + 0.62 + len / 2, top - 0.3 - i * 0.16 + (i === 0 ? 0.05 : 0), z]}
        >
          <meshBasicMaterial color={i === 0 ? '#6f9a90' : LINE} />
        </RoundedBox>
      ))}

      {/* Stars */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          geometry={glyphs.star}
          position={[left + 0.26 + i * 0.16, -top + 0.2, z]}
          scale={0.065}
        >
          <meshBasicMaterial color={GREEN} />
        </mesh>
      ))}
    </group>
  )
}

const CARDS = [
  { x: 0.8, y: 0.62, z: 0.3, w: 2.5, h: 1.5, rz: -0.14, ry: -0.16, lines: [1.3, 1.05, 0.8], phase: 0 },
  { x: -1.15, y: -0.8, z: 0.55, w: 2.0, h: 1.25, rz: -0.08, ry: 0.12, lines: [1.0, 0.85, 0.6], phase: 1.7 },
  { x: 2.05, y: -0.95, z: 0.65, w: 1.7, h: 1.12, rz: -0.1, ry: -0.1, lines: [0.85, 0.7, 0.5], phase: 3.1 },
] as const

function Cluster({ state, motion }: { state: TestimonialsSceneState; motion: boolean }) {
  const { viewport } = useThree()
  const glyphs = useGlyphs()

  const root = useRef<Group>(null)
  const cards = useRef<(Group | null)[]>([])
  const shadow = useRef<Group>(null)
  const heart = useRef<Group>(null)
  const ring = useRef<Group>(null)
  const dot = useRef<Group>(null)
  const sparks = useRef<Group>(null)

  useFrame((s, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20)
    const clock = s.clock.elapsedTime
    // Reduced motion draws the finished composition and holds it.
    const t = motion ? clock : 1e4
    const idle = motion ? clock : 0

    const fit = Math.min(viewport.width / DW, viewport.height / DH, 1.2)
    const r = root.current
    if (r) {
      r.scale.setScalar(fit)
      const tx = motion ? state.px * state.on : 0
      const ty = motion ? state.py * state.on : 0
      r.rotation.y = damp(r.rotation.y, tx * 0.22, 4, dt)
      r.rotation.x = damp(r.rotation.x, ty * 0.14, 4, dt)
    }

    const pop = (cue: number) => easeOutBack((t - cue) / 0.7)
    const show = (g: Group | null, k: number) => {
      if (!g) return
      g.scale.setScalar(Math.max(0.0001, k))
      g.visible = k > 0.001
    }

    CARDS.forEach((c, i) => {
      const g = cards.current[i]
      if (!g) return
      show(g, pop(0.15 + i * 0.16))
      g.position.set(c.x + (motion ? state.px * state.on * 0.06 * (i + 1) : 0), c.y + Math.sin(idle * 0.9 + c.phase) * 0.07, c.z)
      g.rotation.z = c.rz + Math.sin(idle * 0.6 + c.phase) * 0.012
    })

    show(shadow.current, pop(0.1))
    show(heart.current, pop(0.75))
    if (heart.current) {
      heart.current.position.y = 0.95 + Math.sin(idle * 1.1) * 0.05
      const beat = 1 + 0.08 * Math.max(0, Math.sin(idle * 3))
      heart.current.children[1]?.scale.setScalar(beat)
    }
    show(sparks.current, pop(1.0))

    const ringK = clamp01((t - 0.2) / 1)
    if (ring.current) ring.current.scale.setScalar(Math.max(0.0001, 1 - Math.pow(1 - ringK, 3)))
    if (dot.current) {
      const a = idle * 0.5 + 0.8
      dot.current.position.set(-0.1 + Math.cos(a) * 1.95, -0.15 + Math.sin(a) * 1.95, -0.4)
      dot.current.visible = ringK > 0.9
    }
  })

  return (
    <group ref={root}>
      {/* Orbit ring behind everything. */}
      <group ref={ring} position={[-0.1, -0.15, -0.4]}>
        <mesh>
          <torusGeometry args={[1.95, 0.011, 8, 180]} />
          <meshBasicMaterial color={GREEN} transparent opacity={0.75} />
        </mesh>
      </group>
      <group ref={dot}>
        <mesh>
          <circleGeometry args={[0.045, 20]} />
          <meshBasicMaterial color={GREEN_SOFT} />
        </mesh>
      </group>

      {/* Dark card tucked behind the main review. */}
      <group ref={shadow} position={[1.45, 0.05, -0.15]} rotation={[0, -0.1, -0.1]}>
        <RoundedBox args={[2.3, 1.3, 0.08]} radius={0.12} smoothness={3}>
          <meshStandardMaterial color="#081c20" roughness={0.7} />
        </RoundedBox>
      </group>

      {CARDS.map((c, i) => (
        <group
          key={i}
          ref={(g) => {
            cards.current[i] = g
          }}
          rotation={[0, c.ry, c.rz]}
        >
          <ReviewCard w={c.w} h={c.h} lines={c.lines} glyphs={glyphs} />
        </group>
      ))}

      {/* Heart bubble. */}
      <group ref={heart} position={[-1.95, 0.95, 0.6]} rotation={[0, 0.1, 0.05]}>
        <RoundedBox args={[0.62, 0.5, 0.08]} radius={0.14} smoothness={3}>
          <meshStandardMaterial color="#12343a" roughness={0.45} />
        </RoundedBox>
        <group position={[0, 0.0, 0.06]}>
          <mesh geometry={glyphs.heart} scale={0.17}>
            <meshBasicMaterial color={GREEN} />
          </mesh>
        </group>
      </group>

      {/* Sparkle ticks, top right. */}
      <group ref={sparks} position={[2.35, 1.75, 0.5]}>
        {[
          { x: 0, y: 0, r: 0.2, l: 0.26 },
          { x: 0.28, y: -0.1, r: 1.05, l: 0.2 },
          { x: -0.2, y: -0.18, r: -0.35, l: 0.18 },
        ].map((s, i) => (
          <mesh key={i} position={[s.x, s.y, 0]} rotation={[0, 0, s.r]}>
            <planeGeometry args={[0.035, s.l]} />
            <meshBasicMaterial color={GREEN} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ fallback + canvas */

/** Flat version of the same picture: shown without WebGL, or if the scene throws. */
export function TestimonialsFallback() {
  const card = (x: number, y: number, w: number, h: number, rot: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect width={w} height={h} rx="14" fill={SLAB} stroke={EDGE} />
      <circle cx="30" cy="30" r="16" fill={AVATAR_BG} />
      <rect x="58" y="20" width={w * 0.5} height="6" rx="3" fill="#6f9a90" />
      <rect x="58" y="36" width={w * 0.42} height="6" rx="3" fill={LINE} />
      <rect x="58" y="52" width={w * 0.3} height="6" rx="3" fill={LINE} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={26 + i * 16} cy={h - 20} r="5" fill={GREEN} />
      ))}
    </g>
  )
  return (
    <svg className="size-full" viewBox="0 0 640 460" fill="none" aria-hidden="true" focusable="false">
      <circle cx="270" cy="250" r="190" stroke={GREEN} strokeOpacity="0.7" />
      {card(300, 60, 250, 150, -8)}
      {card(70, 250, 200, 125, -5)}
      {card(400, 270, 170, 112, -6)}
    </svg>
  )
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/**
 * Floating 3D review cards for the Testimonials hero.
 *
 * - Purpose: "real trust" shown as client reviews drifting around an orbit, with a heart
 *   bubble and sparkle ticks. No names, quotes or ratings from real people: shapes only.
 * - Camera: fixed perspective. The cluster is scaled to fit the canvas at any aspect ratio.
 * - Motion: staggered pop-in, slow float, heart beat, orbiting dot, pointer tilt (mouse/pen).
 * - Cost: renders continuously only while on screen, tab visible and motion allowed.
 * - Failure: no WebGL, lost context, or any scene error falls back to a flat SVG.
 */
export function TestimonialsHeroScene({
  state,
  motion,
  className,
}: {
  state: TestimonialsSceneState
  motion: boolean
  className?: string
}) {
  const supported = useWebGLSupport()
  const [ref, live] = useInView<HTMLDivElement>()

  if (!supported)
    return (
      <div className={className} aria-hidden="true">
        <TestimonialsFallback />
      </div>
    )

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <SceneBoundary fallback={<TestimonialsFallback />}>
        <Canvas
          dpr={[1, 1.75]}
          frameloop={live && motion ? 'always' : 'demand'}
          camera={{ position: [0, 0, 10], fov: 30, near: 0.1, far: 50 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
          style={{ position: 'absolute', inset: 0 }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
            gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault())
          }}
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[-3, 5, 6]} intensity={1.4} />
          <pointLight position={[2, 1, 3]} intensity={4} distance={9} color={GREEN} />
          <Cluster state={state} motion={motion} />
        </Canvas>
      </SceneBoundary>
    </div>
  )
}
