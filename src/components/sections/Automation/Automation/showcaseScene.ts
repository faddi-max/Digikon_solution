import {
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Group,
  LinearFilter,
  Mesh,
  NormalBlending,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
  type Texture,
} from 'three'

/**
 * The 3D robot card scene.
 *
 * The artwork is one flat render, so depth is built from it: a depth map is made from the
 * picture itself (the robot's solid body stands forward, the glass panels sit back, edges are
 * softened by a blur), and a finely divided plane is pushed out by it in the vertex shader.
 * With the pointer tilting the group in perspective, the robot turns a little in space and the
 * panels slide against it, instead of the picture just skewing. Around it, soft green motes
 * drift at different depths, in front of and behind the figure.
 *
 * One world unit is one CSS pixel at the figure's plane (camera distance is derived from the
 * field of view), so layout numbers carry straight over.
 */

const FOV = 24
/** Frame of the whole PNG (margins included) as a share of the card, from the design. */
const FIG_W = 0.55
/** The design card is 480 x 287; on other shapes the figure scales to fit inside it. */
const REF_W = 480
const REF_H = 287
const FIG_CX = 0.5
const FIG_CY = 0.5

export type ShowcaseInput = {
  /** Pointer position over the card, -1 to 1 (0 at rest). */
  px: number
  py: number
  /** Entrance progress, 0 to 1. */
  intro: number
  time: number
  dt: number
  motion: boolean
}

export type ShowcaseScene = {
  /** Resolves when the artwork has loaded and been turned into geometry. */
  ready: Promise<void>
  resize: (w: number, h: number, dpr: number) => void
  render: (input: ShowcaseInput) => void
  dispose: () => void
}

const VERT = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uAmt;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    float d = texture2D(uDepth, uv).r;
    vec3 p = position;
    p.z += (d - 0.35) * uAmt;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`
const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(uMap, vUv);
    gl_FragColor = vec4(c.rgb, c.a * uOpacity);
    #include <colorspace_fragment>
  }
`

/** Turn the artwork into a soft depth map: solid, neutral pixels forward, green glass back. */
function buildDepthTexture(image: HTMLImageElement): { texture: CanvasTexture; aspect: number } {
  const aspect = image.naturalWidth / image.naturalHeight
  const w = 192
  const h = Math.round(w / aspect)
  const src = document.createElement('canvas')
  src.width = w
  src.height = h
  const sctx = src.getContext('2d', { willReadFrequently: true })!
  sctx.drawImage(image, 0, 0, w, h)
  const px = sctx.getImageData(0, 0, w, h).data

  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const octx = out.getContext('2d')!
  const img = octx.createImageData(w, h)
  for (let i = 0; i < w * h; i++) {
    const r = px[i * 4]
    const g = px[i * 4 + 1]
    const b = px[i * 4 + 2]
    const a = px[i * 4 + 3] / 255
    // How green (glass panels, glow) the pixel is; the robot's white and black are neutral.
    const green = Math.min(1, Math.max(0, (g - Math.max(r, b)) / 55))
    const solid = a > 0.6 ? 1 : a / 0.6
    const d = solid * (1 - 0.6 * green)
    const v = Math.round(255 * d)
    img.data[i * 4] = v
    img.data[i * 4 + 1] = v
    img.data[i * 4 + 2] = v
    img.data[i * 4 + 3] = 255
  }
  octx.putImageData(img, 0, 0)

  // Blur it so the surface is rounded, not stepped.
  const blurred = document.createElement('canvas')
  blurred.width = w
  blurred.height = h
  const bctx = blurred.getContext('2d')!
  bctx.filter = 'blur(5px)'
  bctx.drawImage(out, 0, 0)

  const texture = new CanvasTexture(blurred)
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = false
  return { texture, aspect }
}

function moteTexture(): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return new CanvasTexture(c)
}

