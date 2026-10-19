import { useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  ShaderMaterial,
  type OrthographicCamera,
} from 'three'

import { prefersReducedMotion } from '@/lib/motion'
import { useInView } from '@/lib/useInView'

/** Grid cell size at a 1920px-wide section, in CSS px. */
const CELL_AT_1920 = 327
const MIN_CELL = 180
const SWEEP_SPEED = 0.07

function hash(x: number, y: number) {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

export function GridField({ motion }: { motion: boolean }) {
  const { size, gl, camera } = useThree()

  const cell = Math.max(MIN_CELL, CELL_AT_1920 * (size.width / 1920))

  const { lineGeo, nodeGeo } = useMemo(() => {
    const cols = Math.ceil(size.width / cell) + 2
    const rows = Math.ceil(size.height / cell) + 2
    const halfW = (cols * cell) / 2
    const halfH = (rows * cell) / 2

    const lines: number[] = []
    const nodes: number[] = []
    const seeds: number[] = []

    for (let j = 0; j <= rows; j++) {
      const y = -halfH + j * cell
      lines.push(-halfW, y, 0, halfW, y, 0)
    }
    for (let i = 0; i <= cols; i++) {
      const x = -halfW + i * cell
      lines.push(x, -halfH, 0, x, halfH, 0)
    }
    for (let j = 0; j <= rows; j++) {
      for (let i = 0; i <= cols; i++) {
        nodes.push(-halfW + i * cell, -halfH + j * cell, 0)
        seeds.push(hash(i, j))
      }
    }

    const lineGeo = new BufferGeometry()
    lineGeo.setAttribute('position', new Float32BufferAttribute(lines, 3))

    const nodeGeo = new BufferGeometry()
    nodeGeo.setAttribute('position', new Float32BufferAttribute(nodes, 3))
    nodeGeo.setAttribute('aSeed', new Float32BufferAttribute(seeds, 1))

    return { lineGeo, nodeGeo }
  }, [size.width, size.height, cell])

  useEffect(
    () => () => {
      lineGeo.dispose()
      nodeGeo.dispose()
    },
    [lineGeo, nodeGeo],
  )

  const lineMat = useMemo(
    () =>
      new LineBasicMaterial({
        color: '#81D870',
        transparent: true,
        opacity: 0.24,
        depthWrite: false,
      }),
    [],
  )

  const nodeMat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSweep: { value: -1e5 },
          uPx: { value: gl.getPixelRatio() },
          uSize: { value: 9 },
        },
        vertexShader: /* glsl */ `
          attribute float aSeed;
          uniform float uTime;
          uniform float uSweep;
          uniform float uPx;
          uniform float uSize;
          varying float vA;
          void main() {
            float wave = 0.5 + 0.5 * sin(uTime * 0.9 - position.x * 0.003 - position.y * 0.002 + aSeed * 6.2831);
            float sweep = exp(-pow((position.x - uSweep) / 160.0, 2.0));
            vA = 0.3 + 0.45 * wave + 0.9 * sweep;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = uSize * uPx;
          }
        `,
        fragmentShader: /* glsl */ `
          varying float vA;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float halo = smoothstep(0.5, 0.0, d);
            float core = smoothstep(0.16, 0.0, d);
            vec3 col = mix(vec3(0.51, 0.85, 0.44), vec3(1.0), core);
            gl_FragColor = vec4(col, halo * clamp(vA, 0.0, 1.0));
          }
        `,
      }),
    [gl],
  )

  useEffect(
    () => () => {
      lineMat.dispose()
      nodeMat.dispose()
    },
    [lineMat, nodeMat],
  )

  // Orthographic camera in CSS px, centred on the section.
  useEffect(() => {
    const cam = camera as OrthographicCamera
    cam.left = -size.width / 2
    cam.right = size.width / 2
    cam.top = size.height / 2
    cam.bottom = -size.height / 2
    cam.updateProjectionMatrix()
  }, [camera, size.width, size.height])

  useFrame((state) => {
    if (!motion) return
    const t = state.clock.elapsedTime
    nodeMat.uniforms.uTime.value = t
    const p = (t * SWEEP_SPEED) % 1
    nodeMat.uniforms.uSweep.value = -size.width / 2 - 300 + p * (size.width + 600)
  })

  return (
    <>
      <lineSegments geometry={lineGeo} material={lineMat} />
      <points geometry={nodeGeo} material={nodeMat} />
    </>
  )
}

export function AboutGridBackground() {
  const [ref, active] = useInView<HTMLDivElement>()
  const motion = !prefersReducedMotion()

  return (
    <div ref={ref} className="dk-about__grid" aria-hidden="true">
      <Canvas
        orthographic
        dpr={[1, 2]}
        frameloop={active && motion ? 'always' : 'demand'}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 10], zoom: 1 }}
      >
        <GridField motion={motion} />
      </Canvas>
    </div>
  )
}