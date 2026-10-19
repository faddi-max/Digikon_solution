export type ServiceHeroData = {
  /** Breadcrumb tail and the small label above the headline. */
  crumb: string
  label: string
  /** Two plain headline lines, then the accent line that carries the marker. */
  lines: readonly [string, string]
  accent: string
  body: string
  primary: { label: string; to: string }
  secondary: { label: string; href: string }
  mock: {
    /** Text typed into the mock browser's address bar. */
    query: string
    rank: string
    metricLabel: string
    /** Illustrative figure shown in the mock card, counted up on entry. */
    metric: number
    metricCaption: string
  }
}

/**
 * Copy read from the Figma "Search & SEO" hero.
 *
 * The +147% in the mock card is part of the illustration, not a measured result. Replace
 * it with a real, sourced figure or remove the card before launch.
 */
export const SEO_HERO: ServiceHeroData = {
  crumb: 'Search & SEO',
  label: 'Search & SEO',
  lines: ['Be found by the', 'people who'],
  accent: 'matter.',
  body: 'We help businesses improve search visibility and attract relevant audiences through thoughtful SEO strategy — connecting search intent with meaningful content so the right people find you, understand your value, and take the next step.',
  primary: { label: 'Start a project', to: '/contact' },
  secondary: { label: 'Explore our approach', href: '#services' },
  mock: {
    query: 'search — digikon solutions seo',
    rank: 'RANK #1',
    metricLabel: 'Organic growth',
    metric: 147,
    metricCaption: 'Visibility improvement indicator',
  },
}
