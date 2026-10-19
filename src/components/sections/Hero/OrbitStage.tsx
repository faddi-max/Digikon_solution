import { useEffect, useMemo, useRef, useState, type CSSProperties, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { MathUtils, Vector3, type Group, type Mesh, type PerspectiveCamera } from 'three'

import dkMark from '@/assets/images/dk-mark.svg?url'
import { gsap } from '@/lib/motion'

import {
  CENTER_NODE,
  DESIGN_SIZE,
  DISC_H,
  DISC_W,
  ICON_SIZE,
  ORBIT_NODES,
  type OrbitNode,
} from './orbitData'
import { createNodeTexture } from './orbitTexture'

/** Spin speed in radians per second. Set to 0 to freeze the layout for comparison with Figma. */
const SPIN_SPEED = 0.2
/** Base tilt. 0 keeps the discs flat, as in the Figma frame. */
const TILT_BASE = 0
/** Pointer tilt range. Kept small so the discs stay close to their true shape. */
const TILT_RANGE = 0.04
/** Hover lift in z and scale. The centre disc sits at z 40, so lift stays below it. */
const HOVER_LIFT = 16
const HOVER_SCALE = 1.06
/** Hit-test growth with hysteresis, so the disc edge doesn't flicker. */
const HIT_IN = 0.96
const HIT_OUT = 1.12


const FIT = 0.9

type Pt = { x: number; y: number }

type OrbitStageProps = {
  hoverRef: MutableRefObject<number>
  pointerRef: MutableRefObject<Pt | null>
  tiltRef: MutableRefObject<Pt>
  motion: boolean
}

const TMP_POS = new Vector3()
const TMP_SCALE = new Vector3()
const TMP_PROJ = new Vector3()

export function OrbitStage({ hoverRef, pointerRef, tiltRef, motion }: OrbitStageProps) {
  const { camera, size, invalidate } = useThree()
  const tiltGroup = useRef<Group>(null)
  const ring = useRef<Group>(null)
  const meshes = useRef<(Mesh | null)[]>([])
  const doms = useRef<(HTMLElement | null)[]>([])
  const spin = useRef({ v: motion ? 1 : 0 })

  /** Pixels per design unit. Scales the scene and every DOM label together. */
  const k = (size.width / DESIGN_SIZE) * FIT

  useEffect(() => {
    const cam = camera as PerspectiveCamera
    cam.position.set(0, 0, size.height / 2 / Math.tan(MathUtils.degToRad(cam.fov / 2)))
    cam.lookAt(0, 0, 0)
    cam.updateProjectionMatrix()
    invalidate()
  }, [camera, size.height, invalidate])

  useEffect(() => {
    spin.current.v = motion ? 1 : 0
  }, [motion])

  /** Index of the disc under the pointer, or -1. Nearest centre wins on overlap. */
  const hitTest = (current: number) => {
    const p = pointerRef.current
    const root = tiltGroup.current
    if (!p || !root) return -1

    root.updateMatrixWorld(true)
    const camZ = camera.position.z
    let best = -1
    let bestD = Infinity

    meshes.current.forEach((mesh, i) => {
      if (!mesh) return
      mesh.getWorldPosition(TMP_POS)
      const depth = camZ / (camZ - TMP_POS.z)
      TMP_PROJ.copy(TMP_POS).project(camera)
      const sx = ((TMP_PROJ.x + 1) / 2) * size.width
      const sy = ((1 - TMP_PROJ.y) / 2) * size.height

      // World scale already includes the cluster fit, so this is in screen pixels.
      mesh.getWorldScale(TMP_SCALE)
      const rx = (DISC_W / 2) * TMP_SCALE.x * depth
      const ry = (DISC_H / 2) * TMP_SCALE.y * depth

      const grow = i === current ? HIT_OUT : HIT_IN
      const dx = (p.x - sx) / (rx * grow)
      const dy = (p.y - sy) / (ry * grow)
      const d = dx * dx + dy * dy
      if (d <= 1 && d < bestD) {
        bestD = d
        best = i
      }
    })
    return best
  }

  /** GSAP handles the hover feel, so lift and spin have proper easing and interruption. */
  const applyHover = (hovered: number) => {
    meshes.current.forEach((mesh, i) => {
      if (!mesh) return
      const on = i === hovered
      gsap.to(mesh.position, { z: on ? HOVER_LIFT : 0, duration: 0.7, ease: 'expo.out', overwrite: 'auto' })
      gsap.to(mesh.scale, {
        x: on ? HOVER_SCALE : 1,
        y: on ? HOVER_SCALE : 1,
        duration: 0.7,
        ease: 'expo.out',
        overwrite: 'auto',
      })
      doms.current[i]?.classList.toggle('is-hover', on)
    })

    // Ease the spin down to a slow drift while a disc is hovered, not to a dead stop.
    const target = hovered >= 0 ? 0.12 : motion ? 1 : 0
    gsap.to(spin.current, { v: target, duration: 1, ease: 'power3.out', overwrite: true })
  }

  useFrame((_, dt) => {
    const r = ring.current
    const tg = tiltGroup.current
    if (!r || !tg) return

    r.rotation.z += dt * SPIN_SPEED * spin.current.v

    // Ease the tilt toward its target every frame.
    const ease = 1 - Math.exp(-4 * dt)
    const targetX = motion ? TILT_BASE + tiltRef.current.y * TILT_RANGE : TILT_BASE
    const targetY = motion ? tiltRef.current.x * TILT_RANGE : 0
    tg.rotation.x += (targetX - tg.rotation.x) * ease
    tg.rotation.y += (targetY - tg.rotation.y) * ease

    const hovered = hitTest(hoverRef.current)
    if (hovered !== hoverRef.current) {
      hoverRef.current = hovered
      applyHover(hovered)
    }

    // Counter-rotate so each gradient and icon stays upright while the ring spins.
    meshes.current.forEach((m) => {
      if (m) m.rotation.z = -r.rotation.z
    })
  })

  return (
    <group scale={k}>
      <group ref={tiltGroup}>
        <group ref={ring}>
          {ORBIT_NODES.map((node, i) => (
            <OrbitNodeDisc
              key={node.id}
              node={node}
              index={i}
              k={k}
              meshes={meshes}
              doms={doms}
            />
          ))}
        </group>
      </group>

      <CenterDisc k={k} />
    </group>
  )
}

/**
 * Renders the exported SVG. If the file is missing or fails to load, it shows a
 * monogram in the same box, so the disc is never empty.
 */
function OrbitIcon({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(!src)

  if (failed) {
    return (
      <span className="dk-orbit-node__fallback" aria-hidden="true">
        {label.slice(0, 2)}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      onError={() => {
        console.warn(`[orbit] icon failed to load: ${label} (${src})`)
        setFailed(true)
      }}
    />
  )
}

type DiscProps = {
  node: OrbitNode
  index: number
  k: number
  meshes: MutableRefObject<(Mesh | null)[]>
  doms: MutableRefObject<(HTMLElement | null)[]>
}

function OrbitNodeDisc({ node, index, k, meshes, doms }: DiscProps) {
  const art = useMemo(
    () => createNodeTexture(node.w, node.h, node.gradientAngle, node.stops, node.radius),
    [node],
  )
  useEffect(() => () => art.tex.dispose(), [art])

  return (
    <mesh
      ref={(el) => {
        meshes.current[index] = el
      }}
      position={[node.x, node.y, node.z]}
    >
      <planeGeometry args={[art.width, art.height]} />
      <meshBasicMaterial map={art.tex} transparent depthWrite={false} />

      {/*
       * Keep labels/icons above the WebGL canvas. With a zero lower bound,
       * whichever disc is furthest away while the ring tilts can receive a
       * z-index of 0 and disappear behind the canvas, leaving an empty disc.
       */}
      <Html center zIndexRange={[100, 1]}>
        <div
          ref={(el) => {
            doms.current[index] = el
          }}
          className="dk-orbit-node"
          data-orbit-node={node.id}
          style={
            {
              // The HTML layer is not inside the scaled group, so it uses the same k.
              width: node.w * k,
              height: node.h * k,
              '--ink': node.ink,
              '--icon-size': `${ICON_SIZE * k}px`,
              '--label-size': `${11 * k}px`,
            } as CSSProperties
          }
        >
          <span className="dk-orbit-node__icon">
            <OrbitIcon src={node.iconSrc} label={node.label} />
          </span>
          {!node.hideLabel && <span className="dk-orbit-node__label">{node.label}</span>}
        </div>
      </Html>
    </mesh>
  )
}

function CenterDisc({ k }: { k: number }) {
  const art = useMemo(
    () =>
      createNodeTexture(
        CENTER_NODE.w,
        CENTER_NODE.h,
        CENTER_NODE.gradientAngle,
        CENTER_NODE.stops,
        CENTER_NODE.radius,
      ),
    [],
  )
  useEffect(() => () => art.tex.dispose(), [art])

  return (
    <mesh position={[0, 0, CENTER_NODE.z]} renderOrder={2}>
      <planeGeometry args={[art.width, art.height]} />
      <meshBasicMaterial map={art.tex} transparent depthWrite={false} />
      <Html center zIndexRange={[200, 101]}>
        <div className="dk-orbit-center" style={{ width: DISC_W * k, height: DISC_H * k }}>
          <img src={dkMark} alt="" className="dk-orbit-center__mark" draggable={false} />
        </div>
      </Html>
    </mesh>
  )
}
