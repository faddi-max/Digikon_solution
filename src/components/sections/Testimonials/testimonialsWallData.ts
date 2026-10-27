export type ClientLogo = {
  id: string
  name: string
  /** Approved logo (SVG or PNG). Without it, a labelled placeholder is drawn. */
  src?: string
}

/** PLACEHOLDERS ONLY. Replace with approved client logos before launch. */
export const CLIENT_LOGOS: readonly ClientLogo[] = Array.from({ length: 8 }, (_, i) => ({
  id: `client-${i + 1}`,
  name: `Client ${i + 1}`,
}))

export const WALL_COPY = { eyebrow: 'Trusted by' } as const