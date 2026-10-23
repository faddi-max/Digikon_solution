export type PolicyBlock = { heading: string; body: string }

export type PolicySection = {
  id: string
  title: string
  /** Shown under the title on every card. */
  status: string
  intro: string
  blocks: readonly PolicyBlock[]
}

export const PRIVACY_PAGE = {
  eyebrow: 'The fine print',
  updated: 'Oct 26',
  headingBefore: 'Read the',
  headingAccent: 'fine print',
  headingAfter: 'without losing the plot.',
  intro:
    'We believe clarity is part of good digital work. Explore the library by topic, or move through the sections in order. The copy below is sample data for layout and review purposes, and should be replaced with approved legal content before launch.',
  sidebarTitle: 'Browse sections',
  legalCenter: { label: 'Legal Center', href: '/contact' },
}

const STATUS = 'Sample content — replace before launch'

const GENERIC_BLOCKS: readonly PolicyBlock[] = [
  {
    heading: 'Sample guidelines',
    body: 'Please use our services lawfully, provide accurate information when requested, and avoid actions that could disrupt the experience for other visitors or clients.',
  },
]

/** Sample copy only. Replace with approved legal text before launch. */
export const POLICY_SECTIONS: readonly PolicySection[] = [
  {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    status: STATUS,
    intro:
      'This sample privacy policy describes how DigiKon may handle information connected with this website, project inquiries, and digital services.',
    blocks: [
      {
        heading: 'Information we may receive',
        body: 'Depending on how you interact with us, this may include contact details you submit, messages you send, and technical information such as browser type or pages viewed.',
      },
      {
        heading: 'How it may be used',
        body: 'Sample uses include responding to requests, improving our website, protecting our services, and communicating about related projects.',
      },
    ],
  },
  {
    id: 'terms-conditions',
    title: 'Terms & Conditions',
    status: STATUS,
    intro:
      'This sample section explains the general expectations that may apply when you use DigiKon’s website, services, or digital resources. The final policy will be reviewed and updated to reflect the specific services.',
    blocks: GENERIC_BLOCKS,
  },
  {
    id: 'cookie-policy',
    title: 'Cookie Policy',
    status: STATUS,
    intro:
      'This sample section explains the general expectations that may apply when you use DigiKon’s website, services, or digital resources. The final policy will be reviewed and updated to reflect the specific services.',
    blocks: GENERIC_BLOCKS,
  },
  {
    id: 'refund-cancellation',
    title: 'Refund & Cancellation',
    status: STATUS,
    intro:
      'This sample section explains the general expectations that may apply when you use DigiKon’s website, services, or digital resources. The final policy will be reviewed and updated to reflect the specific services.',
    blocks: GENERIC_BLOCKS,
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use',
    status: STATUS,
    intro:
      'This sample section explains the general expectations that may apply when you use DigiKon’s website, services, or digital resources. The final policy will be reviewed and updated to reflect the specific services.',
    blocks: GENERIC_BLOCKS,
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    status: STATUS,
    intro:
      'This sample section explains the general expectations that may apply when you use DigiKon’s website, services, or digital resources. The final policy will be reviewed and updated to reflect the specific services.',
    blocks: GENERIC_BLOCKS,
  },
]
