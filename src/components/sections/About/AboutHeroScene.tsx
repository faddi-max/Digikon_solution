import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  PlaneGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  type Group,
  type Texture,
} from 'three'

import chartSrc from '@/assets/images/testimonials-chart.png'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useWebGLSupport } from '@/hooks/useWebGLSupport'
import { useInView } from '@/lib/useInView'

import { GridField } from './AboutGridBackground'
import { CHART_NODES, type HeroSceneState } from './aboutHeroLayout'

/** Resting opacity of the artwork. The pointer lifts it locally. */
const BASE_OPACITY = 0.3
/** Px the chart lags behind the page as the hero scrolls away. It reads as depth. */
const SCROLL_LAG = 36
/** Pointer distance, in px, over which a node starts to respond. */
const NEAR_INNER = 70
const NEAR_OUTER = 200
/** Halo size of a node in CSS px, at a 1440px-wide hero. */
const NODE_SIZE = 64

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/* -------------------------------------------------------------------------- */
/* Shaders                                                                    */
/* -------------------------------------------------------------------------- */

const CHART_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Three things happen to the artwork here:
 *  1. A feathered wipe reveals the curve from left to right, with a bright leading edge.
 *  2. A soft band follows the pointer along the curve and lifts the glow under it.
 *  3. Everything is masked by the artwork's own alpha, so only the curve and its area light up.
 */
const CHART_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uReveal;
  uniform float uBase;
  uniform float uHover;
  uniform float uPointerU;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uMap, vUv);

    float front = mix(-0.15, 1.15, uReveal);
    float vis = 1.0 - smoothstep(front - 0.12, front, vUv.x);

    float e = (vUv.x - front + 0.03) / 0.045;
    float lead = exp(-e * e) * (1.0 - smoothstep(0.9, 1.0, uReveal));

    float d = vUv.x - uPointerU;
    float band = exp(-(d * d) / (2.0 * 0.085 * 0.085)) * uHover;

    vec3 rgb = tex.rgb * (1.0 + 0.85 * band);
    rgb += vec3(0.42, 0.8, 0.36) * lead * tex.a * 0.5;

    float alpha = tex.a * mix(uBase, min(1.0, uBase + 0.55), band) * vis;
    alpha += lead * tex.a * 0.3;

    gl_FragColor = vec4(rgb, clamp(alpha, 0.0, 1.0));
    #include <colorspace_fragment>
  }
`

const NODE_VERT = /* glsl */ `
  attribute float aU;
  attribute float aSeed;
  attribute float aNear;
  uniform float uReveal;
  uniform float uSize;
  uniform float uPx;
  varying float vVis;
  varying float vSeed;
  varying float vNear;

  void main() {
    float front = mix(-0.15, 1.15, uReveal);
    vVis = 1.0 - smoothstep(front - 0.12, front, aU);
    vSeed = aSeed;
    vNear = aNear;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * uPx * (1.0 + 0.45 * aNear);
  }
`

/** A soft halo plus one expanding ring per node. The artwork already draws the white dot. */
const NODE_FRAG = /* glsl */ `
  uniform float uTime;
  varying float vVis;
  varying float vSeed;
  varying float vNear;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;

    float t = fract(uTime * 0.22 + vSeed);
    float ringR = mix(0.28, 0.98, t);
    float ring = smoothstep(0.07, 0.0, abs(d - ringR)) * (1.0 - t);
    float halo = smoothstep(1.0, 0.1, d) * (0.16 + 0.34 * vNear);

    float alpha = (halo + ring * (0.55 + 0.45 * vNear)) * vVis;
    gl_FragColor = vec4(0.506, 0.847, 0.439, alpha);
    #include <colorspace_fragment>
  }
