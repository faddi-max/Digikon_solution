import searchArt from '@/assets/images/services/search-seo.png?url'
import webArt from '@/assets/images/services/web-design.png?url'
import contentArt from '@/assets/images/services/content-editorial.png?url'
import analyticsArt from '@/assets/images/services/analytics-reporting.png?url'

import type { ServiceHeroData } from './serviceHeroData'

export type { ServiceHeroData }

export type ServiceStrategyData = {
  label: string
  lines: readonly [string, string]
  accent: string
  paragraphs: readonly string[]
  tags: readonly string[]
  stat: {
    kicker: string
    value: number
    text: string
  }
  art?: string
}

export type ServiceIntentChip = {
  label: string
  x: number
  y: number
  depth: number
}

export type ServiceIntentData = {
  label: string
  lines: readonly [string, string]
  body: string
  chips: readonly ServiceIntentChip[]
}

export type ServiceProcessStep = {
  title: string
  text: string
}

export type ServiceProcessData = {
  label: string
  title: string
  intro: string
  steps: readonly ServiceProcessStep[]
}

export type ServiceOutcomeItem = {
  title: string
  text: string
  iconType?: 'visibility' | 'traffic' | 'leads' | 'growth' | 'design' | 'speed' | 'conversion' | 'scale' | 'content' | 'voice' | 'cadence' | 'reach' | 'data' | 'insights' | 'roi' | 'accuracy'
}

export type ServiceOutcomesData = {
  label: string
  title: string
  intro: string
  items: readonly ServiceOutcomeItem[]
}

export type ServiceDeliverableItem = {
  title: string
  text: string
}

export type ServiceDeliverablesData = {
  label: string
  title: string
  intro: string
  items: readonly ServiceDeliverableItem[]
}

export type ServiceFaqItem = {
  q: string
  a: string
}

export type ServiceDetailData = {
  id: string
  title: string
  metaTitle: string
  metaDescription: string
  hero: ServiceHeroData
  strategy: ServiceStrategyData
  intent: ServiceIntentData
  process: ServiceProcessData
  outcomes: ServiceOutcomesData
  deliverables: ServiceDeliverablesData
  faqs?: readonly ServiceFaqItem[]
}

/* =========================================================================
 * 1. SEARCH & SEO
 * ========================================================================= */
