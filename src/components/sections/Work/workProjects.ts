import analytics from '@/assets/images/products/marketing-automation.jpg'
import portal from '@/assets/images/products/performance-hub.jpg'
import editorial from '@/assets/images/products/content-studio.png'
import platform from '@/assets/images/services/web-design.png'
import metrics from '@/assets/images/products/analytics-reporting.jpg'
import mobile from '@/assets/images/products/seo-workspace.png'
import clientPortal from '@/assets/images/products/client-portal.jpg'
import dashboard from '@/assets/images/services/analytics-reporting.png'
import technology from '@/assets/images/about-hero-technology.png'

export type WorkProject = {
  slug: string
  title: string
  /** Short label shown on the card and above the title, e.g. "Product · UX". */
  tag: string
  /** One line used on the gallery card. */
  summary: string
  /** One or two lines under the title on the details page. */
  intro: string
  image: string
  gallery: readonly [string, string]
  meta: { client: string; year: string; role: string; timeline: string }
  overview: string
  approach: string
  stats: readonly { value: string; label: string }[]
}

/**
 * Placeholder case studies copied from the design. Replace the copy and figures with
 * approved client work before launch; none of these are real results.
 */
export const WORK_PROJECTS: readonly WorkProject[] = [
  {
    slug: 'northstar-analytics',
    title: 'Northstar Analytics',
    tag: 'Platform · Growth',
    summary: 'Turning complex performance data into one clear, confident decision-making experience.',
    intro: 'A single performance view that turns scattered reports into decisions teams can act on.',
    image: analytics,
    gallery: [analytics, metrics],
    meta: {
      client: 'Northstar Group',
      year: '2025',
      role: 'Product strategy, UX, Build',
      timeline: '14 weeks',
    },
    overview:
      'Northstar tracked growth across a dozen tools and reviewed it in weekly slide decks. We brought the numbers into one platform with a clear hierarchy, so leaders see what changed and why before the meeting starts.',
    approach:
      'We mapped the decisions teams make each week, then designed the dashboard backwards from them. Shared metric definitions, drill-downs and a calm visual system keep every view consistent as new data sources arrive.',
    stats: [
      { value: '58%', label: 'Faster weekly reporting' },
      { value: '4×', label: 'More teams using the data' },
      { value: '91', label: 'Satisfaction score after launch' },
    ],
  },
  {
    slug: 'formflow',
    title: 'Formflow',
    tag: 'Product · UX',
    summary: 'Smarter form workflows that remove friction and lift completion.',
    intro: 'A friction-light workflow that makes complicated tasks feel simple.',
    image: portal,
    gallery: [analytics, portal],
    meta: {
      client: 'Formflow Labs',
      year: '2025',
      role: 'Product design, Design system',
      timeline: '10 weeks',
    },
    overview:
      "Formflow's builder had grown into feature-rich software that new users found hard to start. We simplified the first steps, removed the clutter and rebuilt the first hour of the experience around quick wins.",
    approach:
      'We rebuilt the core flow around a single canvas, backed by a documented component library of colors, type styles, widgets and templates, so design and engineering ship from the same source of truth.',
    stats: [
      { value: '46%', label: 'Faster steps to first touch' },
      { value: '3×', label: 'Quicker design-to-build handoff' },
      { value: '72', label: 'Net promoter score after launch' },
    ],
  },
  {
    slug: 'fieldnotes-studio',
    title: 'Fieldnotes Studio',
    tag: 'Editorial · Content',
    summary: 'A content-first editorial platform built around readers and writers.',
    intro: 'An editorial home that gives writers room to work and readers a reason to stay.',
    image: editorial,
    gallery: [editorial, clientPortal],
    meta: {
      client: 'Fieldnotes Studio',
      year: '2025',
      role: 'Content strategy, Design, Build',
      timeline: '12 weeks',
    },
    overview:
      'Fieldnotes publishes long-form pieces that deserved a better home. We designed a reading experience that puts the writing first and a publishing workflow editors could run without developers.',
    approach:
      'A flexible article system, calm typography and a small set of reusable story layouts let the team publish quickly while every page keeps the same quality and rhythm.',
    stats: [
      { value: '2.4×', label: 'Longer average reading time' },
      { value: '63%', label: 'Faster publishing workflow' },
      { value: '88', label: 'Reader satisfaction score' },
    ],
  },
  {
    slug: 'evergreen-properties',
    title: 'Evergreen Properties',
    tag: 'Platform · Real estate',
    summary: 'A refreshed property platform that makes browsing, enquiring and managing simple.',
    intro: 'A property platform where finding, enquiring and managing a home all feel effortless.',
    image: platform,
    gallery: [platform, dashboard],
    meta: {
      client: 'Evergreen Group',
      year: '2026',
      role: 'Strategy, UX, Engineering',
      timeline: '16 weeks',
    },
    overview:
      'Evergreen listed properties across several disconnected systems. We unified search, enquiries and account management into one platform that works equally well for buyers and for the team behind them.',
    approach:
      'We started with the enquiry journey, simplified search and filtering, and connected the front end to a single listings source so the information on screen is always current.',
    stats: [
      { value: '39%', label: 'More enquiries per visit' },
      { value: '2×', label: 'Faster listing updates' },
      { value: '84', label: 'Net promoter score after launch' },
    ],
  },
  {
    slug: 'signal-metrics',
    title: 'Signal Metrics',
    tag: 'Analytics · Intelligence',
    summary: 'A real-time insight engine that turns noisy signals into actionable decisions.',
    intro: 'A real-time view of performance that separates the signal from the noise.',
    image: metrics,
    gallery: [metrics, analytics],
    meta: {
      client: 'Signal Metrics Inc.',
      year: '2026',
      role: 'Data design, Engineering',
      timeline: '12 weeks',
    },
    overview:
      'Signal collected more data than anyone could read. We designed an insight layer that highlights what moved, how far and what to look at next, instead of adding more charts.',
    approach:
      'Metrics were grouped around questions teams actually ask. Anomaly cues, comparisons and a consistent chart language make the important change obvious at a glance.',
    stats: [
      { value: '71%', label: 'Faster time to insight' },
      { value: '5×', label: 'More metrics reviewed weekly' },
      { value: '93', label: 'Satisfaction score after launch' },
    ],
  },
  {
    slug: 'orbit-companion',
    title: 'Orbit Companion',
    tag: 'Mobile · Experience',
    summary: 'A mobile companion that keeps teams connected, wherever work happens.',
    intro: 'A mobile companion that keeps teams in step, wherever the work happens.',
    image: mobile,
    gallery: [mobile, technology],
    meta: {
      client: 'Orbit Collective',
      year: '2026',
      role: 'Mobile design, Build',
      timeline: '11 weeks',
    },
    overview:
      'Orbit teams spent their day switching between tools on their phones. We designed one companion app that brings updates, tasks and conversations together without the noise.',
    approach:
      'We designed for one-handed, in-the-moment use first, then layered in notifications and offline support so the app stays useful away from a desk.',
    stats: [
      { value: '52%', label: 'Fewer missed updates' },
      { value: '3.5×', label: 'More daily active use' },
      { value: '81', label: 'Net promoter score after launch' },
    ],
  },
]

export function findProject(slug: string | undefined) {
  return WORK_PROJECTS.find((p) => p.slug === slug)
}

export function nextProject(slug: string) {
  const i = WORK_PROJECTS.findIndex((p) => p.slug === slug)
  return WORK_PROJECTS[(i + 1) % WORK_PROJECTS.length]
}
