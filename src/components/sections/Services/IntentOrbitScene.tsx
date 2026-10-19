import { Component, useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  Mesh,
  ShaderMaterial,
  Vector3,
} from 'three'

import { useWebGLSupport } from '@/hooks/useWebGLSupport'
import { useInView } from '@/lib/useInView'

/**
 * Geometry of the composition, in design pixels measured from the sphere centre (y up).
 * The CSS fallback in IntentSection.css uses the same numbers: keep them in sync.
 */
export const ORBIT = {
  sphere: 144, // radius
  ring: 266, // circular orbit radius
  pillLength: 936,
  pillThickness: 223,
  pillAngle: (20 * Math.PI) / 180,
  pillZ: -70, // behind the sphere, so the sphere hides the part of the ring it overlaps
  equator: 170,
  equatorTilt: 1.14,
} as const

/** Orbiting dots start where the design puts them. Angles are in radians, CCW from +x. */
const DOT_A = Math.atan2(273, 38) // top, on the circular orbit
const DOT_C = Math.atan2(-210, 177) // bottom right, on the circular orbit
const PILL_START = 151.5 // distance along the stadium path where the third dot starts

const GREEN = '#81d870'
const RING_OPACITY = 0.24
const EQUATOR_OPACITY = 0.16

/**
 * State shared between the section (pointer events and the GSAP timeline write it) and the
 * scene (reads it each frame), so neither causes React renders.
 */
export type OrbitState = {
  /** Pointer position inside the stage, -1..1 on both axes. */
  px: number
  py: number
  /** 0 → 1 entrance progress, driven by GSAP. */
  intro: number
  /** Set by the scene so a paused render loop can be woken. */
  invalidate: (() => void) | null
}

export const createOrbitState = (intro = 0): OrbitState => ({
  px: 0,
  py: 0,
  intro,
  invalidate: null,
})

/* ------------------------------------------------------------------------------------------
 * Sphere: a real mesh with its own shader so the glossy green look matches the design exactly.
 * The light sits up and to the left; pointer movement nudges it, so the highlight follows.
 * ---------------------------------------------------------------------------------------- */

const SPHERE_VERT = /* glsl */ `
  varying vec3 vN;
  void main() {
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Colours are written as sRGB values on purpose (no colorspace include) so they match the design.
const SPHERE_FRAG = /* glsl */ `
  varying vec3 vN;
  uniform vec3 uLight;
  uniform float uIntro;
  void main() {
    vec3 n = normalize(vN);
    vec3 l = normalize(uLight);
    vec3 v = vec3(0.0, 0.0, 1.0);
    float lam = dot(n, l);

    vec3 deep = vec3(0.035, 0.140, 0.098);
    vec3 mid  = vec3(0.208, 0.478, 0.227);
    vec3 col = mix(deep, mid, smoothstep(-0.20, 0.95, lam));

    // Broad soft highlight, then the tight specular spot.
    col = mix(col, vec3(0.45, 0.80, 0.40), smoothstep(0.62, 1.0, lam) * 0.55);
    vec3 h = normalize(l + v);
    float nh = max(dot(n, h), 0.0);
    col += vec3(0.50, 0.44, 0.48) * pow(nh, 48.0);
    col += vec3(0.50, 0.90, 0.45) * pow(nh, 8.0) * 0.10;

    // The side away from the light falls off into the dark.
    col *= 1.0 - pow(1.0 - max(n.z, 0.0), 2.5) * 0.35;

    gl_FragColor = vec4(col, uIntro);
  }