export const SEO_SERVICE: ServiceDetailData = {
  id: 'search-seo',
  title: 'Search & SEO',
  metaTitle: 'Search & SEO | DigiKon Solutions',
  metaDescription: 'Connect search intent with meaningful content to attract qualified traffic and sustainable organic revenue.',
  hero: {
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
  },
  strategy: {
    label: 'Strategy & value',
    lines: ['More than rankings.', 'Real'],
    accent: 'opportunities.',
    paragraphs: [
      'SEO is not about chasing algorithms. It is about helping the right people discover your business — and creating the conditions for meaningful engagement and conversions.',
      'When search works well, it connects audience intent with relevant content. Every improvement compounds over time, building a channel that generates qualified traffic, enquiries, and revenue without ongoing advertising spend.',
    ],
    tags: [
      'Search visibility',
      'Qualified traffic',
      'Intent mapping',
      'Conversion optimisation',
      'Sustainable growth',
    ],
    stat: {
      kicker: 'Search opportunity',
      value: 73,
      text: 'of online experiences begin with a search engine',
    },
    art: searchArt,
  },
  intent: {
    label: 'Connecting intent to value',
    lines: ['Discover the opportunities', 'hiding in every search.'],
    body: 'Behind every search query is a person with intent. Some are researching. Some are comparing. Some are ready to act. We help you understand these signals and position your business to meet people at each stage of their journey — with the right content, on the right pages, at the right time.',
    chips: [
      { label: 'Visibility', x: -315, y: -117, depth: 14 },
      { label: 'Qualified traffic', x: 402, y: -80, depth: 10 },
      { label: 'Leads', x: -359, y: 118, depth: 12 },
      { label: 'Business growth', x: 311, y: 107, depth: 16 },
    ],
  },
  process: {
    label: 'How we work',
    title: 'A clear, measured process.',
    intro: 'Every engagement follows four stages. Each one builds on the last, creating a cycle of continuous improvement driven by evidence rather than assumption.',
    steps: [
      {
        title: 'Discover',
        text: 'Understand the business, audience, search intent, and opportunities. Audit the current site and competitive landscape to find where value is being left on the table.',
      },
      {
        title: 'Prioritise',
        text: 'Identify technical issues, relevant keywords, and the highest-value improvements. Build a practical roadmap based on effort, relevance, and likely impact.',
      },
      {
        title: 'Improve',
        text: 'Strengthen technical SEO, on-page structure, and content direction. Make every page work harder to communicate value to search engines and visitors.',
      },
      {
        title: 'Learn',
        text: 'Review performance signals and refine the strategy over time. SEO becomes a continuous process of learning and improvement — not a one-off task.',
      },
    ],
  },
  outcomes: {
    label: 'Outcomes',
    title: 'What meaningful SEO delivers.',
    intro: 'When search is done well, improvement compounds. Each stage of progress creates the conditions for the next — building a channel that sustains itself over time.',
    items: [
      {
        title: 'Visibility',
        text: 'Your pages appear where your audience is actively searching.',
        iconType: 'visibility',
      },
      {
        title: 'Qualified traffic',
        text: 'The right visitors arrive with genuine intent to engage.',
        iconType: 'traffic',
      },
      {
        title: 'Leads',
        text: 'Visitors convert to enquiries and meaningful interactions.',
        iconType: 'leads',
      },
      {
        title: 'Business growth',
        text: 'Search becomes a reliable, compounding channel for revenue.',
        iconType: 'growth',
      },
    ],
  },
  deliverables: {
    label: 'What you receive',
    title: 'Clear, actionable deliverables.',
    intro: 'Every engagement produces work you can read, question and act on. Each deliverable is written in plain language and tied to a decision it helps you make.',
    items: [
      {
        title: 'Search opportunity mapping',
        text: 'A clear view of where demand exists, what your audience is searching for, and which opportunities are worth pursuing first.',
      },
      {
        title: 'Technical & on-page SEO review',
        text: 'A review of site structure, speed, indexing and on-page elements, with every finding explained in plain language.',
      },
      {
        title: 'Prioritised improvement roadmap',
        text: 'An ordered plan of improvements, weighed by effort, relevance and likely impact.',
      },
      {
        title: 'Content & keyword direction',
        text: 'Guidance on the topics, pages and keywords that should shape what you publish next.',
      },
      {
        title: 'Performance measurement & reporting',
        text: 'Regular reporting on search performance, what changed, and what we will do next.',
      },
    ],
  },
  faqs: [
    {
      q: 'How long does it take to see SEO results?',
      a: 'Technical fixes and indexation updates typically reflect within 3 to 6 weeks. Significant organic keyword movement and compounded lead volume usually build consistently over 3 to 6 months.',
    },
    {
      q: 'Do you only focus on keyword rankings?',
      a: 'No. Rankings are vanity if they do not convert. We focus on search intent, qualified high-intent traffic, and conversion-optimized page architecture that produces revenue.',
    },
    {
      q: 'Will you touch our existing code and CMS?',
      a: 'We provide both hands-on technical implementation for modern codebases (React, Next.js, Headless CMS, WordPress) or deliver detailed PRs and specifications for your engineering team.',
    },
    {
      q: 'How do you handle Google core algorithm updates?',
      a: 'By prioritizing fundamental site speed, clear technical hierarchy, and genuinely authoritative subject matter rather than manipulative shortcuts that get penalized.',
    },
    {
      q: 'How do we measure success?',
      a: 'Through transparent monthly reporting tracking organic impressions, target keyword positions, high-intent traffic, and actual inbound leads generated.',
    },
  ],
}

/* =========================================================================
 * 2. WEB DESIGN & BUILD
 * ========================================================================= */
