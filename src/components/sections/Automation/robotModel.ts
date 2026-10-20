import {
  AdditiveBlending,
  BackSide,
  BoxGeometry,
  CanvasTexture,
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  type BufferGeometry,
  type Material,
  type Texture,
  type WebGLRenderer,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * The DigiKon assistant robot, built from primitives.
 *
 * Units are design pixels: one world unit is one pixel of the 1888px layout, and the figure is
 * about 198 x 298 of them. The origin is the middle of the figure, +Y is up, and the camera
 * looks down -Z. Every size and position below was measured from the Figma frame.
 *
 * This file has no React in it, so the scene component only has to mount `group` and call
 * `update` each frame. Nothing here touches the DOM except the small canvas used for glow.
 */

/** Size of the figure in world units, used to frame the camera. */
export const ROBOT_BOUNDS = { width: 198, height: 298 } as const

export type RobotInput = {
  /** Pointer position, -1 to 1 across the hero, 0 at rest. */
  px: number
  py: number
  /** Entrance progress, 0 to 1. */
  intro: number
  /** Idle float, -1 to 1, driven by the page timeline so the shadow can follow it. */
  float: number
  /** Seconds, and seconds since the last frame. */
  time: number
  dt: number
  /** False for reduced motion: the figure holds still and looks straight ahead. */
  motion: boolean
  /** Extra turn in radians from dragging the figure. */
  spin: number
  /** Time (seconds, same clock as `time`) of the last click or tap, which makes it wave. */
  poke: number
}

export type RobotRig = {
  group: Group
  /** Give the glossy parts something to reflect. Pass null to let go of it. */
  setEnvironment: (texture: Texture | null) => void
  update: (input: RobotInput) => void
  dispose: () => void
}

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const easeOutBack = (t: number) => {
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

function roundedRectShape(w: number, h: number, r: number): Shape {
  const s = new Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false)
  s.lineTo(x + w, y + h - r)
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false)
  s.lineTo(x + r, y + h)
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false)
  s.lineTo(x, y + r)
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false)
  return s
}

/**
 * A rounded slab with a flat face and a soft bevel, `w` x `h` overall and `depth` thick overall.
 * The bevel grows outward from the outline, so the flat face is inset by `bevel`.
 */
function slab(w: number, h: number, radius: number, depth: number, bevel: number): BufferGeometry {
  const inner = Math.max(0, depth - 2 * bevel)
  const raw = new ExtrudeGeometry(
    roundedRectShape(w - 2 * bevel, h - 2 * bevel, Math.max(0.5, radius - bevel)),
    {
      depth: inner,
      bevelEnabled: true,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 8,
      curveSegments: 24,
    },
  )
  raw.translate(0, 0, -inner / 2)
  // Extrude geometry is not indexed, so plain normals come out faceted. Crease them instead.
  const smooth = toCreasedNormals(raw, Math.PI / 4)
  raw.dispose()
  return smooth
}

/**
 * Puff the front of a shape out a little, and tilt its normals to match, so reflections slide
 * across it like a soft pillow instead of sitting flat. `front` is the z of the front face.
 */
function puff(geometry: BufferGeometry, halfW: number, halfH: number, lift: number, front: number) {
  const pos = geometry.getAttribute('position')
  const nor = geometry.getAttribute('normal')
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    if (z <= 0) continue
    const u = clamp(x / halfW, -1, 1)
    const v = clamp(y / halfH, -1, 1)
    const w = clamp(z / front)
    pos.setZ(i, z + lift * (1 - u * u) * (1 - v * v) * w)
    const dx = lift * ((-2 * u) / halfW) * (1 - v * v) * w
    const dy = lift * (1 - u * u) * ((-2 * v) / halfH) * w
    const nx = nor.getX(i) - dx * 2.2
    const ny = nor.getY(i) - dy * 2.2
    const nz = nor.getZ(i)
    const len = Math.hypot(nx, ny, nz) || 1
    nor.setXYZ(i, nx / len, ny / len, nz / len)
  }
  pos.needsUpdate = true
  nor.needsUpdate = true
}