`

/* -------------------------------------------------------------------------- */
/* 3D layer                                                                   */
/* -------------------------------------------------------------------------- */

type LayerProps = {
  texture: Texture
  state: RefObject<HeroSceneState>
  motion: boolean
}

function ChartLayer({ texture, state, motion }: LayerProps) {
  const { size, gl, invalidate } = useThree()
  const group = useRef<Group>(null)

  const planeGeo = useMemo(() => new PlaneGeometry(1, 1), [])

  const chartMat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        uniforms: {
          uMap: { value: texture },
          uReveal: { value: 0 },
          uBase: { value: BASE_OPACITY },
          uHover: { value: 0 },
          uPointerU: { value: -1 },
        },
        vertexShader: CHART_VERT,
        fragmentShader: CHART_FRAG,
      }),
    [texture],
  )

  const nodes = useMemo(() => {
    const count = CHART_NODES.length
    const position = new Float32Array(count * 3)
    const aU = new Float32Array(count)
    const aSeed = new Float32Array(count)
    CHART_NODES.forEach(([u, v], i) => {
      // Local units of a 1 x 1 plane. The parent group scales them to the chart size.
      position[i * 3] = u - 0.5
      position[i * 3 + 1] = 0.5 - v
      position[i * 3 + 2] = 0
      aU[i] = u
      aSeed[i] = (i * 0.618034) % 1
    })
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(position, 3))
    geometry.setAttribute('aU', new BufferAttribute(aU, 1))
    geometry.setAttribute('aSeed', new BufferAttribute(aSeed, 1))
    const near = new BufferAttribute(new Float32Array(count), 1)
    near.setUsage(DynamicDrawUsage)
    geometry.setAttribute('aNear', near)
    return { geometry, near }
  }, [])

  const nodeMat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        uniforms: {
          uTime: { value: 0 },
          uReveal: { value: 0 },
          uSize: { value: NODE_SIZE },
          uPx: { value: 1 },
        },
        vertexShader: NODE_VERT,
        fragmentShader: NODE_FRAG,
      }),
    [],
  )

  useEffect(() => () => planeGeo.dispose(), [planeGeo])
  useEffect(() => () => chartMat.dispose(), [chartMat])
  useEffect(() => () => nodes.geometry.dispose(), [nodes])
  useEffect(() => () => nodeMat.dispose(), [nodeMat])

  // Lets the hero request a frame after a layout change while rendering is paused.
  useEffect(() => {
    const s = state.current
    s.invalidate = invalidate
    invalidate()
    return () => {
      s.invalidate = null
    }
  }, [state, invalidate])

  useFrame((frame, delta) => {
    const g = group.current
    if (!g) return
    const s = state.current
    const { w, h, left, top } = s.layout
    if (!w) return

    const shift = s.scroll * SCROLL_LAG

    // The orthographic camera is in CSS px, centred on the hero. y points up.
    g.scale.set(w, h, 1)
    g.position.set(
      left + w / 2 - size.width / 2,
      size.height / 2 - (top + h / 2 + shift),
      0,
    )

    chartMat.uniforms.uReveal.value = s.reveal
    chartMat.uniforms.uHover.value = s.hover
    chartMat.uniforms.uPointerU.value = (s.px - left) / w

    nodeMat.uniforms.uReveal.value = s.reveal
    nodeMat.uniforms.uTime.value = motion ? frame.clock.elapsedTime : 0
    nodeMat.uniforms.uPx.value = gl.getPixelRatio()
    // Halo size follows the hero width so it matches the artwork's own dots.
    nodeMat.uniforms.uSize.value =
      NODE_SIZE * Math.min(1.25, Math.max(0.6, w / 1500))

    // Each node swells as the pointer approaches it.
    const ease = 1 - Math.exp(-8 * delta)
    const attr = nodes.near
    CHART_NODES.forEach(([u, v], i) => {
      const dx = s.px - (left + u * w)
      const dy = s.py - (top + shift + v * h)
      const dist = Math.hypot(dx, dy)
      const target = s.hover * (1 - smoothstep(NEAR_INNER, NEAR_OUTER, dist))
      const current = attr.getX(i)
      attr.setX(i, current + (target - current) * ease)
    })
    attr.needsUpdate = true
  })

  return (
    <group ref={group}>
      <mesh
        geometry={planeGeo}
        material={chartMat}
        renderOrder={1}
        frustumCulled={false}
      />
      <points
        geometry={nodes.geometry}
        material={nodeMat}
        renderOrder={2}
        frustumCulled={false}
      />
    </group>
  )
}

/** Falls back to the static artwork if the browser drops the WebGL context. */
function ContextGuard({ onLost }: { onLost: () => void }) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const el = gl.domElement
    const handle = (e: Event) => {
      e.preventDefault()
      onLost()
    }
    el.addEventListener('webglcontextlost', handle)
    return () => el.removeEventListener('webglcontextlost', handle)
  }, [gl, onLost])
  return null
}

/** Catches anything the renderer throws, so the page keeps working without the scene. */
class SceneBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('[about-hero] 3D scene failed, using the static chart.', error)
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

/* -------------------------------------------------------------------------- */
/* Public component                                                           */
/* -------------------------------------------------------------------------- */

type SceneProps = {
  state: RefObject<HeroSceneState>
  /** False under prefers-reduced-motion. The scene then renders one static frame. */
  motion: boolean
}

export function AboutHeroScene({ state, motion }: SceneProps) {
  const webgl = useWebGLSupport()
  const coarse = useMediaQuery('(pointer: coarse)')
  const [ref, active] = useInView<HTMLDivElement>()
  const [texture, setTexture] = useState<Texture | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!webgl) return
    let disposed = false
    let loaded: Texture | null = null
    new TextureLoader().load(
      chartSrc,
      (tex) => {
        if (disposed) {
          tex.dispose()
          return
        }
        tex.colorSpace = SRGBColorSpace
        tex.anisotropy = 8
        loaded = tex
        setTexture(tex)
      },
      undefined,
      () => {
        if (!disposed) setFailed(true)
      },
    )
    return () => {
      disposed = true
      loaded?.dispose()
    }
  }, [webgl])

  const showStatic = !webgl || failed

  return (
    <div
      ref={ref}
      className="dk-ah__scene"
      data-ready={showStatic || texture !== null}
      aria-hidden="true"
    >
      {showStatic ? (
        <img
          className="dk-ah__chart-fallback"
          src={chartSrc}
          alt=""
          width={2164}
          height={727}
          draggable={false}
          decoding="async"
        />
      ) : texture ? (
        <SceneBoundary onError={() => setFailed(true)}>
          <Canvas
            orthographic
            dpr={coarse ? [1, 1.5] : [1, 2]}
            frameloop={active && motion ? 'always' : 'demand'}
            gl={{ alpha: true, antialias: true }}
            camera={{ position: [0, 0, 10], zoom: 1 }}
          >
            <ContextGuard onLost={() => setFailed(true)} />
            <GridField motion={motion} />
            <ChartLayer texture={texture} state={state} motion={motion} />
          </Canvas>
        </SceneBoundary>
      ) : null}
    </div>
  )
}
