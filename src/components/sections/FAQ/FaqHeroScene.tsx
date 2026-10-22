import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Environment,
  Lightformer,
  Line as DashLine,
  PerformanceMonitor,
  RoundedBox,
} from '@react-three/drei'
import {
  CanvasTexture,
  BufferAttribute,
  CatmullRomCurve3,
  Color,
  Euler,
  ExtrudeGeometry,
  Shape,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
  type Group,
  type Mesh,
} from 'three'

import { useWebGLSupport } from '@/hooks/useWebGLSupport'
import { useInView } from '@/lib/useInView'

import { nowSeconds, type BubbleState } from './faqHeroState'

/* -------------------------------------------------------------------------- */
/* Palette (brand tokens, as Three.js needs plain values)                     */
/* -------------------------------------------------------------------------- */

const INK = '#03171d'
const GREEN = '#81d870'
const GREEN_SOFT = '#b2ee9e'

/* -------------------------------------------------------------------------- */
/* Easing and timing                                                          */
/* -------------------------------------------------------------------------- */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const easeOutCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3)
const easeOutBack = (x: number) => {
  const t = clamp01(x)
  const c1 = 1.55
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
const damp = (from: number, to: number, lambda: number, dt: number) =>
  from + (to - from) * (1 - Math.exp(-lambda * dt))

/** Entrance cues in seconds: the question arrives, then the answer types itself. */
const CUE = {
  glow: 0,
  ring: 0.15,
  backPanel: 0.1,
  dark: 0.2,
  darkLines: 0.62,
  palePanel: 0.42,
  glass: 0.52,
  glassLines: 1.08,
  coin: 0.8,
} as const
const POP = 0.7
const LINE = 0.42
const LINE_GAP = 0.13

/* -------------------------------------------------------------------------- */
/* Geometry helpers                                                           */
/* -------------------------------------------------------------------------- */

type Tail = { x: number; w: number; tipX: number; h: number }

/** A rounded rectangle with a speech tail cut into its bottom edge. */
function bubbleShape(w: number, h: number, r: number, tail?: Tail) {
  const s = new Shape()
  const x0 = -w / 2
  const x1 = w / 2
  const y0 = -h / 2
  const y1 = h / 2
  s.moveTo(x0 + r, y0)
  if (tail) {
    s.lineTo(tail.x, y0)
    s.lineTo(tail.tipX, y0 - tail.h)
    s.lineTo(tail.x + tail.w, y0)
  }
  s.lineTo(x1 - r, y0)
  s.quadraticCurveTo(x1, y0, x1, y0 + r)
  s.lineTo(x1, y1 - r)
  s.quadraticCurveTo(x1, y1, x1 - r, y1)
  s.lineTo(x0 + r, y1)
  s.quadraticCurveTo(x0, y1, x0, y1 - r)
  s.lineTo(x0, y0 + r)
  s.quadraticCurveTo(x0, y0, x0 + r, y0)
  return s
}

type SlabProps = {
  w: number
  h: number
  r: number
  depth: number
  bevel: number
  tail?: Tail
  lite: boolean
  /** Optional vertex-colour gradient, top-left colour to bottom-right colour. */
  gradient?: readonly [string, string]
}

/** Extrudes a bubble shape and centres it on z so the front face sits at depth/2 + bevel. */
function useSlab({ w, h, r, depth, bevel, tail, lite, gradient }: SlabProps) {
  const key = JSON.stringify([tail, gradient])
  const geometry = useMemo(() => {
    const g = new ExtrudeGeometry(bubbleShape(w, h, r, tail), {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: lite ? 2 : 5,
      curveSegments: lite ? 8 : 18,
    })
    g.translate(0, 0, -depth / 2)
    if (gradient) {
      const from = new Color(gradient[0])
      const to = new Color(gradient[1])
      const pos = g.attributes.position
      const colors = new Float32Array(pos.count * 3)
      const c = new Color()
      for (let i = 0; i < pos.count; i++) {
        // 0 at the top-left corner, 1 at the bottom-right, along the diagonal.
        const k = clamp01((pos.getX(i) / w - pos.getY(i) / h) * 0.7 + 0.5)
        c.copy(from).lerp(to, k)
        colors[i * 3] = c.r
        colors[i * 3 + 1] = c.g
        colors[i * 3 + 2] = c.b
      }
      g.setAttribute('color', new BufferAttribute(colors, 3))
    }
    return g
    // tail and gradient are fresh objects each render; their values (in key) are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, h, r, depth, bevel, lite, key])
  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}

/** The question mark: a tube along a hook-shaped curve, plus a dot. */
function useQuestionMark(lite: boolean) {
  const geometry = useMemo(() => {
    const curve = new CatmullRomCurve3(
      [
        new Vector3(-0.15, 0.12, 0),
        new Vector3(-0.11, 0.22, 0),
        new Vector3(0, 0.27, 0),
        new Vector3(0.12, 0.22, 0),
        new Vector3(0.15, 0.11, 0),
        new Vector3(0.08, 0.02, 0),
        new Vector3(0.01, -0.04, 0),
        new Vector3(0, -0.11, 0),
      ],
      false,
      'catmullrom',
      0.4,
    )
    return new TubeGeometry(curve, lite ? 32 : 64, 0.042, lite ? 8 : 12, false)
  }, [lite])
  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}

/** A soft radial glow drawn once into a small canvas. */
function useGlowTexture() {
  const texture = useMemo(() => {
    const size = 128
    const c = document.createElement('canvas')
    c.width = size
    c.height = size
    const ctx = c.getContext('2d')
    if (ctx) {
      const g = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2,
      )
      g.addColorStop(0, 'rgba(129,216,112,0.55)')
      g.addColorStop(0.45, 'rgba(178,238,158,0.28)')
      g.addColorStop(1, 'rgba(178,238,158,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, size, size)
    }
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    return t
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

/* -------------------------------------------------------------------------- */
/* Pieces                                                                     */
/* -------------------------------------------------------------------------- */

/** A rounded text line on a bubble. Grows from its left end, like text being typed. */
function Line({
  x,
  y,
  z,
  length,
  color,
  innerRef,
}: {
  x: number
  y: number
  z: number
  length: number
  color: string
  innerRef: (g: Group | null) => void
}) {
  const th = 0.13
  return (
    <group position={[x, y, z]} ref={innerRef}>
      <RoundedBox
        args={[length, th, 0.04]}
        radius={th / 2 - 0.005}
        smoothness={3}
        position={[length / 2, 0, 0]}
      >
        <meshStandardMaterial color={color} roughness={0.55} metalness={0} />
      </RoundedBox>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* The cluster                                                                */
/* -------------------------------------------------------------------------- */

/** Rough size of the composition in world units, used to fit it to any canvas. */
const DESIGN_W = 5.0
const DESIGN_H = 4.1
/** Horizontal shift that centres the composition (it is heavier on the left). */
const CENTER_X = 0.12

/** The orbit: a circle in a plane tipped back and turned, so it reads as a slanted ellipse. */
const ORBIT_R = 2.0
/** Tipped back (bottom toward the viewer), then turned; 'ZYX' applies the tip first. */
const ORBIT_TILT = new Euler(-0.5, 0, 0.24, 'ZYX')
const ORBIT_CENTER = new Vector3(0.22, 0.33, 0.05)
/** Where on the orbit (radians) the dark marker dot sits; the dotted lead line meets it. */
const MARKER_ANGLE = -0.09

/** A point on the orbit at angle a, in cluster space. */
const orbitPoint = (a: number) =>
  new Vector3(Math.cos(a) * ORBIT_R, Math.sin(a) * ORBIT_R, 0)
    .applyEuler(ORBIT_TILT)
    .add(ORBIT_CENTER)

function Cluster({
  state,
  motion,
  lite,
}: {
  state: BubbleState
  motion: boolean
  lite: boolean
}) {
  const { viewport } = useThree()

  const root = useRef<Group>(null)
  const glow = useRef<Mesh>(null)
  const ring = useRef<Group>(null)
  const backPanel = useRef<Group>(null)
  const blob = useRef<Group>(null)
  const palePanel = useRef<Group>(null)
  const dark = useRef<Group>(null)
  const glass = useRef<Group>(null)
  const coin = useRef<Group>(null)
  const coinSpin = useRef<Group>(null)
  const lead = useRef<Group>(null)
  const darkLines = useRef<(Group | null)[]>([])
  const glassLines = useRef<(Group | null)[]>([])
  const orbiters = useRef<(Mesh | null)[]>([])
  const start = useRef<number | null>(null)
  const replayed = useRef(-100)

  // Sizes and positions follow the reference artwork at roughly 110px per unit.
  const darkGeo = useSlab({
    w: 2.6,
    h: 1.95,
    r: 0.42,
    depth: 0.3,
    bevel: 0.12,
    tail: { x: -0.88, w: 0.44, tipX: -0.98, h: 0.4 },
    lite,
    gradient: ['#2c5a5c', '#021417'],
  })
  const glassGeo = useSlab({
    w: 2.2,
    h: 1.45,
    r: 0.34,
    depth: 0.2,
    bevel: 0.1,
    tail: { x: 0.48, w: 0.34, tipX: 0.84, h: 0.34 },
    lite,
    gradient: ['#ffffff', '#e4f5de'],
  })
  const backGeo = useSlab({
    w: 1.3,
    h: 1.35,
    r: 0.34,
    depth: 0.06,
    bevel: 0.04,
    lite,
  })
  const blobGeo = useSlab({
    w: 1.15,
    h: 1.4,
    r: 0.56,
    depth: 0.06,
    bevel: 0.05,
    lite,
  })
  const paleGeo = useSlab({
    w: 2.35,
    h: 1.5,
    r: 0.42,
    depth: 0.06,
    bevel: 0.04,
    lite,
  })
  const qGeo = useQuestionMark(lite)
  const glowTex = useGlowTexture()

  // Orbit dots: plane angle, size, colour, and whether they travel. The dark marker stays
  // put so the dotted lead line from the "?" always meets it.
  const dots = useMemo(
    () =>
      [
        { a: 1.35, r: 0.11, color: GREEN, speed: 1 },
        { a: 3.73, r: 0.12, color: GREEN, speed: 1 },
        { a: MARKER_ANGLE, r: 0.1, color: INK, speed: 0 },
        { a: 3.43, r: 0.055, color: INK, speed: 0.6 },
      ] as const,
    [],
  )

  // The dotted lead: from under the "?" to the marker dot, then a short drop below it.
  const leadPoints = useMemo(() => {
    const m = orbitPoint(MARKER_ANGLE)
    return {
      a: [new Vector3(1.6, 0.86, 0.2), new Vector3(m.x, m.y, m.z)] as const,
      b: [
        new Vector3(m.x, m.y - 0.12, m.z),
        new Vector3(m.x, m.y - 0.75, m.z),
      ] as const,
    }
  }, [])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20)
    const now = nowSeconds()
    if (start.current === null) start.current = now
    // Reduced motion shows the finished composition and holds it.
    const t = motion ? now - start.current : 1e4
    const idle = motion ? t : 0

    const pop = (cue: number) => easeOutBack((t - cue) / POP)
    const set = (g: Group | Mesh | null, s: number) => {
      if (!g) return
      const v = Math.max(0.0001, s)
      g.scale.setScalar(v)
      g.visible = s > 0.001
    }

    // Fit the whole composition to the canvas, whatever its aspect.
    const fit = Math.min(
      viewport.width / DESIGN_W,
      viewport.height / DESIGN_H,
      1.06,
    )

    const r = root.current
    if (r) {
      r.scale.setScalar(fit)
      const tx = motion ? state.px * state.on : 0
      const ty = motion ? state.py * state.on : 0
      r.rotation.y = damp(r.rotation.y, tx * 0.3, 4, dt)
      r.rotation.x = damp(r.rotation.x, ty * 0.18, 4, dt)
      // Scrolling away: the cluster drifts up and turns a little, like it is left behind.
      const s = motion ? state.scroll : 0
      r.position.x = CENTER_X * fit
      r.position.y = (s * 1.1 - 0.1) * fit
      r.rotation.z = s * 0.12
    }

    set(glow.current, easeOutCubic((t - CUE.glow) / 1.2))
    set(ring.current, easeOutCubic((t - CUE.ring) / 1.0))
    set(lead.current, easeOutCubic((t - CUE.coin - 0.3) / 0.6))
    set(backPanel.current, pop(CUE.backPanel))
    set(blob.current, pop(CUE.backPanel + 0.08))
    set(palePanel.current, pop(CUE.palePanel))

    const d = dark.current
    if (d) {
      set(d, pop(CUE.dark))
      d.position.y = 0.56 + Math.sin(idle * 0.8) * 0.06
      d.rotation.z = -0.13 + Math.sin(idle * 0.55) * 0.015
      d.position.x = -0.52 + (motion ? state.px * state.on * 0.08 : 0)
    }

    const g = glass.current
    if (g) {
      set(g, pop(CUE.glass))
      g.position.y = -0.38 + Math.sin(idle * 0.9 + 1.3) * 0.07
      g.rotation.z = 0.05 + Math.sin(idle * 0.62 + 0.8) * 0.015
      g.position.x =
        0.7 + (motion ? state.px * state.on * 0.2 + state.scroll * 0.5 : 0)
    }

    // Lines: the question first, then the answer. A hover replays the answer.
    darkLines.current.forEach((l, i) => {
      if (l)
        l.scale.x = Math.max(
          0.0001,
          easeOutCubic((t - CUE.darkLines - i * LINE_GAP) / LINE),
        )
    })
    if (
      motion &&
      state.replayAt > replayed.current &&
      t > CUE.glassLines + 1.2
    ) {
      replayed.current = state.replayAt
    }
    const sinceReplay = now - replayed.current
    glassLines.current.forEach((l, i) => {
      if (!l) return
      const intro = easeOutCubic((t - CUE.glassLines - i * LINE_GAP) / LINE)
      // Retract quickly, then type again.
      const out = 1 - easeOutCubic(sinceReplay / 0.18)
      const back = easeOutCubic((sinceReplay - 0.22 - i * LINE_GAP) / LINE)
      const replay =
        sinceReplay < 2 ? Math.max(sinceReplay < 0.22 ? out : 0, back) : 1
      l.scale.x = Math.max(0.0001, Math.min(intro, replay))
    })

    const c = coin.current
    if (c) {
      set(c, pop(CUE.coin))
      c.position.y = 1.27 + Math.sin(idle * 1.1 + 0.4) * 0.05
    }
    if (coinSpin.current)
      coinSpin.current.rotation.y = -0.25 + Math.sin(idle * 0.7) * 0.35

    // Dots ride the orbit. They pass behind the bubbles, so depth does the layering.
    const reveal = easeOutCubic((t - CUE.ring - 0.3) / 0.8)
    orbiters.current.forEach((m, i) => {
      if (!m) return
      // Dots sway along the orbit around their resting places rather than lapping it.
      const a =
        dots[i].a + Math.sin(idle * 0.45 + i * 1.7) * 0.12 * dots[i].speed
      m.position.set(Math.cos(a) * ORBIT_R, Math.sin(a) * ORBIT_R, 0)
      m.scale.setScalar(Math.max(0.0001, reveal))
    })
  })

  return (
    <group ref={root}>
      {/* Soft light pooled under the cluster. */}
      <mesh ref={glow} position={[0.2, -0.6, -1.6]}>
        <planeGeometry args={[7, 5.5]} />
        <meshBasicMaterial map={glowTex} transparent depthWrite={false} />
      </mesh>

      {/* The orbit, tipped back so it reads as a slanted ellipse that passes behind the bubbles. */}
      <group rotation={ORBIT_TILT} position={ORBIT_CENTER}>
        <group ref={ring}>
          <mesh>
            <torusGeometry args={[ORBIT_R, 0.008, 6, lite ? 120 : 220]} />
            <meshBasicMaterial color={INK} transparent opacity={0.42} />
          </mesh>
        </group>
        {dots.map((dot, i) => (
          <mesh
            key={i}
            ref={(m) => {
              orbiters.current[i] = m
            }}
          >
            <sphereGeometry args={[dot.r, lite ? 16 : 32, lite ? 12 : 24]} />
            <meshPhysicalMaterial
              color={dot.color}
              roughness={0.25}
              clearcoat={1}
              clearcoatRoughness={0.2}
              emissive={dot.color === GREEN ? GREEN : '#000000'}
              emissiveIntensity={dot.color === GREEN ? 0.3 : 0}
            />
          </mesh>
        ))}
      </group>

      {/* Dotted lead from the "?" down to the marker dot. */}
      <group ref={lead}>
        <DashLine
          points={leadPoints.a}
          color={INK}
          lineWidth={1}
          dashed
          dashSize={0.05}
          gapSize={0.05}
          transparent
          opacity={0.5}
        />
        <DashLine
          points={leadPoints.b}
          color={INK}
          lineWidth={1}
          dashed
          dashSize={0.05}
          gapSize={0.05}
          transparent
          opacity={0.5}
        />
      </group>

      {/* Lime slab peeking out to the left of the question. */}
      <group
        ref={backPanel}
        position={[-1.8, 0.62, -0.7]}
        rotation={[0, 0, -0.05]}
      >
        <mesh geometry={backGeo}>
          <meshStandardMaterial
            color="#8fd47c"
            roughness={0.5}
            emissive="#81d870"
            emissiveIntensity={0.15}
          />
        </mesh>
      </group>

      {/* Pale frosted pebble in front of the lime slab, lower down. */}
      <group ref={blob} position={[-1.98, 0.02, -0.35]}>
        <mesh geometry={blobGeo}>
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.3}
            clearcoat={1}
            transparent
            opacity={0.62}
            emissive="#ffffff"
            emissiveIntensity={0.35}
          />
        </mesh>
      </group>

      {/* The question: dark teal bubble with light lines. */}
      <group ref={dark} position={[-0.52, 0.56, 0]} rotation={[0, 0.16, -0.13]}>
        <mesh geometry={darkGeo}>
          <meshPhysicalMaterial
            vertexColors
            roughness={0.3}
            metalness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.2}
          />
        </mesh>
        {[1.75, 1.3, 0.85].map((len, i) => (
          <Line
            key={len}
            x={-0.9}
            y={0.46 - i * 0.36}
            z={0.28}
            length={len}
            color="#86a09f"
            innerRef={(l) => {
              darkLines.current[i] = l
            }}
          />
        ))}
      </group>

      {/* Pale green slab behind the answer, offset down and right. */}
      <group
        ref={palePanel}
        position={[1.13, -0.74, -0.45]}
        rotation={[0, 0, 0.02]}
      >
        <mesh geometry={paleGeo}>
          <meshStandardMaterial
            color="#cfeec6"
            roughness={0.6}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* The answer: frosted white bubble with dark lines. */}
      <group
        ref={glass}
        position={[0.7, -0.38, 0.65]}
        rotation={[0, -0.1, 0.05]}
      >
        <mesh geometry={glassGeo} renderOrder={2}>
          <meshPhysicalMaterial
            vertexColors
            roughness={0.2}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.12}
            transparent
            opacity={0.95}
            emissive="#f4fbf2"
            emissiveIntensity={0.8}
            sheen={1}
            sheenColor={GREEN_SOFT}
            sheenRoughness={0.6}
          />
        </mesh>
        {[
          { len: 1.5, color: '#1f4a4c' },
          { len: 1.1, color: '#1f4a4c' },
          { len: 0.62, color: '#b5cfc0' },
        ].map((l, i) => (
          <Line
            key={i}
            x={-0.82}
            y={0.36 - i * 0.32}
            z={0.22}
            length={l.len}
            color={l.color}
            innerRef={(g) => {
              glassLines.current[i] = g
            }}
          />
        ))}
      </group>

      {/* The question mark coin. */}
      <group ref={coin} position={[1.26, 1.27, 0.3]}>
        <group ref={coinSpin}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.12, lite ? 32 : 64]} />
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.22}
              clearcoat={1}
              clearcoatRoughness={0.15}
              transparent
              opacity={0.95}
              emissive="#f4fbf2"
              emissiveIntensity={0.6}
            />
          </mesh>
          <group position={[0, 0.03, 0.09]} scale={1.15}>
            <mesh geometry={qGeo}>
              <meshStandardMaterial
                color={GREEN}
                roughness={0.3}
                emissive={GREEN}
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[0, -0.21, 0]}>
              <sphereGeometry args={[0.052, 16, 12]} />
              <meshStandardMaterial
                color={GREEN}
                roughness={0.3}
                emissive={GREEN}
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/* Canvas, fallback, error boundary                                           */
/* -------------------------------------------------------------------------- */

