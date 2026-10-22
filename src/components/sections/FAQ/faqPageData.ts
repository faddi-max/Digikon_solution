/**
 * Content for the FAQ page (/faqs).
 *
 * The answers describe how DigiKon works in general terms and avoid numbers, guarantees and
 * client claims. Lines marked `CONFIRM` state a policy (ownership, payment, revisions,
 * support) and should be checked against the real contract before launch.
 */

export type FaqEntry = {
  /** Stable slug, used for the item's id and #deep-links. */
  id: string
  q: string
  a: string
}

export type FaqCategory = {
  id: string
  title: string
  /** One line under the title in the left column. */
  blurb: string
  items: readonly FaqEntry[]
}

export const FAQ_HERO = {
  crumb: 'FAQ',
  label: 'FAQ',
  line: 'Strong',
  accent: 'Answers',
  body: 'Pick a question and the team answers. No sales script, just how we actually work.',
} as const

export const FAQ_CATEGORIES: readonly FaqCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    blurb: 'The first conversation, and what happens after it.',
    items: [
      {
        id: 'first-engagement',
        q: 'What does a first engagement look like?',
        a: 'It starts with a discovery call. We learn your goals, look at what you have today and agree on a clear first piece of work, usually an audit or a focused project, before anything is signed.',
      },
      {
        id: 'one-service',
        q: 'Can I use just one service?',
        a: 'Yes. Plenty of clients start with one thing, like a new website or SEO, and add more once they have seen how we work. Every service stands on its own.',
      },
      {
        id: 'who-we-work-with',
        q: 'What kind of businesses do you work with?',
        a: 'Teams that want their website, search and content to do measurable work for the business. Size matters less than having a clear goal and someone on your side who can make decisions.',
      },
      {
        id: 'need-a-brief',
        q: 'Do I need a detailed brief before we talk?',
        a: 'No. A rough goal is enough. Part of discovery is turning what you know into a brief we both agree on, so you never pay for work that was guessed at.',
      },
      {
        id: 'existing-agency',
        q: 'What if I already work with another agency?',
        a: 'That is common. We can take on a defined part of the work alongside them, or plan a clean handover. Either way we agree who owns what before we start.',
      },
      {
        id: 'how-to-start',
        q: 'How do I get started?',
        a: 'Book a call or send us a message through the contact page. We reply with a few questions and a time to talk, and the discovery call takes it from there.',
      },
    ],
  },
  {
    id: 'services-scope',
    title: 'Services & scope',
    blurb: 'What we do, and where the work ends.',
    items: [
      {
        id: 'what-services',
        q: 'Which services do you offer?',
        a: 'Search and SEO, web design and build, content and editorial, analytics and reporting, and automation and AI. Each one can run on its own or as part of a wider plan.',
      },
      {
        id: 'scope-defined',
        q: 'How is the scope of a project defined?',
        a: 'In writing, before work begins. The scope lists what we will deliver, what is out of scope and how changes are handled, so there are no surprises halfway through.',
      },
      {
        id: 'scope-change',
        q: 'What happens if our needs change mid-project?',
        a: 'We talk about it first. Small adjustments are usually absorbed; anything larger is scoped as a change, with its effect on time and cost agreed before we do it.',
      },
      {
        id: 'not-a-fit',
        q: 'Is there work you would turn down?',
        a: 'Yes. If a request falls outside what we do well, we say so and, where we can, point you to someone better suited. A good fit matters more to us than a signed contract.',
      },
    ],
  },
  {
    id: 'process-timeline',
    title: 'Process & timeline',
    blurb: 'How a project moves from idea to launch.',
    items: [
      {
        id: 'process',
        q: 'What is your process?',
        a: 'Discover, plan, build, launch and improve. Each stage ends with something you can review, so decisions are made on real work rather than promises.',
      },
      {
        id: 'how-long',
        q: 'How long do projects take?',
        // CONFIRM: add typical durations if you want to publish them.
        a: 'It depends on scope. A focused audit is much quicker than a full website build. You get a timeline with milestones before we start, and we flag early if anything puts it at risk.',
      },
      {
        id: 'your-time',
        q: 'How much of our time will the project need?',
        a: 'Most of it is concentrated at the start, during discovery, and at review points. Between those we keep you updated without needing you in every meeting.',
      },
      {
        id: 'progress-updates',
        q: 'How will we know how the project is going?',
        a: 'You get regular updates on what was done, what is next and anything we need from you. Work in progress is shared early, not saved for a big reveal.',
      },
      {
        id: 'delays',
        q: 'What happens if a deadline slips?',
        a: 'We tell you as soon as we see the risk, explain why and suggest options, such as adjusting scope or the date. You will not hear about it for the first time on the due date.',
      },
    ],
  },
  {
    id: 'design-development',
    title: 'Design & development',
    blurb: 'How we design, build and hand over sites.',
    items: [
      {
        id: 'see-designs',
        q: 'Will we see designs before anything is built?',
        a: 'Yes. Key pages are designed and reviewed with you first. Development starts once the direction is agreed, which keeps rework to a minimum.',
      },
      {
        id: 'revisions',
        q: 'How many rounds of revisions are included?',
        // CONFIRM: state the number of revision rounds in your contracts.
        a: 'Revision rounds are set out in the proposal for each project. We would rather agree them clearly up front than leave it open to interpretation later.',
      },
      {
        id: 'tech-stack',
        q: 'Which technologies do you build with?',
        a: 'We choose the stack for the job. Most sites are built with modern, well-supported tools such as React and TypeScript, with performance and accessibility treated as requirements, not extras.',
      },
      {
        id: 'edit-content',
        q: 'Can we update the content ourselves?',
        a: 'Yes, when that is what you need. We can set up a content management system and show your team how to use it, so day-to-day changes do not depend on us.',
      },
      {
        id: 'ownership',
        q: 'Will we own what you create?',
        // CONFIRM: matches the ownership answer used elsewhere on the site.
        a: 'Yes. Once the project is paid for, the designs, code, content and accounts are yours. No lock-in, and we hand everything over properly.',
      },
    ],
  },
  {
    id: 'testing-quality',
    title: 'Testing & quality',
    blurb: 'What we check before anything goes live.',
    items: [
      {
        id: 'what-tested',
        q: 'How do you test a website before launch?',
        a: 'We check it across common browsers and screen sizes, test forms and key journeys, and review speed and accessibility. Issues are fixed before launch, not logged for later.',
      },
      {
        id: 'accessibility',
        q: 'Do you build with accessibility in mind?',
        a: 'Yes. We design for clear contrast, readable type and keyboard use, and test with accessibility tools as we build. If you have a specific standard to meet, tell us at the start.',
      },
      {
        id: 'performance',
        q: 'How do you make sure the site is fast?',
        a: 'Speed is planned in from the start: optimised images, lean code and careful use of animation. We measure performance before launch and fix what slows it down.',
      },
      {
        id: 'launch-issue',
        q: 'What if something breaks after launch?',
        // CONFIRM: describe your post-launch fix window if you offer one.
        a: 'Tell us and we will look at it straight away. Anything caused by our work is ours to fix, and we agree how support works after launch before the project ends.',
      },
    ],
  },
  {
    id: 'pricing-contracts',
    title: 'Pricing & contracts',
    blurb: 'How work is priced, agreed and paid for.',
    items: [
      {
        id: 'pricing',
        q: 'How do you price your work?',
        // CONFIRM: add your pricing model (fixed fee, retainer, day rate) if you want it public.
        a: 'Each project is priced from its agreed scope. You get a written proposal with the cost before any work begins, so you know what you are paying for.',
      },
      {
        id: 'estimate',
        q: 'Can we get an estimate before committing?',
        a: 'Yes. After the discovery call we send a proposal with scope, timeline and cost. There is no obligation to go ahead.',
      },
      {
        id: 'payment',
        q: 'How does payment work?',
        // CONFIRM: describe your payment schedule and terms.
        a: 'Payment terms are set out in the proposal and agreed before work starts. For larger projects, payments are usually tied to milestones rather than one lump sum.',
      },
      {
        id: 'nda',
        q: 'Will you sign an NDA?',
        // CONFIRM: check you are happy to sign NDAs as a rule.
        a: 'Yes. If your project involves sensitive information, we are happy to sign a non-disclosure agreement before you share it.',
      },
    ],
  },
  {
    id: 'working-together',
    title: 'Working together',
    blurb: 'Who you work with, and how we stay in touch.',
    items: [
      {
        id: 'who-you-work-with',
        q: 'Who will we work with day to day?',
        a: 'A named lead who knows your project and is your main point of contact, backed by the specialists doing the work. You will know who is responsible for what.',
      },
      {
        id: 'communication',
        q: 'How do we communicate during a project?',
        a: 'Whichever way suits your team: scheduled calls, email or a shared channel. We agree it at the start and keep decisions written down so nothing gets lost.',
      },
      {
        id: 'meetings',
        q: 'How often will we meet?',
        a: 'Usually at the start of each stage and at review points, plus short check-ins when they help. We keep meetings purposeful rather than recurring by default.',
      },
      {
        id: 'feedback',
        q: 'How do we give feedback?',
        a: 'Directly on the work, in one consolidated round per review. It helps to have one person gather your team’s comments so the direction stays clear.',
      },
      {
        id: 'time-zones',
        q: 'Can we work together from different time zones?',
        a: 'Yes. We agree overlapping hours for calls and rely on clear written updates for the rest, so the project keeps moving whatever the time difference.',
      },
      {
        id: 'confidentiality',
        q: 'How do you handle our data and access?',
        a: 'We only ask for the access a task needs, keep credentials in a secure manager and hand access back when the work is done. You stay the owner of your accounts.',
      },
    ],
  },
  {
    id: 'after-launch',
    title: 'After launch',
    blurb: 'Support, measurement and what comes next.',
    items: [
      {
        id: 'after-launch',
        q: 'What happens after the site goes live?',
        a: 'We monitor the launch, fix anything that comes up and check that tracking is working. Then we look at the first results with you and agree what to improve next.',
      },
      {
        id: 'ongoing-support',
        q: 'Do you offer ongoing support?',
        // CONFIRM: describe any maintenance or retainer options you offer.
        a: 'Yes, if you want it. Ongoing support can cover updates, improvements, SEO and reporting. It is agreed separately, so you only pay for what is useful.',
      },
      {
        id: 'measure-success',
        q: 'How do you measure success?',
        a: 'We set a baseline and agree target metrics during discovery, then report against them: traffic, leads, conversions or whatever matters most to your business.',
      },
      {
        id: 'leave',
        q: 'What if we want to move on to another team?',
        a: 'We hand everything over properly: code, content, accounts and documentation. You should never feel stuck with us because leaving is too hard.',
      },
    ],
  },
]

export const FAQ_TOTAL = FAQ_CATEGORIES.reduce((n, c) => n + c.items.length, 0)
