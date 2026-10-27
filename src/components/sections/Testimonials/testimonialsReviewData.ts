export type ReviewTone = 'dark' | 'light' | 'green'

export type Review = {
  id: string
  tone: ReviewTone
  /** Quote size step: lg for the wide cards, md for the first light card, sm for the rest. */
  size: 'lg' | 'md' | 'sm'
  quote: string
  name: string
  role: string
  company: string
  /** Optional portrait URL. Without it, the supplied dummy avatar is used. */
  avatar?: string
}

/**
 * PLACEHOLDERS ONLY, copied from the design. Names, roles and companies were not legible in
 * the design image. Replace everything here with approved client testimonials before launch,
 * and do not present these as real quotes.
 *
 * Order matters: the layout slots are fixed to this order (see Testimonialsreview.css).
 */
export const REVIEWS: readonly Review[] = [
  {
    id: 'r1',
    tone: 'dark',
    size: 'lg',
    quote:
      'The first two weeks changed everything. They asked the questions we had been avoiding and left us with a plan everyone on our side actually agreed on.',
    name: 'Anna Carlson',
    role: 'Role',
    company: 'Company',
  },
  {
    id: 'r2',
    tone: 'light',
    size: 'md',
    quote: 'For once, nobody had to chase anyone. Roles, timelines and contacts were clear from day one.',
    name: 'Daniel Clarke',
    role: 'Role',
    company: 'Company',
  },
  {
    id: 'r3',
    tone: 'green',
    size: 'sm',
    quote: 'Clicking through a prototype in week three saved us from at least two expensive wrong turns.',
    name: 'Sara Habib',
    role: 'Role',
    company: 'Company',
  },
  {
    id: 'r4',
    tone: 'dark',
    size: 'sm',
    quote:
      'The design felt considered, not decorated. Every screen had a reason, and they explained it in plain language.',
    name: 'James Wilson',
    role: 'Role',
    company: 'Company',
  },
  {
    id: 'r5',
    tone: 'dark',
    size: 'sm',
    quote:
      'Our users noticed the difference immediately. The interface is calmer, clearer and much easier to move around.',
    name: 'Priya Nair',
    role: 'Role',
    company: 'Company',
  },
  {
    id: 'r6',
    tone: 'light',
    size: 'lg',
    quote:
      'Regular demos meant we saw real progress every week, not status slides. When something needed a decision, they brought options and a recommendation instead of a problem.',
    name: 'Hana Rossi',
    role: 'Role',
    company: 'Company',
  },
  {
    id: 'r7',
    tone: 'dark',
    size: 'sm',
    quote:
      'Bugs were logged, ranked and retested. We always knew what had been found and what had been fixed.',
    name: 'Lena Haddad',
    role: 'Role',
    company: 'Company',
  },
  {
    id: 'r8',
    tone: 'green',
    size: 'sm',
    quote:
      'The release checklist gave our whole team confidence. Sign-off felt like a decision, not a leap of faith.',
    name: 'Tom Becker',
    role: 'Role',
    company: 'Company',
  },
  {
    id: 'r9',
    tone: 'dark',
    size: 'lg',
    quote:
      'Launch day was quiet in the best way. The handover notes meant our team could take over without a scramble.',
    name: 'Maria Kane',
    role: 'Role',
    company: 'Company',
  },
]

export const REVIEW_COPY = {
  eyebrow: 'Notes from the journey',
  lead: 'What clients said,',
  accent: 'stage by stage.',
  accentWords: ['stage', 'by', 'stage.'],
} as const