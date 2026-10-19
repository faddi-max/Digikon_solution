export const FILTERS = ['All work', 'Platforms', 'Product', 'Editorial', 'Analytics', 'Mobile'] as const
export type WorkFilter = (typeof FILTERS)[number]

export type Project = {
  id: string
  title: string
  category: Exclude<WorkFilter, 'All work'>
  year: string
  summary: string
  tags: readonly string[]
  href: string
  /** Basename (no extension) of the visual in src/assets/images/services/. */
  art: string
}

/**
 * Placeholders only, copied from the design. Replace with approved client work
 * before launch. Do not present these as real projects.
 */
export const PROJECTS: readonly Project[] = [
  {
    id: 'project-one',
    title: 'Project one',
    category: 'Platforms',
    year: '[YEAR]',
    summary: '[One line on the challenge and what changed for the client.]',
    tags: ['Strategy', 'UX', 'Build'],
    href: '#contact',
    art: 'web-design',
  },
  {
    id: 'project-two',
    title: 'Project two',
    category: 'Product',
    year: '[YEAR]',
    summary: '[One line on the challenge and what changed for the client.]',
    tags: ['Strategy', 'UX', 'Build'],
    href: '#contact',
    art: 'automation-ai',
  },
  {
    id: 'project-three',
    title: 'Project three',
    category: 'Editorial',
    year: '[YEAR]',
    summary: '[One line on the challenge and what changed for the client.]',
    tags: ['Strategy', 'UX', 'Build'],
    href: '#contact',
    art: 'content-editorial',
  },
  {
    id: 'project-four',
    title: 'Project four',
    category: 'Analytics',
    year: '[YEAR]',
    summary: '[One line on the challenge and what changed for the client.]',
    tags: ['Strategy', 'UX', 'Build'],
    href: '#contact',
    art: 'analytics-reporting',
  },
  {
    id: 'project-five',
    title: 'Project five',
    category: 'Mobile',
    year: '[YEAR]',
    summary: '[One line on the challenge and what changed for the client.]',
    tags: ['Strategy', 'UX', 'Build'],
    href: '#contact',
    art: 'search-seo',
  },
]