`

function Sphere({ state, motion }: { state: OrbitState; motion: boolean }) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: SPHERE_VERT,
        fragmentShader: SPHERE_FRAG,
        transparent: true,
        uniforms: { uLight: { value: new Vector3(-0.552, 0.442, 0.693) }, uIntro: { value: 1 } },
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])

  const mesh = useRef<Mesh>(null)
  useFrame(() => {
    const e = state.intro
    material.uniforms.uIntro.value = e
    const s = 0.9 + 0.1 * e
    mesh.current?.scale.setScalar(s)
    if (motion) {
      material.uniforms.uLight.value.set(-0.552 + state.px * 0.22, 0.442 - state.py * 0.18, 0.693)
    }
  })

  return (
    <mesh ref={mesh} material={material} renderOrder={1}>
      <sphereGeometry args={[ORBIT.sphere, 96, 64]} />
    </mesh>
  )
}

/* ------------------------------------------------------------------------------------------
 * Orbit lines and travelling dots
 * ---------------------------------------------------------------------------------------- */

function circlePoints(radius: number, segments = 256): number[] {
  const out: number[] = []
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2
    out.push(Math.cos(a) * radius, Math.sin(a) * radius, 0)
  }
  return out
}

/** Stadium (pill) outline, centred on the origin, long axis along x. */
const HALF_STRAIGHT = (ORBIT.pillLength - ORBIT.pillThickness) / 2
const CAP = ORBIT.pillThickness / 2
const PILL_PERIMETER = 4 * HALF_STRAIGHT + 2 * Math.PI * CAP

/** Position at distance `d` along the pill, counter-clockwise from the bottom-left of the flat. */
function pillAt(d: number, out: Vector3): Vector3 {
  const flat = 2 * HALF_STRAIGHT
  const arc = Math.PI * CAP
  let t = ((d % PILL_PERIMETER) + PILL_PERIMETER) % PILL_PERIMETER
  let x: number
  let y: number
  if (t < flat) {
    x = -HALF_STRAIGHT + t
    y = -CAP
  } else if ((t -= flat) < arc) {
    const a = -Math.PI / 2 + t / CAP
    x = HALF_STRAIGHT + Math.cos(a) * CAP
    y = Math.sin(a) * CAP
  } else if ((t -= arc) < flat) {
    x = HALF_STRAIGHT - t
    y = CAP
  } else {
    t -= flat
    const a = Math.PI / 2 + t / CAP
    x = -HALF_STRAIGHT + Math.cos(a) * CAP
    y = Math.sin(a) * CAP
  }
  const c = Math.cos(ORBIT.pillAngle)
  const s = Math.sin(ORBIT.pillAngle)
  return out.set(x * c - y * s, x * s + y * c, ORBIT.pillZ)
}

function pillPoints(segments = 360): number[] {
  const v = new Vector3()
  const out: number[] = []
  for (let i = 0; i < segments; i++) {
    pillAt((i / segments) * PILL_PERIMETER, v)
    out.push(v.x, v.y, v.z)
  }
  return out
}

const DOT_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const DOT_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uAlpha;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float core = 1.0 - smoothstep(0.17, 0.23, d);
    float halo = exp(-d * d * 7.0) * 0.55;
    float a = clamp(core + halo, 0.0, 1.0) * (1.0 - smoothstep(0.85, 1.0, d)) * uAlpha;
    gl_FragColor = vec4(mix(uColor, vec3(1.0), core * 0.18), a);
  }
`

function Dot({ material, refObj }: { material: ShaderMaterial; refObj: RefObject<Mesh | null> }) {
  return (
    <mesh ref={refObj} material={material} renderOrder={4}>
      <planeGeometry args={[64, 64]} />
    </mesh>
  )
}

