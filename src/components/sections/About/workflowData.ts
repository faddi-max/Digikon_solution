export type WorkflowStep = {
  id: string
  no: string
  title: string
  body: string
}

/** Content lives here, not in the component, so it can later come from a CMS or API. */
export const WORKFLOW = {
  eyebrow: 'How we work',
  heading: 'A clear path from challenge to progress.',
  accent: ['challenge'],
  /** Step highlighted before the visitor interacts, as in the design frame. */
  initialActive: 2,
  steps: [
    {
      id: 'understand',
      no: '01',
      title: 'Understand the real challenge',
      body: 'We begin with your goals, your audience and the opportunity worth solving.',
    },
    {
      id: 'direction',
      no: '02',
      title: 'Find the right direction',
      body: 'We bring priorities into focus and turn complexity into a clear plan.',
    },
    {
      id: 'build',
      no: '03',
      title: 'Build with intention',
      body: 'Strategy, design and technology work together as one coherent experience.',
    },
    {
      id: 'learn',
      no: '04',
      title: 'Learn, refine, improve',
      body: 'We keep looking for the next useful improvement, not just the finish line.',
    },
  ] as readonly WorkflowStep[],
} as const
