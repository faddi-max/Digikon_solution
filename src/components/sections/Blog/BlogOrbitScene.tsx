import { Component, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute, type Group, type Points } from 'three'

import { useWebGLSupport } from '@/hooks/useWebGLSupport'
import { useInView } from '@/lib/useInView'

/** Stage size in design px. Must match BlogStage. */
export const STAGE_W = 560
export const STAGE_H = 340

/** Orbit ellipse, in stage px (y down), measured from the design. */
const ORBIT = { cx: 276, cy: 187, rx: 254, ry: 105, tilt: -0.2 }
const SPARKS = 16

export type BlogSceneState = {
  px: number
  py: number
  intro: number
  invalidate: (() => void) | null
}
export const createBlogSceneState = (): BlogSceneState => ({ px: 0, py: 0, intro: 0, invalidate: null })

function ellipsePoints(rx: number, ry: number, seg = 220) {
  const p: number[] = []
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2
    p.push(Math.cos(a) * rx, Math.sin(a) * ry, 0)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(p, 3))
  return g
}

const seed = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

function Orbit({ state, motion }: { state: BlogSceneState; motion: boolean }) {
  const { invalidate } = useThree()
  const group = useRef<Group>(null)
  const dot = useRef<Group>(null)
  const sparks = useRef<Points>(null)
  const mats = useRef<{ opacity: number }[]>([])

  const rings = useMemo(
    () => [ellipsePoints(ORBIT.rx, ORBIT.ry), ellipsePoints(ORBIT.rx + 1.4, ORBIT.ry + 1.4)],
    [],
  )
  const sparkGeo = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(new Float32Array(SPARKS * 3), 3))
    return g
  }, [])
  useEffect(
    () => () => {
      rings.forEach((g) => g.dispose())
      sparkGeo.dispose()
    },
    [rings, sparkGeo],
  )
  useEffect(() => {
    state.invalidate = invalidate
    invalidate()
    return () => {
      state.invalidate = null
    }
  }, [state, invalidate])

  useFrame(({ clock }, dt) => {
    const t = motion ? clock.elapsedTime : 0
    const e = 1 - Math.pow(1 - Math.min(1, state.intro), 3)

    mats.current.forEach((m, i) => {
      if (m) m.opacity = (i === 0 ? 0.75 : 0.35) * e
    })

    const g = group.current
    if (g) {
      const k = 1 - Math.exp(-dt * 4)
      g.position.x += (state.px * 9 - g.position.x) * k
      g.position.y += (-state.py * 6 - g.position.y) * k
    }

    // The dot rides the ellipse, in the tilted frame.
    const a = t * 0.45 + 0.6
    const x = Math.cos(a) * ORBIT.rx
    const y = Math.sin(a) * ORBIT.ry
    dot.current?.position.set(x, y, 0)
    dot.current?.scale.setScalar(Math.max(0.0001, e))

    // Sparkles drift upward and wrap.
    const pos = sparkGeo.getAttribute('position') as Float32BufferAttribute
    for (let i = 0; i < SPARKS; i++) {
      const px = (seed(i) - 0.5) * STAGE_W * 0.9
      const rise = motion ? (t * (6 + seed(i + 9) * 10)) % STAGE_H : 0
      let py = (seed(i + 31) - 0.5) * STAGE_H + rise
      if (py > STAGE_H / 2) py -= STAGE_H
      pos.setXYZ(i, px + (motion ? Math.sin(t * 0.6 + i) * 6 : 0), py, 0)
    }
    pos.needsUpdate = true
    if (sparks.current) (sparks.current.material as { opacity: number }).opacity = 0.5 * e
  })

  return (
    <group ref={group}>
      <group position={[ORBIT.cx - STAGE_W / 2, STAGE_H / 2 - ORBIT.cy, 0]} rotation={[0, 0, ORBIT.tilt]}>
        {rings.map((geo, i) => (
          <lineLoop key={i} geometry={geo}>
            <lineBasicMaterial
              ref={(m) => {
                if (m) mats.current[i] = m
              }}
              color="#81d870"
              transparent
              opacity={0}
            />
          </lineLoop>
        ))}
        <group ref={dot}>
          <mesh>
            <circleGeometry args={[11, 24]} />
            <meshBasicMaterial color="#81d870" transparent opacity={0.22} />
          </mesh>
          <mesh>
            <circleGeometry args={[4.2, 20]} />
            <meshBasicMaterial color="#b2ee9e" />
          </mesh>
        </group>
      </group>
      <points ref={sparks} geometry={sparkGeo} frustumCulled={false}>
        <pointsMaterial color="#b2ee9e" size={3} sizeAttenuation={false} transparent opacity={0} depthWrite={false} />
      </points>
    </group>
  )
}

/** Fit the orthographic camera so one world unit is one stage design px. */
function Fit() {
  const { camera, size, invalidate } = useThree()
  useEffect(() => {
    camera.zoom = size.width / STAGE_W
    camera.updateProjectionMatrix()
    invalidate()
  }, [camera, size.width, invalidate])
  return null
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

/** Static ellipse, same geometry, used when WebGL is missing or fails. */
function OrbitFallback() {
  return (
    <svg className="absolute inset-0 size-full" viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} fill="none" aria-hidden="true">
      <ellipse
        cx={ORBIT.cx}
        cy={ORBIT.cy}
        rx={ORBIT.rx}
        ry={ORBIT.ry}
        stroke="#81d870"
        strokeOpacity="0.7"
        strokeWidth="1.4"
        transform={`rotate(${(-ORBIT.tilt * 180) / Math.PI} ${ORBIT.cx} ${ORBIT.cy})`}
      />
    </svg>
  )
}

/**
 * The green orbit behind the dashboard: a tilted ellipse with a travelling dot and drifting
 * sparkles, tilting a few px with the pointer. Orthographic camera, one world unit per stage
 * design px, so it lines up with the HTML cards at any width. Renders only while on screen
 * and with motion allowed; otherwise on demand (one still frame).
 */
export function BlogOrbitScene({ state, motion }: { state: BlogSceneState; motion: boolean }) {
  const supported = useWebGLSupport()
  const [ref, live] = useInView<HTMLDivElement>()

  if (!supported) return <OrbitFallback />

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0" aria-hidden="true">
      <SceneBoundary fallback={<OrbitFallback />}>
        <Canvas
          orthographic
          dpr={[1, 1.75]}
          frameloop={live && motion ? 'always' : 'demand'}
          camera={{ position: [0, 0, 10], zoom: 1 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
          style={{ position: 'absolute', inset: 0 }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
            gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault())
          }}
        >
          <Fit />
          <Orbit state={state} motion={motion} />
        </Canvas>
      </SceneBoundary>
    </div>
  )
}