function Orbits({ state, motion }: { state: OrbitState; motion: boolean }) {
  const group = useRef<Group>(null)
  const dotA = useRef<Mesh>(null)
  const dotB = useRef<Mesh>(null)
  const dotC = useRef<Mesh>(null)
  const pill = useRef(PILL_START)
  const angle = useRef(0)
  const scratch = useMemo(() => new Vector3(), [])

  const { ringGeo, pillGeo, equatorGeo, lineMat, equatorMat, dotMat } = useMemo(() => {
    const make = (pts: number[]) => {
      const g = new BufferGeometry()
      g.setAttribute('position', new Float32BufferAttribute(pts, 3))
      return g
    }
    return {
      ringGeo: make(circlePoints(ORBIT.ring)),
      pillGeo: make(pillPoints()),
      equatorGeo: make(circlePoints(ORBIT.equator)),
      lineMat: new LineBasicMaterial({ color: GREEN, transparent: true, opacity: RING_OPACITY }),
      equatorMat: new LineBasicMaterial({
        color: GREEN,
        transparent: true,
        opacity: EQUATOR_OPACITY,
        depthTest: false,
      }),
      dotMat: new ShaderMaterial({
        vertexShader: DOT_VERT,
        fragmentShader: DOT_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: { uColor: { value: new Color(GREEN) }, uAlpha: { value: 1 } },
      }),
    }
  }, [])

  useEffect(
    () => () => {
      ringGeo.dispose()
      pillGeo.dispose()
      equatorGeo.dispose()
      lineMat.dispose()
      equatorMat.dispose()
      dotMat.dispose()
    },
    [ringGeo, pillGeo, equatorGeo, lineMat, equatorMat, dotMat],
  )

  useFrame((_, dt) => {
    const e = state.intro
    lineMat.opacity = RING_OPACITY * e
    equatorMat.opacity = EQUATOR_OPACITY * e
    dotMat.uniforms.uAlpha.value = e

    const g = group.current
    if (g) {
      g.scale.setScalar(0.94 + 0.06 * e)
      if (motion) {
        // Ease toward the pointer; the rings sit at different depths so this reads as parallax.
        const k = 1 - Math.exp(-dt * 4)
        g.rotation.y += (state.px * 0.14 - g.rotation.y) * k
        g.rotation.x += (state.py * 0.1 - g.rotation.x) * k
      }
    }

    if (motion) {
      angle.current += dt * 0.11
      pill.current += dt * 75
    }
    const r = ORBIT.ring
    dotA.current?.position.set(
      Math.cos(DOT_A + angle.current) * r,
      Math.sin(DOT_A + angle.current) * r,
      0,
    )
    dotC.current?.position.set(
      Math.cos(DOT_C + angle.current) * r,
      Math.sin(DOT_C + angle.current) * r,
      0,
    )
    dotB.current?.position.copy(pillAt(pill.current, scratch))
  })

  return (
    <group ref={group} rotation={[0, 0, 0]}>
      <lineLoop geometry={ringGeo} material={lineMat} renderOrder={2} />
      <lineLoop geometry={pillGeo} material={lineMat} renderOrder={2} />
      <group rotation={[-ORBIT.equatorTilt, 0, 0.05]}>
        <lineLoop geometry={equatorGeo} material={equatorMat} renderOrder={3} />
      </group>
      <Dot material={dotMat} refObj={dotA} />
      <Dot material={dotMat} refObj={dotB} />
      <Dot material={dotMat} refObj={dotC} />
    </group>
  )
}

/** Fit the orthographic camera so one world unit is one design pixel at any stage size. */
function Fit({ designWidth, state }: { designWidth: number; state: OrbitState }) {
  const { camera, size, invalidate } = useThree()
  useEffect(() => {
    camera.zoom = size.width / designWidth
    camera.updateProjectionMatrix()
    invalidate()
  }, [camera, size.width, designWidth, invalidate])
  useEffect(() => {
    state.invalidate = invalidate
    return () => {
      state.invalidate = null
    }
  }, [state, invalidate])
  return null
}

/** A scene error must never take the page down; the CSS fallback shows instead. */
class SceneBoundary extends Component<
  { children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFail()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

type SceneProps = {
  state: OrbitState
  motion: boolean
  /** Width of the design frame in design pixels (the stage is scaled to fit). */
  designWidth: number
  onStatus: (s: 'ok' | 'fail') => void
}

/**
 * Glossy sphere at the centre of two orbit paths, with three dots travelling along them.
 *
 * - Purpose: the section is about connecting intent to value; the sphere is the business,
 *   the orbits are the signals (searches) that reach it.
 * - Camera: orthographic, one world unit per design pixel, so it lines up with the HTML chips.
 * - Interaction: the rings tilt and the light moves with the pointer (mouse and pen only).
 * - Loop: runs only while the stage is on screen and the tab is visible, otherwise on demand.
 *   With reduced motion it draws the finished composition once and stays still.
 * - Fallback: no WebGL, or any scene error, reports through `onStatus` and the section draws
 *   a CSS version of the same picture.
 */
export function IntentOrbitScene({ state, motion, designWidth, onStatus }: SceneProps) {
  const supported = useWebGLSupport()
  const [ref, live] = useInView<HTMLDivElement>()

  useEffect(() => {
    if (!supported) onStatus('fail')
  }, [supported, onStatus])

  if (!supported) return null

  return (
    <div ref={ref} className="dk-io__canvas" aria-hidden="true">
      <SceneBoundary onFail={() => onStatus('fail')}>
        <Canvas
          orthographic
          dpr={[1, 2]}
          frameloop={live && motion ? 'always' : 'demand'}
          camera={{ position: [0, 0, 1000], near: 0.1, far: 3000, zoom: 1 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
          style={{ position: 'absolute', inset: 0 }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
            gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault())
            onStatus('ok')
          }}
        >
          <Fit designWidth={designWidth} state={state} />
          <Orbits state={state} motion={motion} />
          <Sphere state={state} motion={motion} />
        </Canvas>
      </SceneBoundary>
    </div>
  )
}
