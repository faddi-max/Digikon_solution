import {
  Component,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute, type Group, type Mesh } from 'three'

import { useWebGLSupport } from '@/hooks/useWebGLSupport'
import { useInView } from '@/lib/useInView'

type Pt = { x: number; y: number }

function circle(r: number, seg = 180) {
  const p: number[] = []
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2
    p.push(Math.cos(a) * r, Math.sin(a) * r, 0)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(p, 3))
  return g
}

/**
 * Two orbit rings sit where the design's circles are, as a share of the section size. A short
 * bright arc and a dot travel each ring, and the whole set drifts a few pixels with the pointer.
 */
function Rings({ motion, pointer }: { motion: boolean; pointer: MutableRefObject<Pt> }) {
  const { size } = useThree()
  const w = size.width
  const h = size.height
  const R1 = w * 0.19
  const R2 = w * 0.09
  const c1: [number, number, number] = [w * 0.424, h / 2, 0]
  const c2: [number, number, number] = [w * 0.379, -h / 2 + 0.1 * h - R2, 0]

  const geos = useMemo(
    () => [circle(R1), circle(R1 * 1.1), circle(R1 * 1.19), circle(R2)],
    [R1, R2],
  )
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos])

  const group = useRef<Group>(null)
  const arc1 = useRef<Mesh>(null)
  const arc2 = useRef<Mesh>(null)
  const dot1 = useRef<Mesh>(null)
  const dot2 = useRef<Mesh>(null)
  const mats = useRef<{ opacity: number }[]>([])
  const base = [0.16, 0.07, 0.04, 0.2]

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const intro = motion ? Math.min(1, t / 1.8) : 1
    const e = 1 - Math.pow(1 - intro, 3)
    mats.current.forEach((m, i) => {
      if (m) m.opacity = base[i] * e
    })

    const g = group.current
    if (g && motion) {
      const k = 1 - Math.exp(-dt * 3)
      g.position.x += (pointer.current.x * 12 - g.position.x) * k
      g.position.y += (-pointer.current.y * 9 - g.position.y) * k
    }

    const spin = motion ? t : 0
    if (arc1.current) arc1.current.rotation.z = -spin * 0.28
    if (arc2.current) arc2.current.rotation.z = spin * 0.4
    const a1 = -spin * 0.28 + 0.55
    const a2 = spin * 0.4 + 0.55
    dot1.current?.position.set(c1[0] + Math.cos(a1) * R1, c1[1] + Math.sin(a1) * R1, 0)
    dot2.current?.position.set(c2[0] + Math.cos(a2) * R2, c2[1] + Math.sin(a2) * R2, 0)
  })

  const ringAt = (c: [number, number, number], i: number) => (
    <lineLoop geometry={geos[i]} position={c}>
      <lineBasicMaterial
        ref={(m) => {
          if (m) mats.current[i] = m
        }}
        color="#81d870"
        transparent
        opacity={0}
      />
    </lineLoop>
  )

  return (
    <group ref={group}>
      {ringAt(c1, 0)}
      {ringAt(c1, 1)}
      {ringAt(c1, 2)}
      {ringAt(c2, 3)}

      <mesh ref={arc1} position={c1}>
        <ringGeometry args={[R1 - 1, R1 + 1, 160, 1, 0, 1.1]} />
        <meshBasicMaterial color="#81d870" transparent opacity={0.85} />
      </mesh>
      <mesh ref={arc2} position={c2}>
        <ringGeometry args={[R2 - 1, R2 + 1, 120, 1, 0, 1.4]} />
        <meshBasicMaterial color="#b2ee9e" transparent opacity={0.7} />
      </mesh>
      <mesh ref={dot1}>
        <circleGeometry args={[3.5, 20]} />
        <meshBasicMaterial color="#b2ee9e" />
      </mesh>
      <mesh ref={dot2}>
        <circleGeometry args={[3, 20]} />
        <meshBasicMaterial color="#81d870" />
      </mesh>
    </group>
  )
}

/** A scene error must never take the page down; the CSS rings stay as the fallback. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function TeamBackdrop({ motion, onReady }: { motion: boolean; onReady: () => void }) {
  const supported = useWebGLSupport()
  const [ref, live] = useInView<HTMLDivElement>()
  const pointer = useRef<Pt>({ x: 0, y: 0 })

  useEffect(() => {
    if (!motion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [motion])

  if (!supported) return null

  return (
    <div ref={ref} className="dk-tp__canvas" aria-hidden="true">
      <SceneBoundary>
        <Canvas
          orthographic
          dpr={[1, 1.75]}
          frameloop={live && motion ? 'always' : 'demand'}
          camera={{ position: [0, 0, 10], zoom: 1 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
            gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault())
            requestAnimationFrame(onReady)
          }}
        >
          <Rings motion={motion} pointer={pointer} />
        </Canvas>
      </SceneBoundary>
    </div>
  )
}