export function createShowcaseScene(
  canvas: HTMLCanvasElement,
  artUrl: string,
  opts: { motes: number; segments: number },
): ShowcaseScene {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setClearColor(0x000000, 0)
  const scene = new Scene()
  const camera = new PerspectiveCamera(FOV, 1, 10, 4000)
  const group = new Group()
  scene.add(group)

  let W = 480
  let H = 287
  let figure: Mesh<PlaneGeometry, ShaderMaterial> | null = null
  let map: Texture | null = null
  let depth: CanvasTexture | null = null
  let figAspect = 1.14
  let disposed = false

  // ---- motes ----
  const count = opts.motes
  const base = new Float32Array(count * 3)
  const speed = new Float32Array(count)
  const phase = new Float32Array(count)
  const sprite = moteTexture()
  const moteGeo = new BufferGeometry()
  const moteMat = new PointsMaterial({
    map: sprite,
    color: 0x4cc24a,
    size: 9,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    // Plain alpha: additive blending would vanish on a light card.
    blending: NormalBlending,
  })
  const motes = new Points(moteGeo, moteMat)
  group.add(motes)

  const seed = (i: number) => {
    const s = Math.sin(i * 127.1 + 311.7) * 43758.5453
    return s - Math.floor(s)
  }
  const layoutMotes = () => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      base[i * 3] = (seed(i) - 0.5) * W * 1.05
      base[i * 3 + 1] = (seed(i + 91) - 0.5) * H * 1.05
      base[i * 3 + 2] = -120 + seed(i + 17) * 300
      speed[i] = 4 + seed(i + 5) * 10
      phase[i] = seed(i + 33) * 6.283
      pos[i * 3] = base[i * 3]
      pos[i * 3 + 1] = base[i * 3 + 1]
      pos[i * 3 + 2] = base[i * 3 + 2]
    }
    moteGeo.setAttribute('position', new Float32BufferAttribute(pos, 3))
  }
  layoutMotes()

  // ---- figure ----
  const ready = new Promise<void>((resolve, reject) => {
    new TextureLoader().load(
      artUrl,
      (tex) => {
        if (disposed) {
          tex.dispose()
          resolve()
          return
        }
        tex.colorSpace = SRGBColorSpace
        tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy())
        map = tex
        const d = buildDepthTexture(tex.image as HTMLImageElement)
        depth = d.texture
        figAspect = d.aspect
        const mat = new ShaderMaterial({
          uniforms: {
            uMap: { value: tex },
            uDepth: { value: depth },
            uAmt: { value: 100 },
            uOpacity: { value: 1 },
          },
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: true,
          depthWrite: true,
        })
        const geo = new PlaneGeometry(1, 1 / figAspect, opts.segments, Math.round(opts.segments / figAspect))
        figure = new Mesh(geo, mat)
        group.add(figure)
        layout()
        resolve()
      },
      undefined,
      () => reject(new Error('artwork failed to load')),
    )
  })

  const fit = () => Math.min(W / REF_W, H / REF_H)

  const layout = () => {
    if (figure) {
      const w = FIG_W * REF_W * fit()
      figure.scale.set(w, w, 1)
      figure.position.set((FIG_CX - 0.5) * W, (0.5 - FIG_CY) * H, 0)
    }
    camera.aspect = W / H
    camera.position.z = H / 2 / Math.tan((FOV / 2) * (Math.PI / 180))
    camera.updateProjectionMatrix()
  }

  const resize = (w: number, h: number, dpr: number) => {
    if (!w || !h) return
    W = w
    H = h
    renderer.setPixelRatio(Math.min(dpr, 2))
    renderer.setSize(w, h, false)
    layoutMotes()
    layout()
  }

  const render = ({ px, py, intro, time, dt, motion }: ShowcaseInput) => {
    const t = time
    // Tilt in perspective, plus a slow idle sway so it is alive without the pointer.
    const sway = motion ? Math.sin(t * 0.5) * 0.05 : 0
    group.rotation.y += ((px * 0.36 + sway) - group.rotation.y) * Math.min(1, dt * 6)
    group.rotation.x += ((-py * 0.2 + (motion ? Math.cos(t * 0.4) * 0.025 : 0)) - group.rotation.x) * Math.min(1, dt * 6)

    if (figure) {
      const e = 1 - Math.pow(1 - Math.min(1, intro), 3)
      const bob = motion ? Math.sin(t * 0.9) * 6 : 0
      figure.position.y = (0.5 - FIG_CY) * H + bob - (1 - e) * 24
      figure.scale.setScalar((0.9 + 0.1 * e) * FIG_W * REF_W * fit())
      figure.scale.z = 1
      figure.material.uniforms.uOpacity.value = e
    }

    // Motes rise and sway; each wraps round at the top.
    const pos = moteGeo.getAttribute('position') as Float32BufferAttribute
    for (let i = 0; i < count; i++) {
      const rise = motion ? (t * speed[i]) % (H * 1.1) : 0
      let y = base[i * 3 + 1] + rise
      if (y > H * 0.55) y -= H * 1.1
      pos.setXYZ(i, base[i * 3] + (motion ? Math.sin(t * 0.6 + phase[i]) * 8 : 0), y, base[i * 3 + 2])
    }
    pos.needsUpdate = true
    moteMat.opacity = 0.55 * Math.min(1, intro)

    renderer.render(scene, camera)
  }

  const dispose = () => {
    disposed = true
    figure?.geometry.dispose()
    figure?.material.dispose()
    map?.dispose()
    depth?.dispose()
    moteGeo.dispose()
    moteMat.dispose()
    sprite.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }

  return { ready, resize, render, dispose }
}