export const WEB_SERVICE: ServiceDetailData = {
  id: 'web-design',
  title: 'Web design & build',
  metaTitle: 'Web Design & Build | DigiKon Solutions',
  metaDescription: 'Bespoke web engineering shaped around clarity, sub-second speed, and high-converting user experiences.',
  hero: {
    crumb: 'Web design & build',
    label: 'Web design & build',
    lines: ['Websites engineered to', 'turn attention into'],
    accent: 'action.',
    body: 'We design and build bespoke digital experiences centered on speed, visual clarity, and real commercial outcomes. Clean front-end engineering that scales with your ambition rather than dating in a year.',
    primary: { label: 'Start a build', to: '/contact' },
    secondary: { label: 'Explore architecture', href: '#services' },
    mock: {
      query: 'web — bespoke frontend architecture',
      rank: '99.8% CORE VITALS',
      metricLabel: 'Performance score',
      metric: 99,
      metricCaption: 'Lighthouse audit & sub-second render',
    },
  },
  strategy: {
    label: 'Craft & Engineering',
    lines: ['Built for purpose.', 'Engineered for'],
    accent: 'longevity.',
    paragraphs: [
      'A website is not an online brochure. It is your most visible commercial asset, responsible for establishing authority in seconds and guiding high-value prospects toward decisions.',
      'We combine distinct art direction with rigorous, modern software engineering. Every layout is responsive, accessible, and stripped of unnecessary dependencies so your brand stands out effortlessly.',
    ],
    tags: [
      'Design systems',
      'React & TypeScript',
      'Sub-second speed',
      'Responsive UX',
      'WCAG Accessibility',
    ],
    stat: {
      kicker: 'First impression',
      value: 94,
      text: 'of first impressions are design-related and formed within 50 milliseconds',
    },
    art: webArt,
  },
  intent: {
    label: 'Design for interaction',
    lines: ['Bridging brand narrative', 'with conversion psychology.'],
    body: 'Every visitor arrives with specific needs and hesitation. We map the entire journey from initial hero impression through to social proof, case studies, and conversion actions — eliminating friction at every step.',
    chips: [
      { label: 'Brand authority', x: -315, y: -117, depth: 14 },
      { label: 'Sub-second speed', x: 402, y: -80, depth: 10 },
      { label: 'Conversion flow', x: -359, y: 118, depth: 12 },
      { label: 'Modular scale', x: 311, y: 107, depth: 16 },
    ],
  },
  process: {
    label: 'How we build',
    title: 'Precision design, clean delivery.',
    intro: 'From discovery wireframes to production deployment, our engineering workflow is structured to keep milestones clear and momentum constant.',
    steps: [
      {
        title: 'Architecture',
        text: 'Map site hierarchy, content journeys, conversion funnels, and component requirements to establish a solid foundation before sketching visuals.',
      },
      {
        title: 'Design System',
        text: 'Craft custom Figma UI design systems, tokenized typography, interactive states, and responsive breakpoints tailored to your identity.',
      },
      {
        title: 'Engineering',
        text: 'Develop with modern TypeScript, semantic HTML, modular styling, and WebGL touches engineered for sub-second page loads and zero layout shift.',
      },
      {
        title: 'Deploy & Handover',
        text: 'Comprehensive cross-browser testing, mobile verification, Core Web Vitals audit, and smooth deployment with complete asset ownership.',
      },
    ],
  },
  outcomes: {
    label: 'Impact',
    title: 'What modern engineering delivers.',
    intro: 'A bespoke web platform creates an immediate competitive edge by turning fleeting visits into high-trust commercial relationships.',
    items: [
      {
        title: 'Market Authority',
        text: 'Design polish that immediately builds credibility with enterprise buyers.',
        iconType: 'design',
      },
      {
        title: 'Sub-Second Speed',
        text: 'Lightning fast interactions that reduce bounce rates and maximize engagement.',
        iconType: 'speed',
      },
      {
        title: 'Higher Conversions',
        text: 'Frictionless journeys designed specifically to convert interest into enquiries.',
        iconType: 'conversion',
      },
      {
        title: 'Future Agility',
        text: 'Clean, modular codebases that your team can easily extend as you grow.',
        iconType: 'scale',
      },
    ],
  },
  deliverables: {
    label: 'What you receive',
    title: 'Complete ownership, zero lock-in.',
    intro: 'Every asset, style token, and line of code is handed over cleanly with documentation so your team possesses total control.',
    items: [
      {
        title: 'Figma UI Library & Design Tokens',
        text: 'Production-ready component libraries, color modes, typography scales, and responsive design prototypes.',
      },
      {
        title: 'Production-Ready Codebase',
        text: 'High-performance React/TypeScript code built to modern accessibility and SEO standards.',
      },
      {
        title: 'Responsive & Interactive Polish',
        text: 'Smooth GSAP and CSS animations optimized for mobile devices and reduced-motion preferences.',
      },
      {
        title: 'Core Web Vitals Optimization',
        text: 'Audited assets, image pipeline compression, and zero CLS layout architecture.',
      },
      {
        title: 'Hosting & Deployment Pipeline',
        text: 'CI/CD pipeline configuration, DNS verification, and complete source code repository handover.',
      },
    ],
  },
  faqs: [
    {
      q: 'What technologies do you use for web development?',
      a: 'We build modern web applications and sites using React, TypeScript, Vite/Next.js, Tailwind CSS, and GSAP/Three.js for subtle, high-performance interactive motion.',
    },
    {
      q: 'Will our site be easy to edit after launch?',
      a: 'Yes. We can integrate headless CMS solutions (Sanity, Strapi, Contentful) or modular React content schemas so your marketing team can update pages easily without breaking layouts.',
    },
    {
      q: 'Do you design custom graphics and layouts or use templates?',
      a: 'Every site is 100% custom-designed in Figma specifically for your brand positioning. We do not use off-the-shelf theme templates.',
    },
    {
      q: 'Who owns the code and design files after completion?',
      a: 'You own 100% of the designs, code repositories, domains, and assets upon final payment. There is zero proprietary platform lock-in.',
    },
    {
      q: 'How long does a website project take?',
      a: 'A focused landing page or marketing microsite typically takes 2 to 3 weeks; a full bespoke multi-page platform usually takes 5 to 8 weeks depending on scope.',
    },
  ],
}

