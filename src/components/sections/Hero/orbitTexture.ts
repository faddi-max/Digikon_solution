import { CanvasTexture, SRGBColorSpace } from 'three'

type Stops = Array<[number, string]>

/** Start and end points of a CSS linear-gradient(angle) across a w×h box. */
function cssGradientLine(w: number, h: number, deg: number) {
  const a = (deg * Math.PI) / 180
  const dx = Math.sin(a)
  const dy = -Math.cos(a)
  const len = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a))
  const cx = w / 2
  const cy = h / 2
  return [cx - (dx * len) / 2, cy - (dy * len) / 2, cx + (dx * len) / 2, cy + (dy * len) / 2]
}

/**
 * Rounded-rect path matching CSS border-radius. The radius is clamped to half
 * the shorter side, as CSS does.
 */
function shapePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.lineTo(x + w - rr, y)
  ctx.arcTo(x + w, y, x + w, y + rr, rr)
  ctx.lineTo(x + w, y + h - rr)
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr)
  ctx.lineTo(x + rr, y + h)
  ctx.arcTo(x, y + h, x, y + h - rr, rr)
  ctx.lineTo(x, y + rr)
  ctx.arcTo(x, y, x + rr, y, rr)
  ctx.closePath()
}

/**
 * Draws one disc (w×h design px) with the CSS gradient, CSS-style corner radius
 * and a soft shadow into a canvas texture. Padding leaves room for the shadow.
 */
export function createNodeTexture(
  w: number,
  h: number,
  angle: number,
  stops: Stops,
  radius: number,
) {
  const pad = 28
  const res = 3
  const W = w + pad * 2
  const H = h + pad * 2

  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(W * res)
  canvas.height = Math.ceil(H * res)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable for orbit texture')

  ctx.scale(res, res)

  // Shadow pass
  ctx.save()
  ctx.shadowColor = 'rgba(3, 23, 29, 0.35)'
  ctx.shadowBlur = 24 * res
  ctx.shadowOffsetY = 12 * res
  shapePath(ctx, pad, pad, w, h, radius)
  ctx.fillStyle = '#03171d'
  ctx.fill()
  ctx.restore()

  // Gradient fill
  const [x0, y0, x1, y1] = cssGradientLine(w, h, angle)
  const gradient = ctx.createLinearGradient(pad + x0, pad + y0, pad + x1, pad + y1)
  for (const [offset, color] of stops) gradient.addColorStop(offset, color)

  shapePath(ctx, pad, pad, w, h, radius)
  ctx.fillStyle = gradient
  ctx.fill()

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4

  return { tex, width: W, height: H }
}

/* ------------------------------------------------------------------ */
/* Glyph layer: icon + label drawn into a texture, no DOM overlay.     */
/* ------------------------------------------------------------------ */

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

/** Resolves once Manrope is available for canvas text. Never rejects. */
export async function loadOrbitFonts() {
  try {
    if (!document.fonts) return
    await Promise.all([
      document.fonts.load("700 11px 'Manrope'"),
      document.fonts.load("700 28px 'Manrope'"),
    ])
  } catch {
    /* fall back to the system font stack */
  }
}

type GlyphOptions = {
  /** Disc box in design px. The glyph texture covers exactly this box. */
  w: number
  h: number
  image: HTMLImageElement | null
  /** Icon box in design px. The image is scaled to fit inside it (contain). */
  iconW: number
  iconH: number
  label?: string
  ink: string
  /** Drawn in the icon box when the image is missing or failed to load. */
  fallback?: string
}

const FONT_STACK = "'Manrope', system-ui, sans-serif"
const LABEL_SIZE = 11
const LABEL_SPACING = 0.14 * LABEL_SIZE
const LABEL_GAP = 0.35 * LABEL_SIZE

/** Letter-spaced text centred on cx. Manual spacing works in every browser. */
function drawSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  spacing: number,
) {
  const chars = Array.from(text)
  const widths = chars.map((c) => ctx.measureText(c).width)
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)
  let x = cx - total / 2
  ctx.textAlign = 'left'
  chars.forEach((c, i) => {
    ctx.fillText(c, x, cy)
    x += widths[i] + spacing
  })
}

export function createGlyphTexture(o: GlyphOptions) {
  const res = 3
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(o.w * res)
  canvas.height = Math.ceil(o.h * res)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable for orbit glyph')

  ctx.scale(res, res)
  ctx.imageSmoothingQuality = 'high'

  // Icon and label are centred together as one column, like the old flex layout.
  const labelBlock = o.label ? LABEL_GAP + LABEL_SIZE : 0
  const top = (o.h - (o.iconH + labelBlock)) / 2
  const boxX = (o.w - o.iconW) / 2

  const img = o.image
  if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
    const s = Math.min(o.iconW / img.naturalWidth, o.iconH / img.naturalHeight)
    const dw = img.naturalWidth * s
    const dh = img.naturalHeight * s
    ctx.drawImage(img, boxX + (o.iconW - dw) / 2, top + (o.iconH - dh) / 2, dw, dh)
  } else if (o.fallback) {
    ctx.fillStyle = o.ink
    ctx.font = `700 28px ${FONT_STACK}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(o.fallback, o.w / 2, top + o.iconH / 2)
  }

  if (o.label) {
    ctx.fillStyle = o.ink
    ctx.font = `700 ${LABEL_SIZE}px ${FONT_STACK}`
    ctx.textBaseline = 'middle'
    drawSpaced(
      ctx,
      o.label.toUpperCase(),
      o.w / 2,
      top + o.iconH + LABEL_GAP + LABEL_SIZE / 2,
      LABEL_SPACING,
    )
  }

  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}