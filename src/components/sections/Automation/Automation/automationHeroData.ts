export type SignalIcon = 'mail' | 'table' | 'check'
export type OutcomeIcon = 'forward' | 'ring' | 'bolt'

export type AutomationHeroData = {
  /** Breadcrumb tail and the small label above the headline. */
  crumb: string
  label: string
  /** Two plain headline lines, then the accent line that carries the marker. */
  lines: readonly [string, string]
  accent: string
  body: string
  primary: { label: string; to: string }
  secondary: { label: string; href: string }
  /** Small line next to the avatars. */
  assurance: string
  /** Label under the robot. */
  core: { title: string; caption: string }
  /** The three status cards that float around the robot. Illustrative, not live data. */
  signals: readonly { id: string; title: string; caption: string; icon: SignalIcon }[]
  /** The strip under the hero. */
  outcomes: {
    title: string
    note: string
    items: readonly { icon: OutcomeIcon; title: string; caption: string }[]
  }
  /** Accessible description of the illustration. */
  illustrationLabel: string
}

/**
 * Copy read from the Figma "Automation & AI" hero.
 *
 * Nothing here is a measured result: the status cards illustrate a workflow, and the outcomes
 * strip deliberately carries no figures. Add numbers only when they are real and sourced.
 */
export const AUTOMATION_HERO: AutomationHeroData = {
  crumb: 'Automation & AI',
  label: 'Automation & AI',
  lines: ['Your', 'business,'],
  accent: 'on autopilot.',
  body: 'Imagine every tool, handoff, and routine task moving in sync. DigiKon designs intelligent systems that take work off your team’s plate—and keep the important things moving.',
  primary: { label: 'Build your workflow', to: '/contact' },
  // The "how it works" section is not built yet, so this points at the FAQ, the closest answer.
  secondary: { label: 'See how it works', href: '#faqs' },
  assurance: 'Thoughtful systems. Less manual work. More momentum.',
  core: { title: 'DigiKon AI Core', caption: 'Connecting the work behind your business' },
  signals: [
    { id: 'request', title: 'New request', caption: 'Trigger received', icon: 'mail' },
    { id: 'data', title: 'Data organised', caption: 'AI processing', icon: 'table' },
    { id: 'action', title: 'Action complete', caption: 'Workflow updated', icon: 'check' },
  ],
  outcomes: {
    title: 'Measure the work you get back.',
    note: 'Outcomes depend on your workflow, tools, and starting point.',
    items: [
      { icon: 'forward', title: 'Less manual handling', caption: 'Automate repeatable steps' },
      { icon: 'ring', title: 'More consistent processes', caption: 'Clear rules and handoffs' },
      { icon: 'bolt', title: 'Connected business tools', caption: 'Information moves in sync' },
    ],
  },
  illustrationLabel:
    'Illustration of the DigiKon AI assistant turning a new request into organised data and a completed action.',
}