/* =========================================================================
 * 3. CONTENT & EDITORIAL
 * ========================================================================= */
export const CONTENT_SERVICE: ServiceDetailData = {
  id: 'content-editorial',
  title: 'Content & editorial',
  metaTitle: 'Content & Editorial | DigiKon Solutions',
  metaDescription: 'High-intent editorial frameworks, authoritative copywriting, and sustainable publishing systems.',
  hero: {
    crumb: 'Content & editorial',
    label: 'Content & editorial',
    lines: ['Words that resonate,', 'answers that build'],
    accent: 'conviction.',
    body: 'We create high-intent editorial strategies and narrative systems that educate your buyers, answer their toughest questions, and build lasting organic trust without fluff or filler.',
    primary: { label: 'Start an editorial project', to: '/contact' },
    secondary: { label: 'Explore editorial systems', href: '#services' },
    mock: {
      query: 'editorial — thought leadership and buyer guides',
      rank: 'AUTHORITATIVE',
      metricLabel: 'Reader engagement',
      metric: 215,
      metricCaption: 'Average time-on-page & bookmark velocity',
    },
  },
  strategy: {
    label: 'Authority & Voice',
    lines: ['Clarity over noise.', 'Writing that drives'],
    accent: 'decisions.',
    paragraphs: [
      'Most content marketing fails because it churns out generic summaries to fill an editorial calendar. Audiences do not need more words; they need clarity, depth, and insights they cannot get elsewhere.',
      'We build editorial systems aligned with what prospective buyers actually investigate before purchasing. Every piece is rigorously researched, cleanly structured, and positioned to prove your leadership.',
    ],
    tags: [
      'Editorial strategy',
      'Thought leadership',
      'Buyer intent mapping',
      'Content systems',
      'Conversion copywriting',
    ],
    stat: {
      kicker: 'Buyer research',
      value: 82,
      text: 'of B2B buyers review 3 to 5 content assets before contacting sales',
    },
    art: contentArt,
  },
  intent: {
    label: 'Editorial resonance',
    lines: ['Mapping topics to what', 'your audience actually cares about.'],
    body: 'We identify the real questions, operational hurdles, and evaluation criteria your buyers search for. Then we deliver answers with intellectual honesty and commercial sharpness.',
    chips: [
      { label: 'Deep research', x: -315, y: -117, depth: 14 },
      { label: 'Original thought', x: 402, y: -80, depth: 10 },
      { label: 'Buyer trust', x: -359, y: 118, depth: 12 },
      { label: 'Compounding reach', x: 311, y: 107, depth: 16 },
    ],
  },
  process: {
    label: 'Editorial Workflow',
    title: 'A sustainable publishing cadence.',
    intro: 'We turn scattered company expertise into structured, repeatable content engines that compound in organic value over quarters and years.',
    steps: [
      {
        title: 'Subject Deep Dive',
        text: 'Interview your team leaders and analyze customer conversations to extract unique perspectives that competitors cannot duplicate.',
      },
      {
        title: 'Voice & Frameworks',
        text: 'Define your brand voice guidelines, messaging hierarchy, terminology standards, and content themes.',
      },
      {
        title: 'Writing & Rigor',
        text: 'Craft comprehensive articles, landing page copy, and case studies written for clarity, depth, and actionable decision-making.',
      },
      {
        title: 'Syndication & Repurposing',
        text: 'Extract insights into social hooks, newsletters, and distribution assets to maximize the reach of every deep-dive piece.',
      },
    ],
  },
  outcomes: {
    label: 'Value',
    title: 'What disciplined content delivers.',
    intro: 'Investing in authoritative editorial assets creates permanent digital real estate that outperforms short-lived ad spending.',
    items: [
      {
        title: 'Industry Authority',
        text: 'Establishing your company as the unquestioned thought leader in your niche.',
        iconType: 'voice',
      },
      {
        title: 'Shorter Sales Cycles',
        text: 'Informed buyers arrive at discovery calls pre-sold on your philosophy.',
        iconType: 'conversion',
      },
      {
        title: 'Organic Compounding',
        text: 'Evergreen guides that attract high-value prospective clients every month.',
        iconType: 'reach',
      },
      {
        title: 'Consistent Cadence',
        text: 'A structured editorial engine your internal team can sustainably run.',
        iconType: 'cadence',
      },
    ],
  },
  deliverables: {
    label: 'What you receive',
    title: 'Ready-to-publish assets and systems.',
    intro: 'Every deliverable is written with precision, thoroughly fact-checked, and formatted for seamless CMS publishing.',
    items: [
      {
        title: 'Quarterly Editorial Roadmap',
        text: 'Prioritized topic clusters, search intent keywords, and publishing schedules aligned with product goals.',
      },
      {
        title: 'Brand Voice & Writing Guidelines',
        text: 'A concise style guide defining tone, vocabulary, formatting conventions, and narrative framing.',
      },
      {
        title: 'Pillar Thought Leadership Guides',
        text: 'Comprehensive, deeply researched long-form articles engineered to attract backlinks and bookmarks.',
      },
      {
        title: 'High-Converting Product Copy',
        text: 'Sharpened value propositions, benefit breakdowns, and messaging for key marketing pages.',
      },
      {
        title: 'Multi-Channel Repurposing Matrix',
        text: 'Structured snippets, quotes, and newsletter drafts derived from every major content asset.',
      },
    ],
  },
  faqs: [
    {
      q: 'Do you use AI to write articles?',
      a: 'We use AI strictly for research aggregation and outline exploration. All final writing and editorial synthesis are crafted by senior writers with human judgment and authentic voice.',
    },
    {
      q: 'How do you ensure technical accuracy in our industry?',
      a: 'We conduct short 30-minute structured interviews with your internal subject-matter experts and verify drafts directly against your product realities.',
    },
    {
      q: 'Can you work with our existing content team?',
      a: 'Yes. We frequently act as an editorial director or specialized production partner, providing strategy, topic briefs, and high-impact pillar pieces alongside your in-house team.',
    },
    {
      q: 'How do you evaluate content ROI?',
      a: 'We track reader retention, newsletter signups, assisted conversions in the sales pipeline, organic search ranking compounding, and social sharing velocity.',
    },
    {
      q: 'What types of content do you specialize in?',
      a: 'B2B guides, product marketing pages, technical deep-dives, case studies, executive thought leadership, and email newsletters.',
    },
  ],
}

