import { WORK_PROJECTS } from './workProjects'

export const FILTERS = ['All work', 'Platforms', 'Product', 'Editorial', 'Analytics', 'Mobile'] as const
export type WorkFilter = (typeof FILTERS)[number]

export type Project = {
  id: string
  title: string
  category: Exclude<WorkFilter, 'All work'>
  year: string
  summary: string
  tags: readonly string[]
  /** Project details page. */
  href: string
  /** Project visual, imported by workProjects.ts. */
  image: string
}

const CATEGORY: Record<string, Project['category']> = {
  Platform: 'Platforms',
  Product: 'Product',
  Editorial: 'Editorial',
  Analytics: 'Analytics',
  Mobile: 'Mobile',
}

/** The same placeholder projects as the gallery and the details pages (see workProjects.ts). */
export const PROJECTS: readonly Project[] = WORK_PROJECTS.map((p) => ({
  id: p.slug,
  title: p.title,
  category: CATEGORY[p.tag.split(' · ')[0]] ?? 'Platforms',
  year: p.meta.year,
  summary: p.summary,
  tags: p.meta.role.split(', ').slice(0, 3),
  href: `/work/${p.slug}`,
  image: p.image,
}))
