import { Component, useEffect, useMemo, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Color, ShaderMaterial, Vector2 } from 'three'

import { useWebGLSupport } from '@/hooks/useWebGLSupport'
import { useInView } from '@/lib/useInView'

/** Must match the CSS grid on .dk-sh (background-size). */
export const GRID_PITCH = 40
const DOT = 4.2
const POINTER_RADIUS = 170
const PULSE_SPEED = 300
const PULSE_LIFE = 3.2

/**
 * State shared between the hero (which writes it from DOM events and the GSAP timeline) and
 * the scene (which reads it every frame), so pointer moves cause no React renders.
 */
export type GlowState = {
  /** Pointer position in hero pixels, and 1 while a mouse or pen is over the hero. */
  px: number
  py: number
  on: number
  /** Where pulses start, in hero pixels, and when the latest one started (seconds). */
  originX: number
  originY: number
  pulseAt: number
  /** Set by the scene so a paused render loop can be woken. */
  invalidate: (() => void) | null
}

export const createGlowState = (): GlowState => ({
  px: -9999,
  py: -9999,
  on: 0,
  originX: 0,
  originY: 0,
  pulseAt: -100,
  invalidate: null,
})

export const nowSeconds = () => performance.now() / 1000

const VERT = /* glsl */ `
  uniform vec2 uRes;
  uniform vec2 uPointer;
  uniform float uPointerOn;
  uniform vec2 uOrigin;
  uniform float uAge;
  uniform float uSize;
  varying float vI;

  void main() {
    vec2 p = position.xy;

    // Glow around the pointer.
    float glow = uPointerOn * (1.0 - smoothstep(0.0, ${POINTER_RADIUS.toFixed(1)}, distance(p, uPointer)));

    // A ring that spreads from the rank badge and fades as it goes.
    float e = (distance(p, uOrigin) - uAge * ${PULSE_SPEED.toFixed(1)}) / 38.0;
    float life = 1.0 - clamp(uAge / ${PULSE_LIFE.toFixed(1)}, 0.0, 1.0);
    float ring = (uAge >= 0.0 ? exp(-e * e) * life : 0.0);

    vI = clamp(max(glow * 0.95, ring * 0.85), 0.0, 1.0);

    gl_PointSize = uSize * (1.0 + vI * 1.2);
    gl_Position = vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0);
  }
`

const FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vI;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, d) * min(1.0, vI * 1.5);
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`

function Dots({ state, motion }: { state: GlowState; motion: boolean }) {
  const { size, gl, invalidate } = useThree()

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uRes: { value: new Vector2(1, 1) },
          uPointer: { value: new Vector2(-9999, -9999) },
          uPointerOn: { value: 0 },
          uOrigin: { value: new Vector2() },
          uAge: { value: -1 },
          uSize: { value: DOT },
          uColor: { value: new Color('#81d870') },
        },
      }),
    [],
  )

  // One dot at every crossing of the CSS grid.
  const positions = useMemo(() => {
    const cols = Math.floor(size.width / GRID_PITCH) + 1
    const rows = Math.floor(size.height / GRID_PITCH) + 1
    const out = new Float32Array(cols * rows * 3)
    let i = 0
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // +0.5 centres the dot on the 1px grid line.
        out[i++] = x * GRID_PITCH + 0.5
        out[i++] = y * GRID_PITCH + 0.5
        out[i++] = 0
      }
    }
    return out
  }, [size.width, size.height])

  useEffect(() => {
    state.invalidate = invalidate
    return () => {
      state.invalidate = null
    }
  }, [state, invalidate])

  useEffect(() => () => material.dispose(), [material])

  useFrame((_, dt) => {
    const u = material.uniforms
    u.uRes.value.set(size.width, size.height)
    u.uSize.value = DOT * gl.getPixelRatio()
    u.uPointer.value.set(state.px, state.py)
    // Ease the glow in and out instead of snapping.
    const target = motion ? state.on : 0
    u.uPointerOn.value += (target - u.uPointerOn.value) * (1 - Math.exp(-dt * 8))
    u.uOrigin.value.set(state.originX, state.originY)
    u.uAge.value = motion ? nowSeconds() - state.pulseAt : -1
  })

  return (
    <points key={positions.length} frustumCulled={false} material={material}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
    </points>
  )
}

/** The glow is an extra. If WebGL fails for any reason the CSS grid alone remains. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

type SceneProps = { state: GlowState; motion: boolean }

/**
 * Pointer and pulse glow on the hero's grid crossings.
 *
 * - Purpose: the page is about being found; the grid lights up where you look and sends a
 *   signal out from the #1 result.
 * - Camera: none. Dots are placed in CSS pixels straight into clip space, so they line up
 *   with the CSS grid at any size.
 * - Loop: runs only while the hero is on screen and motion is allowed; otherwise it renders
 *   on demand. Touch devices keep the pulses and lose the pointer glow.
 */
export function ServiceHeroScene({ state, motion }: SceneProps) {
  const supported = useWebGLSupport()
  const [ref, live] = useInView<HTMLDivElement>()

  if (!supported || !motion) return null

  return (
    <div ref={ref} className="dk-sh__scene" aria-hidden="true">
      <SceneBoundary>
        <Canvas
          orthographic
          dpr={[1, 1.75]}
          frameloop={live ? 'always' : 'demand'}
          gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
          style={{ position: 'absolute', inset: 0 }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
            // Let the browser restore the context rather than leaving the canvas dead.
            gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault())
          }}
        >
          <Dots state={state} motion={motion} />
        </Canvas>
      </SceneBoundary>
    </div>
  )
}
