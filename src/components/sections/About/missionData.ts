export type MissionTone = 'strong' | 'muted' | 'accent'

export type MissionPart = { text: string; tone: MissionTone }

/** Content lives here, not in the component, so it can later come from a CMS or API. */
export const MISSION = {
  eyebrow: 'Our Mission',
  /** One entry per display line. Words listed in `accent` render in brand green. */
  headlineLines: ['Digital that moves', 'business forward.'] as const,
  accent: ['business', 'forward.'] as const,
  /** First paragraph, in reading order. */
  lead: [
    { text: 'We connect strategy, design and technology', tone: 'strong' },
    { text: ' to create digital experiences that feel clear, useful and ', tone: 'muted' },
    { text: 'made to perform.', tone: 'accent' },
  ] as readonly MissionPart[],
  /** Second line, on its own row. */
  closing: 'Less complexity. More purpose. Better momentum.',
} as const