/** A soft round glow, drawn once on a canvas. */
function glowTexture(): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const g = c.getContext('2d')
  if (g) {
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, 'rgba(150,240,130,0.85)')
    grad.addColorStop(0.3, 'rgba(129,216,112,0.38)')
    grad.addColorStop(1, 'rgba(129,216,112,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
  }
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

/**
 * A tiny studio for the glossy shell to reflect: a dark teal room with a few emissive panels,
 * rendered once into a small prefiltered map, so there is no HDR file to download. The tall
 * strip on the left is what draws the soft vertical highlight down the torso.
 */
function studioScene(): Scene {
  const scene = new Scene()
  const disposables: { dispose: () => void }[] = []

  const room = new Mesh(
    new SphereGeometry(60, 32, 16),
    new MeshBasicMaterial({ color: '#0b2c26', side: BackSide }),
  )
  disposables.push(room.geometry, room.material as Material)
  scene.add(room)

  const panel = (
    w: number,
    h: number,
    color: string,
    intensity: number,
    at: [number, number, number],
  ) => {
    const material = new MeshBasicMaterial({
      color: new Color(color).multiplyScalar(intensity),
      side: DoubleSide,
    })
    const mesh = new Mesh(new PlaneGeometry(w, h), material)
    mesh.position.set(...at)
    mesh.lookAt(0, 0, 0)
    disposables.push(mesh.geometry, material)
    scene.add(mesh)
  }
  panel(26, 16, '#ffffff', 4.5, [-22, 28, 30]) // soft key, high left
  panel(4, 46, '#ffffff', 9, [-12, 2, 42]) // tall strip, front left: the streak
  panel(18, 14, '#e4f6dd', 2.2, [36, -6, 30]) // fill, low right
  panel(14, 36, '#81d870', 2.2, [42, 8, -22]) // green rim, back right
  panel(36, 18, '#ffffff', 2.4, [0, 48, 6]) // overhead
  scene.userData.dispose = () => disposables.forEach((d) => d.dispose())
  return scene
}

export function createRobotEnvironment(renderer: WebGLRenderer) {
  const pmrem = new PMREMGenerator(renderer)
  const studio = studioScene()
  const target = pmrem.fromScene(studio, 0.035)
  studio.userData.dispose()
  pmrem.dispose()
  return {
    texture: target.texture as Texture,
    dispose: () => target.dispose(),
  }
}

