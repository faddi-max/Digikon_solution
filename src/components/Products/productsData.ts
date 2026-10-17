export type ToolKind = 'analytics' | 'automation' | 'seo' | 'portal' | 'content' | 'performance'

export type Tool = {
  id: string
  kind: ToolKind
  title: string
  /** One line, shown when the card is open. Draft copy: confirm before launch. */
  blurb: string
  /**
   * Basename (no extension) of an exported screenshot in src/assets/images/products/.
   * If the file is missing, the built-in illustration for `kind` is drawn instead.
   */
  art: string
}

/** Where "Show all tools" and every card point. Swap for a products page when one exists. */
export const PRODUCTS_HREF = '#contact'

/** Order matches the Figma frame, left to right. */
export const TOOLS: readonly Tool[] = [
  {
    id: 'analytics-reporting',
    kind: 'analytics',
    title: 'Analytics & Reporting',
    blurb: 'Dashboards that connect activity to outcomes.',
    art: 'analytics-reporting',
  },
  {
    id: 'marketing-automation',
    kind: 'automation',
    title: 'Marketing Automation',
    blurb: 'Workflows that handle the repetitive steps.',
    art: 'marketing-automation',
  },
  {
    id: 'seo-workspace',
    kind: 'seo',
    title: 'SEO Workspace',
    blurb: 'Rankings, audits and fixes in one place.',
    art: 'seo-workspace',
  },
  {
    id: 'client-portal',
    kind: 'portal',
    title: 'Client Portal',
    blurb: 'One shared view of progress and deliverables.',
    art: 'client-portal',
  },
  {
    id: 'content-studio',
    kind: 'content',
    title: 'Content Studio',
    blurb: 'Plan, draft and review content together.',
    art: 'content-studio',
  },
  {
    id: 'performance-hub',
    kind: 'performance',
    title: 'Performance Hub',
    blurb: 'Live signals across every channel.',
    art: 'performance-hub',
  },
]
