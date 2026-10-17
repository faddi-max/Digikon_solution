export type ServiceTheme = 'seo' | 'web' | 'content' | 'analytics' | 'automation'

export type Service = {
  id: string
  theme: ServiceTheme
  no: string
  title: string
  /** Basename (no extension) of the exported mockup in src/assets/images/services/. */
  art: string
  points: ReadonlyArray<{ label: string; lead: string; tail?: string }>
  href: string
}

/** Copy read from the Figma "All Services" frame. */
export const SERVICES: readonly Service[] = [
  {
    id: 'search-seo',
    theme: 'seo',
    no: '01',
    title: 'Search & SEO',
    art: 'search-seo',
    points: [
      { label: 'Technical & authority', lead: 'We fix the foundations first.', tail: 'Then build authority that compounds.' },
      { label: 'Content architecture', lead: 'Pages mapped to real intent,', tail: 'so every article has a job.' },
    ],
    href: '#contact',
  },
  {
    id: 'web-design',
    theme: 'web',
    no: '02',
    title: 'Web design & build',
    art: 'web-design',
    points: [
      { label: 'Designed for action', lead: 'Sites shaped around what matters. Clear, fast, accessible.' },
      { label: 'Content architecture', lead: 'Clean engineering you can grow, not rebuild in a year.' },
    ],
    href: '#contact',
  },
  {
    id: 'content-editorial',
    theme: 'content',
    no: '03',
    title: 'Content & editorial',
    art: 'content-editorial',
    points: [
      { label: 'Useful writing', lead: 'Clear answers to real questions. No filler, no fluff.' },
      { label: 'Editorial systems', lead: 'A voice, a structure, a cadence your team can keep up.' },
    ],
    href: '#contact',
  },
  {
    id: 'analytics-reporting',
    theme: 'analytics',
    no: '04',
    title: 'Analytics & reporting',
    art: 'analytics-reporting',
    points: [
      { label: 'Tracking you can trust', lead: 'Set up once, set up right. Numbers worth believing.' },
      { label: 'Outcome-led reporting', lead: 'Activity connected to revenue, in plain language.' },
    ],
    href: '#contact',
  },
  {
    id: 'automation-ai',
    theme: 'automation',
    no: '05',
    title: 'Automation & AI',
    art: 'automation-ai',
    points: [
      { label: 'Workflows', lead: 'Repetitive steps handled, so people handle the judgement.' },
      { label: 'Intelligent assist', lead: 'AI where it earns its place, with a human in the loop.' },
    ],
    href: '#contact',
  },
]
