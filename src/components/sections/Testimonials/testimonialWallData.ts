export type WallTone = 'dark' | 'light' | 'green'

export type WallItem = {
  id: string
  tone: WallTone
  /** Columns taken on desktop (12-column grid). */
  span: number
  /** Takes the full row on tablet (2-column grid). */
  wide?: boolean
  /** Larger quote type for the feature cards. */
  feature?: boolean
  quote: string
  name: string
  role: string
  company: string
}

/**
 * PLACEHOLDERS ONLY. Quote copy follows the design; names, roles and companies are not real.
 * Replace with approved client testimonials before launch, and do not present these as real quotes.
 */
export const WALL_ITEMS: readonly WallItem[] = [
  {
    id: 'w1',
    tone: 'dark',
    span: 7,
    wide: true,
    feature: true,
    quote:
      'The first two weeks changed everything. They asked the questions we had been avoiding and left us with a plan everyone on our side actually agreed on.',
    name: 'Client name',
    role: 'Role',
    company: 'Company',
  },
  {
    id: 'w2',
    tone: 'light',
    span: 5,
    quote:
      'For once, nobody had to chase anyone. Roles, timelines and contacts were clear from day one.',
    name: 'Client name',
    role: 'Role',
    company: 'Company',
  },
  {
    id: 'w3',
    tone: 'green',
    span: 4,
    quote:
      'Clicking through a prototype in week three saved us at least two expensive wrong turns.',
    name: 'Client name',
    role: 'Role',
    company: 'Company',
  },
  {
    id: 'w4',
    tone: 'dark',
    span: 4,
    quote:
      'The design felt considered, not decorated. Every screen had a reason, and they explained it in plain language.',
    name: 'Client name',
    role: 'Role',
    company: 'Company',
  },
  {
    id: 'w5',
    tone: 'dark',
    span: 4,
    quote:
      'Our users noticed the difference immediately. The product is calmer, clearer and much easier to move around.',
    name: 'Client name',
    role: 'Role',
    company: 'Company',
  },
  {
    id: 'w6',
    tone: 'light',
    span: 8,
    wide: true,
    feature: true,
    quote:
      'Regular demos meant we saw real progress every week, not status slides. When something needed a decision, they brought options and a recommendation instead of a problem.',
    name: 'Client name',
    role: 'Role',
    company: 'Company',
  },
  {
    id: 'w7',
    tone: 'dark',
    span: 4,
    quote:
      'Bugs were logged, ranked and retested. We always knew what had been found and what had been fixed.',
    name: 'Client name',
    role: 'Role',
    company: 'Company',
  },
  {
    id: 'w8',
    tone: 'green',
    span: 5,
    quote:
      'The release checklist gave our whole team confidence. Sign-off felt like a decision, not a leap of faith.',
    name: 'Client name',
    role: 'Role',
    company: 'Company',
  },
  {
    id: 'w9',
    tone: 'dark',
    span: 7,
    wide: true,
    feature: true,
    quote:
      'Launch day was quiet in the best way. The handover notes meant our team could take over without a scramble.',
    name: 'Client name',
    role: 'Role',
    company: 'Company',
  },
]