class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

type SceneProps = {
  state: BubbleState
  motion: boolean
  /** Fewer segments, no environment reflections and a lower pixel ratio. */
  lite: boolean
  fallback: ReactNode
  /** Called once the first frame is on screen, so the hero can fade the canvas in. */
  onReady?: () => void
}

/**
 * The FAQ hero illustration: a question and an answer as 3D speech bubbles.
 *
 * - Purpose: the page is a conversation. The dark question bubble arrives first, then the
 *   frosted answer bubble types its lines, with a "?" coin and an orbit tying them together.
 * - Camera: perspective, fixed. The cluster is scaled to fit the canvas, so the composition
 *   holds from a narrow phone column to the desktop half-width.
 * - Light: soft key and fill plus a few Lightformers for clearcoat reflections (desktop only;
 *   nothing is fetched over the network).
 * - Motion: entrance pops, slow float, orbiting dots, pointer tilt with layered parallax and a
 *   scroll drift. Hovering the illustration replays the answer. Reduced motion renders the
 *   finished state once.
 * - Cost: the loop runs only while the hero is on screen and the tab is visible, and the
 *   pixel ratio drops to 1 if the frame rate falls.
 * - Failure: no WebGL or any error inside the canvas shows the static SVG fallback instead.
 */
export function FaqHeroScene({
  state,
  motion,
  lite,
  fallback,
  onReady,
}: SceneProps) {
  const supported = useWebGLSupport()
  const [ref, live] = useInView<HTMLDivElement>()
  // Drops to 1x pixels if the device cannot keep up, so the page stays smooth.
  const [degraded, setDegraded] = useState(false)

  if (!supported) return <>{fallback}</>

  return (
    <div ref={ref} className="dk-fh__canvas" aria-hidden="true">
      <SceneBoundary fallback={fallback}>
        <Canvas
          dpr={degraded ? 1 : lite ? [1, 1.5] : [1, 1.75]}
          frameloop={live && motion ? 'always' : 'demand'}
          camera={{ position: [0, 0, 10], fov: 32, near: 0.1, far: 50 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: lite ? 'low-power' : 'high-performance',
          }}
          style={{ position: 'absolute', inset: 0 }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
            // Let the browser restore the context rather than leaving the canvas dead.
            gl.domElement.addEventListener('webglcontextlost', (e) =>
              e.preventDefault(),
            )
            requestAnimationFrame(() => onReady?.())
          }}
        >
          <PerformanceMonitor onDecline={() => setDegraded(true)} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[-4, 6, 7]} intensity={1.7} />
          <directionalLight
            position={[5, -3, 4]}
            intensity={0.45}
            color={GREEN_SOFT}
          />
          <pointLight
            position={[0, 0, -3]}
            intensity={6}
            distance={9}
            color={GREEN}
          />
          {!lite && (
            <Environment resolution={64} frames={1}>
              <Lightformer
                form="rect"
                intensity={2.2}
                position={[-4, 4, 6]}
                scale={[6, 3, 1]}
              />
              <Lightformer
                form="rect"
                intensity={1.2}
                color={GREEN_SOFT}
                position={[5, -2, 4]}
                scale={[4, 4, 1]}
              />
              <Lightformer
                form="circle"
                intensity={1.5}
                position={[0, 6, -4]}
                scale={3}
              />
            </Environment>
          )}
          <Cluster state={state} motion={motion} lite={lite} />
        </Canvas>
      </SceneBoundary>
    </div>
  )
}