export function createRobot(): RobotRig {
  const disposables: { dispose: () => void }[] = []
  const own = <T extends { dispose: () => void }>(d: T): T => {
    disposables.push(d)
    return d
  }

  // ---- materials -------------------------------------------------------------------------
  // Each glossy material and how strongly it picks up the studio reflections.
  const reflective: { material: MeshPhysicalMaterial; strength: number }[] = []
  const glossy = (material: MeshPhysicalMaterial, strength: number) => {
    reflective.push({ material, strength })
    return own(material)
  }
  const shell = (color: string, roughness = 0.34) =>
    glossy(
      new MeshPhysicalMaterial({
        color,
        roughness,
        metalness: 0.06,
        clearcoat: 0.8,
        clearcoatRoughness: 0.32,
      }),
      1.7,
    )
  const pearl = shell('#d4e6d2', 0.3)
  const sage = shell('#a9c6ad', 0.38)
  const earLeft = shell('#9fbfa5', 0.42)
  const earRight = shell('#6f9a7d', 0.42)
  const band = glossy(
    new MeshPhysicalMaterial({ color: '#4d7a5c', roughness: 0.5, metalness: 0.05 }),
    0.5,
  )
  const visorMat = glossy(
    new MeshPhysicalMaterial({
      color: '#0a2b24',
      roughness: 0.4,
      metalness: 0,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
    }),
    0.18,
  )
  const greenGlow = own(new MeshBasicMaterial({ color: '#8be07a' }))
  const ink = own(new MeshBasicMaterial({ color: '#0e2a2a' }))

  const glow = own(glowTexture())
  const glowMat = (opacity: number) =>
    own(
      new MeshBasicMaterial({
        map: glow,
        transparent: true,
        opacity,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    )
  const eyeHaloMat = glowMat(0.9)
  const antennaHaloMat = glowMat(0.9)

  const mesh = (geometry: BufferGeometry, material: Material) => {
    own(geometry)
    return new Mesh(geometry, material)
  }

  // ---- hierarchy -------------------------------------------------------------------------
  const group = new Group()
  const root = new Group()
  group.add(root)

  // Head: a flat-faced slab with a soft edge, the dark visor set into its face.
  const HEAD_Y = 62.5
  const head = new Group()
  head.position.set(1.25, HEAD_Y, 0)
  root.add(head)
  head.add(mesh(slab(148.5, 116, 40, 98, 14), pearl))

  const visor = mesh(slab(122, 79, 20, 7, 2.4), visorMat)
  visor.position.set(-0.25, 1, 47.6)
  head.add(visor)

  const eyes = new Group()
  eyes.position.set(0, 0.5, 52.6)
  head.add(eyes)
  const eyeGeo = own(new SphereGeometry(1, 24, 16))
  for (const x of [-21.75, 20]) {
    const eye = new Mesh(eyeGeo, greenGlow)
    eye.position.set(x, 0, 0)
    eye.scale.set(6.9, 8.75, 1.5)
    eyes.add(eye)
    const halo = mesh(new PlaneGeometry(1, 1), eyeHaloMat)
    halo.position.set(x, 0, 0.6)
    halo.scale.set(40, 44, 1)
    eyes.add(halo)
  }

  const smile = mesh(new TorusGeometry(11, 0.9, 8, 40, Math.PI * 0.72), greenGlow)
  smile.rotation.z = -Math.PI / 2 - (Math.PI * 0.72) / 2
  smile.position.set(-2, -8.9, 52.4)
  head.add(smile)

  const earGeo = own(new RoundedBoxGeometry(17.5, 37.5, 28, 4, 8))
  const earL = new Mesh(earGeo, earLeft)
  earL.position.set(-78.75, -0.6, 0)
  const earR = new Mesh(earGeo, earRight)
  earR.position.set(78.1, -0.6, 0)
  head.add(earL, earR)

  const stalk = mesh(new CylinderGeometry(1.1, 1.1, 23, 10), sage)
  stalk.position.set(-2.5, 67.1, 0)
  head.add(stalk)
  const ball = mesh(new SphereGeometry(5.5, 20, 14), greenGlow)
  ball.position.set(-2.5, 83.6, 0)
  head.add(ball)
  const ballHalo = mesh(new PlaneGeometry(1, 1), antennaHaloMat)
  ballHalo.position.set(-2.5, 83.6, 6)
  ballHalo.scale.set(34, 34, 1)
  head.add(ballHalo)

  // Torso: a soft pillow with a small emblem and a status bar.
  const torso = new Group()
  torso.position.set(0.6, -60, 0)
  root.add(torso)
  const torsoGeo = new RoundedBoxGeometry(123.75, 126, 92, 8, 27.5)
  puff(torsoGeo, 61.9, 63, 8, 46)
  torso.add(mesh(torsoGeo, pearl))

  const emblem = new Group()
  emblem.position.set(-1.35, 8.1, 55.4)
  torso.add(emblem)
  const barGeo = own(new BoxGeometry(9, 1.3, 0.8))
  for (let i = 0; i < 4; i++) {
    const arm = new Mesh(barGeo, ink)
    arm.rotation.z = (i * Math.PI) / 4
    emblem.add(arm)
  }
  const belly = mesh(new RoundedBoxGeometry(30.75, 4.25, 3, 3, 1.4), greenGlow)
  belly.position.set(-1.5, -44.4, 51.8)
  torso.add(belly)

  // Legs.
  const legGeo = own(new CapsuleGeometry(17, 4, 8, 20))
  const legL = new Mesh(legGeo, sage)
  legL.position.set(-25.6, -130.4, 0)
  const legR = new Mesh(legGeo, sage)
  legR.position.set(29.1, -130.4, 0)
  root.add(legL, legR)

  // Arms hang from a pivot at the shoulder, a little behind the torso so its edge overlaps them.
  const ARM_L = -0.14
  const ARM_R = 0.44
  const makeArm = (
    x: number,
    y: number,
    length: number,
    handRadius: number,
    bandAt: number,
    material: Material,
  ) => {
    const pivot = new Group()
    pivot.position.set(x, y, -6)
    const r = 13.5
    const limb = mesh(new CapsuleGeometry(r, Math.max(1, length - 2 * r), 8, 20), material)
    limb.position.y = -length / 2
    pivot.add(limb)
    const cuff = mesh(new CylinderGeometry(r + 1.3, r + 1.3, 13, 24), band)
    cuff.position.y = bandAt
    pivot.add(cuff)
    const hand = mesh(new SphereGeometry(handRadius, 24, 18), material)
    hand.position.set(0, -length + 4, 2)
    pivot.add(hand)
    root.add(pivot)
    return pivot
  }
  const armL = makeArm(-63.5, -20.6, 88, 13.75, -35, sage)
  armL.rotation.z = ARM_L
  const armR = makeArm(69, -21.9, 62, 15.5, -36, sage)
  armR.rotation.z = ARM_R

  // ---- lights ----------------------------------------------------------------------------
  const hemi = new HemisphereLight('#e6f4e2', '#0a3a30', 0.3)
  const key = new DirectionalLight('#ffffff', 0.9)
  key.position.set(-220, 320, 420)
  const rim = new DirectionalLight('#81d870', 0.45)
  rim.position.set(320, 110, -200)
  group.add(hemi, key, rim)

  // ---- animation -------------------------------------------------------------------------
  const look = { x: 0, y: 0 }

  const update = ({ px, py, intro, float, time, dt, motion, spin, poke }: RobotInput) => {
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 6)
    look.x += (px - look.x) * k
    look.y += (py - look.y) * k

    const t = clamp(intro)
    root.visible = t > 0.001
    root.scale.setScalar(0.86 + 0.14 * clamp(easeOutBack(t), 0, 1.08))
    root.position.y = -28 * (1 - t) + float * 4.5

    // The whole figure turns toward the pointer, sways on its own, and follows a drag.
    root.rotation.y = motion ? look.x * 0.5 + Math.sin(time * 0.7) * 0.16 + spin : 0
    const idleYaw = motion ? Math.sin(time * 0.6) * 0.05 : 0
    head.rotation.y = look.x * 0.34 + idleYaw
    head.rotation.x = -look.y * 0.16
    head.position.y = HEAD_Y - float * 1.2
    torso.rotation.y = look.x * 0.12
    eyes.position.x = look.x * 3

    armL.rotation.z = ARM_L + (motion ? Math.sin(time * 1.1) * 0.03 : 0)
    armR.rotation.z = ARM_R + (motion ? Math.sin(time * 1.3 + 1) * 0.05 : 0)

    // A wave: now and then on its own, and straight away when clicked.
    if (motion) {
      const sinceAuto = (time + 3) % 9
      const sincePoke = time - poke
      const w =
        sincePoke >= 0 && sincePoke < 1.8 ? sincePoke : sinceAuto < 1.8 && time > 4 ? sinceAuto : -1
      if (w >= 0) {
        const lift = Math.sin((Math.PI * w) / 1.8) // up, hold, down
        armR.rotation.z = ARM_R + lift * 2.2 + Math.sin(w * 14) * 0.28 * lift
      }
    }

    // A short blink every few seconds.
    const p = time % 4.6
    const closed = motion && p > 4.4 ? 1 - Math.abs(1 - (p - 4.4) / 0.1) : 0
    eyes.scale.y = 1 - 0.9 * closed

    antennaHaloMat.opacity = motion ? 0.75 + 0.25 * Math.sin(time * 2.4) : 0.9
  }

  const setEnvironment = (texture: Texture | null) => {
    for (const { material, strength } of reflective) {
      material.envMap = texture
      material.envMapIntensity = strength
      material.needsUpdate = true
    }
  }

  const dispose = () => {
    for (const d of disposables) d.dispose()
  }

  return { group, setEnvironment, update, dispose }
}
