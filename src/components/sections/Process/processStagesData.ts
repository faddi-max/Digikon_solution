import onboardingImg from '@/assets/images/polaroid.jpg'
import prototypingImg from '@/assets/images/team.jpg'
import uiuxImg from '@/assets/images/projects.jpg'
import developmentImg from '@/assets/images/products/performance-hub.jpg'
import testingImg from '@/assets/images/products/client-portal.jpg'
import qaImg from '@/assets/images/products/marketing-automation.jpg'
import deployImg from '@/assets/images/products/analytics-reporting.jpg'

export type StageId = 'onboarding' | 'prototyping' | 'uiux' | 'development' | 'testing' | 'qa' | 'deploy'

export type Stage = {
  id: StageId
  /** Short name for the step filter. */
  short: string
  title: string
  tags: readonly [string, string, string]
  desc: string
  items: readonly string[]
  outcome: string
  image: string
}

/** Copy from the supplied process reference. */
export const STAGES: readonly Stage[] = [
  {
    id: 'onboarding',
    short: 'Onboarding',
    title: 'Onboarding',
    tags: ['Understand', 'Align', 'Prepare'],
    desc: 'We begin by understanding your business, users, goals and constraints. Together, we align on expectations, responsibilities, communication and what success should look like before the work begins.',
    items: [
      'Kick-off and introductions',
      'Business and user context',
      'Goals, scope and priorities',
      'Roles and communication plan',
      'Access and resource collection',
    ],
    outcome: 'Shared project foundation',
    image: onboardingImg,
  },
  {
    id: 'prototyping',
    short: 'Prototyping',
    title: 'Prototyping',
    tags: ['Explore', 'Map', 'Validate'],
    desc: 'We map key user journeys and turn ideas into a testable model. Low- or high-fidelity prototypes help everyone review structure and interactions early, before expensive implementation decisions are made.',
    items: [
      'User flows and key scenarios',
      'Wireframes and screen structure',
      'Clickable prototype',
      'Early feedback and revisions',
      'Scope and interaction alignment',
    ],
    outcome: 'A validated direction to design',
    image: prototypingImg,
  },
  {
    id: 'uiux',
    short: 'UI/UX',
    title: 'UI/UX Design',
    tags: ['Structure', 'Design', 'Refine'],
    desc: 'We turn the validated direction into a coherent, usable interface. UX decisions guide the flow; UI decisions establish visual hierarchy, components, accessibility considerations and responsive behavior.',
    items: [
      'User experience and navigation',
      'Visual design and components',
      'Responsive screen designs',
      'Design system and states',
      'Design review and sign-off',
    ],
    outcome: 'Approved design specifications',
    image: uiuxImg,
  },
  {
    id: 'development',
    short: 'Development',
    title: 'Development',
    tags: ['Engineer', 'Integrate', 'Review'],
    desc: 'Our team turns approved designs and requirements into a working product. We implement the agreed functionality, connect required services and keep progress visible through structured reviews.',
    items: [
      'Frontend and backend development',
      'Database and API integration',
      'Responsive implementation',
      'Version control and code review',
      'Progress demos and iteration',
    ],
    outcome: 'A functional product build',
    image: developmentImg,
  },
  {
    id: 'testing',
    short: 'Testing',
    title: 'Testing',
    tags: ['Verify', 'Find', 'Fix'],
    desc: 'We check that features behave as intended and that important user journeys work across relevant devices, browsers and scenarios. Issues are logged, prioritized and retested after fixes.',
    items: [
      'Functional and regression tests',
      'User-flow validation',
      'Cross-browser and device checks',
      'Bug tracking and retesting',
      'Basic performance checks',
    ],
    outcome: 'Issues identified and resolved',
    image: testingImg,
  },
  {
    id: 'qa',
    short: 'QA',
    title: 'Quality Assurance',
    tags: ['Review', 'Confirm', 'Approve'],
    desc: 'QA is the release-readiness checkpoint: we review the product against agreed requirements, design expectations and acceptance criteria. It helps confirm the release is consistent, stable and ready to move forward.',
    items: [
      'Requirements and acceptance review',
      'UI consistency and usability checks',
      'Security and access checks as scoped',
      'Defect severity review',
      'Release checklist and sign-off',
    ],
    outcome: 'Release approval against criteria',
    image: qaImg,
  },
  {
    id: 'deploy',
    short: 'Deploy',
    title: 'Deploy',
    tags: ['Release', 'Monitor', 'Handover'],
    desc: 'Once the release is approved, we prepare the production environment and deploy the product. We verify the live experience, hand over relevant documentation and clarify the next support or improvement steps.',
    items: [
      'Production configuration',
      'Release and deployment',
      'Smoke tests on live environment',
      'Documentation and handover',
      'Monitoring and next-step planning',
    ],
    outcome: 'Live product and clear handover',
    image: deployImg,
  },
]
