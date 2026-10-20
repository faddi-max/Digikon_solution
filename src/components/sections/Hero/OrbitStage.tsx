import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  CanvasTexture,
  MathUtils,
  Vector3,
  type Group,
  type Mesh,
  type PerspectiveCamera,
} from 'three'

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
import {
  createGlyphTexture,
  createNodeTexture,
  loadImage,
  loadOrbitFonts,
} from './orbitTexture'

/** Spin speed in radians per second. Set to 0 to freeze the layout for comparison with Figma. */
const SPIN_SPEED = 0.2
/** Base tilt. 0 keeps the discs flat, as in the Figma frame. */
const TILT_BASE = 0
/** Pointer tilt range. Kept small so the discs stay close to their true shape. */
const TILT_RANGE = 0.04
/** Hover lift in z and scale. The centre disc sits at z 40, so lift stays below it. */
const HOVER_LIFT = 16
const HOVER_SCALE = 1.06
/** Extra lift for the icon layer on hover, in design px. */
const GLYPH_LIFT = 2
const GLYPH_SCALE = 1.04
/** Hit-test growth with hysteresis, so the disc edge doesn't flicker. */
const HIT_IN = 0.96
const HIT_OUT = 1.12

const FIT = 0.9

/** DK mark is drawn at 56% of the disc width, as before. */
const CENTER_MARK_W = DISC_W * 0.56
const CENTER_MARK_H = CENTER_MARK_W * (84 / 112)

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

/**
 * Builds a texture asynchronously and disposes it on cleanup. Safe under
 * StrictMode: a build that finishes after unmount is disposed, not applied.
 */
function useAsyncTexture(make: () => Promise<CanvasTexture>) {
  const { invalidate } = useThree()
  const [tex, setTex] = useState<CanvasTexture | null>(null)

  useEffect(() => {
    let alive = true
    let made: CanvasTexture | null = null

    make()
      .then((t) => {
        if (!alive) {
          t.dispose()
          return
        }
        made = t
        setTex(t)
        invalidate()
      })
      .catch((err) => console.warn('[orbit] glyph texture failed', err))

    return () => {
      alive = false
      made?.dispose()
      setTex(null)
    }
  }, [make, invalidate])

  return tex
}

async function buildNodeGlyph(node: OrbitNode) {
  await loadOrbitFonts()
  let image: HTMLImageElement | null = null
  try {
    image = await loadImage(node.iconSrc)
  } catch (err) {
    console.warn(`[orbit] icon failed to load: ${node.label} (${node.iconSrc})`, err)
  }
  return createGlyphTexture({
    w: DISC_W,
    h: DISC_H,
    image,
    iconW: ICON_SIZE,
    iconH: ICON_SIZE,
    label: node.hideLabel ? undefined : node.label,
    ink: node.ink,
    fallback: node.label.slice(0, 2),
  })
}

async function buildCenterGlyph() {
  let image: HTMLImageElement | null = null
  try {
    image = await loadImage(dkMark)
  } catch (err) {
    console.warn('[orbit] DK mark failed to load', err)
  }
  return createGlyphTexture({
    w: DISC_W,
    h: DISC_H,
    image,
    iconW: CENTER_MARK_W,
    iconH: CENTER_MARK_H,
    ink: '#F7F8F5',
    fallback: 'DK',
  })
}

export function OrbitStage({ hoverRef, pointerRef, tiltRef, motion }: OrbitStageProps) {
  const { camera, size, invalidate } = useThree()
  const tiltGroup = useRef<Group>(null)
  const ring = useRef<Group>(null)
  const meshes = useRef<(Mesh | null)[]>([])
  const glyphs = useRef<(Mesh | null)[]>([])
  const spin = useRef({ v: motion ? 1 : 0 })

  /** Pixels per design unit. Scales the whole scene. */
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

      const glyph = glyphs.current[i]
      if (glyph) {
        gsap.to(glyph.position, { y: on ? GLYPH_LIFT : 0, duration: 0.5, ease: 'expo.out', overwrite: 'auto' })
        gsap.to(glyph.scale, {
          x: on ? GLYPH_SCALE : 1,
          y: on ? GLYPH_SCALE : 1,
          duration: 0.5,
          ease: 'expo.out',
          overwrite: 'auto',
        })
      }
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
    // The glyph is a child of the disc, so it follows.
    meshes.current.forEach((m) => {
      if (m) m.rotation.z = -r.rotation.z
    })
  })

  return (
    <group scale={k}>
      <group ref={tiltGroup}>
        <group ref={ring}>
          {ORBIT_NODES.map((node, i) => (
            <OrbitNodeDisc key={node.id} node={node} index={i} meshes={meshes} glyphs={glyphs} />
          ))}
        </group>
      </group>

      <CenterDisc />
    </group>
  )
}

type DiscProps = {
  node: OrbitNode
  index: number
  meshes: MutableRefObject<(Mesh | null)[]>
  glyphs: MutableRefObject<(Mesh | null)[]>
}

function OrbitNodeDisc({ node, index, meshes, glyphs }: DiscProps) {
  const art = useMemo(
    () => createNodeTexture(node.w, node.h, node.gradientAngle, node.stops, node.radius),
    [node],
  )
  useEffect(() => () => art.tex.dispose(), [art])

  const make = useCallback(() => buildNodeGlyph(node), [node])
  const glyphTex = useAsyncTexture(make)

  return (
    <mesh
      ref={(el) => {
        meshes.current[index] = el
      }}
      position={[node.x, node.y, node.z]}
      renderOrder={0}
    >
      <planeGeometry args={[art.width, art.height]} />
      <meshBasicMaterial map={art.tex} transparent depthWrite={false} />

      {glyphTex && (
        <mesh
          ref={(el) => {
            glyphs.current[index] = el
          }}
          position={[0, 0, 1]}
          renderOrder={1}
        >
          <planeGeometry args={[node.w, node.h]} />
          <meshBasicMaterial map={glyphTex} transparent depthWrite={false} />
        </mesh>
      )}
    </mesh>
  )
}

function CenterDisc() {
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

  const glyphTex = useAsyncTexture(buildCenterGlyph)

  return (
    <mesh position={[0, 0, CENTER_NODE.z]} renderOrder={2}>
      <planeGeometry args={[art.width, art.height]} />
      <meshBasicMaterial map={art.tex} transparent depthWrite={false} />

      {glyphTex && (
        <mesh position={[0, 0, 1]} renderOrder={3}>
          <planeGeometry args={[DISC_W, DISC_H]} />
          <meshBasicMaterial map={glyphTex} transparent depthWrite={false} />
        </mesh>
      )}
    </mesh>
  )
}