/* =========================================================================
 * 4. ANALYTICS & REPORTING
 * ========================================================================= */
export const ANALYTICS_SERVICE: ServiceDetailData = {
  id: 'analytics-reporting',
  title: 'Analytics & reporting',
  metaTitle: 'Analytics & Reporting | DigiKon Solutions',
  metaDescription: 'Unified tracking, clean data architecture, and outcome-led dashboards connecting marketing investments directly to revenue.',
  hero: {
    crumb: 'Analytics & reporting',
    label: 'Analytics & reporting',
    lines: ['Data you can trust.', 'Decisions you can'],
    accent: 'defend.',
    body: 'We eliminate guesswork with unified tracking, clean data architecture, and clear outcome-led dashboards that connect marketing investments directly to customer acquisition and pipeline revenue.',
    primary: { label: 'Audit your analytics', to: '/contact' },
    secondary: { label: 'See reporting framework', href: '#services' },
    mock: {
      query: 'analytics — verified pipeline telemetry',
      rank: '100% AUDITED',
      metricLabel: 'Attribution accuracy',
      metric: 100,
      metricCaption: 'Clean event taxonomy & verified tracking',
    },
  },
  strategy: {
    label: 'Measurement & Insight',
    lines: ['Beyond vanity metrics.', 'Real business'],
    accent: 'intelligence.',
    paragraphs: [
      'Most marketing dashboards are full of noise: impressions, bounces, and disjointed pageviews that fail to tell leadership whether campaigns are actually generating profitable revenue.',
      'We engineer measurement systems that bridge web analytics, CRM data, and advertising platforms. You get a single, verifiable source of truth so every resource allocation is grounded in objective facts.',
    ],
    tags: [
      'Server-side tracking',
      'Multi-touch attribution',
      'Executive dashboards',
      'Data governance',
      'Conversion telemetry',
    ],
    stat: {
      kicker: 'Data integrity',
      value: 68,
      text: 'of leadership teams admit making strategic bets on conflicting marketing data',
    },
    art: analyticsArt,
  },
  intent: {
    label: 'Signal over noise',
    lines: ['Transforming raw events', 'into commercial clarity.'],
    body: 'Every click, scroll, form submission, and conversion tells an important part of your customer acquisition story. We capture these signals accurately and synthesize them into decisive executive intelligence.',
    chips: [
      { label: 'Event tracking', x: -315, y: -117, depth: 14 },
      { label: 'Attribution', x: 402, y: -80, depth: 10 },
      { label: 'Revenue clarity', x: -359, y: 118, depth: 12 },
      { label: 'Decision confidence', x: 311, y: 107, depth: 16 },
    ],
  },
  process: {
    label: 'Telemetry Methodology',
    title: 'Clean instrumentation and reporting.',
    intro: 'A methodical approach to data infrastructure, auditing what is broken before building reporting systems that give your executive team clarity.',
    steps: [
      {
        title: 'Telemetry Audit',
        text: 'Inspect tracking scripts, event tags, duplicate triggers, and consent banners to pinpoint discrepancies and broken conversion funnels.',
      },
      {
        title: 'Event Taxonomy',
        text: 'Build a unified naming schema and measurement framework connecting touchpoints across web, product, and CRM pipelines.',
      },
      {
        title: 'Dashboard Build',
        text: 'Construct intuitive real-time dashboards in Looker Studio or custom BI tools tailored specifically to executive and operational KPIs.',
      },
      {
        title: 'Strategic Insights',
        text: 'Conduct regular performance reviews translating raw numbers into practical recommendations on where to invest or cut spend.',
      },
    ],
  },
  outcomes: {
    label: 'Clarity',
    title: 'What accurate measurement delivers.',
    intro: 'Eliminate internal debates about which numbers are accurate and focus your budget on channels that demonstrably drive customer acquisition.',
    items: [
      {
        title: 'Flawless Data Integrity',
        text: 'Zero duplicate fires, verified UTM attribution, and complete tracking hygiene.',
        iconType: 'accuracy',
      },
      {
        title: 'Multi-Touch Attribution',
        text: 'Know the true return on ad spend and organic investments across all channels.',
        iconType: 'roi',
      },
      {
        title: 'Executive Dashboards',
        text: 'Live visual snapshots that allow leadership to understand performance at a glance.',
        iconType: 'insights',
      },
      {
        title: 'Budget Optimization',
        text: 'Reallocate capital from underperforming campaigns with complete data confidence.',
        iconType: 'data',
      },
    ],
  },
  deliverables: {
    label: 'What you receive',
    title: 'A resilient data ecosystem.',
    intro: 'Complete telemetry setups, documented data schemas, and intuitive dashboard access with zero vendor lock-in.',
    items: [
      {
        title: 'Comprehensive Tracking Audit & Fixes',
        text: 'Full audit report and implementation of server-side GA4, GTM tags, and conversion triggers.',
      },
      {
        title: 'Custom Executive & Growth Dashboards',
        text: 'Interactive Looker Studio or BI dashboards tracking customer acquisition cost, conversion rate, and pipeline value.',
      },
      {
        title: 'Multi-Touch Attribution Model',
        text: 'Attribution framework linking first-touch discovery to closed-won CRM opportunities.',
      },
      {
        title: 'Event Schema & Data Dictionary',
        text: 'Complete documentation of every tracked user action, trigger, and parameter for your engineering team.',
      },
      {
        title: 'Monthly Strategic Insight Briefs',
        text: 'Concise written briefings outlining high-impact findings, funnel bottlenecks, and next steps.',
      },
    ],
  },
  faqs: [
    {
      q: 'Why do our Google Analytics numbers never match our CRM?',
      a: 'Differences arise from ad-blockers, iOS tracking restrictions, duplicate fires, or mismatched attribution models. We configure server-side tracking and CRM-aligned conversion events to synchronize both worlds.',
    },
    {
      q: 'Do you help with privacy regulations like GDPR and CCPA?',
      a: 'Yes. We implement compliant consent management platforms (CMP) with Google Consent Mode v2 so you capture data legally without breaking user trust.',
    },
    {
      q: 'Can you connect our custom CRM or database to Looker Studio?',
      a: 'Yes. We build data connectors and automated BigQuery/PostgreSQL pipelines to bring all your data into unified, live dashboards.',
    },
    {
      q: 'How often are the dashboards updated?',
      a: 'Our dashboards are connected directly to live data sources, updating in real time or on scheduled daily sync intervals.',
    },
    {
      q: 'Will you train our team on how to use the dashboards?',
      a: 'Every engagement includes a live walkthrough and recorded video documentation showing your team how to navigate and filter the reports.',
    },
  ],
}

/* =========================================================================
 * REGISTRY & SLUG MAPPING
 * ========================================================================= */
export const SERVICES_REGISTRY: Record<string, ServiceDetailData> = {
  'search-seo': SEO_SERVICE,
  'seo': SEO_SERVICE,
  'web-design': WEB_SERVICE,
  'web': WEB_SERVICE,
  'content-editorial': CONTENT_SERVICE,
  'content': CONTENT_SERVICE,
  'analytics-reporting': ANALYTICS_SERVICE,
  'analytics': ANALYTICS_SERVICE,
}

export function getServiceDetail(id?: string): ServiceDetailData {
  if (!id) return SEO_SERVICE
  const cleanId = id.replace(/^#/, '').toLowerCase().trim()
  return SERVICES_REGISTRY[cleanId] ?? SEO_SERVICE
}
