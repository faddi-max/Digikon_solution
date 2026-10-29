export type BlogCategoryId = 'software' | 'ai' | 'seo' | 'design'

export type BlogPost = {
  slug: string
  category: BlogCategoryId
  categoryLabel: string
  tag: string
  step: string
  title: string
  excerpt: string
  image: string
  imageAlt: string
  author: string
  initials: string
  /** Avatar gradient [from, to]. Omit for the default teal to green. */
  avatar?: readonly [string, string]
  readMinutes: number
  /** Higher is newer. */
  date: number
  /** Higher is more popular. */
  popular: number
}

export const BLOG_CATEGORIES: readonly { id: 'all' | BlogCategoryId; label: string }[] = [
  { id: 'all', label: 'All articles' },
  { id: 'software', label: 'Software' },
  { id: 'ai', label: 'AI & Automation' },
  { id: 'seo', label: 'SEO & Growth' },
  { id: 'design', label: 'Design & UX' },
]

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`

export const BLOG_POSTS: readonly BlogPost[] = [
  {
    slug: 'building-software-that-scales',
    category: 'software',
    categoryLabel: 'Software development',
    tag: 'Product engineering',
    step: '01 / Build',
    title: 'Building software that scales with your business',
    excerpt: 'How to turn a growing list of needs into a resilient product your team can rely on.',
    image: u('photo-1518770660439-4636190af475'),
    imageAlt: 'Close-up of modern computer hardware and circuit boards',
    author: 'DigiKon Team',
    initials: 'DK',
    readMinutes: 6,
    date: 8,
    popular: 4,
  },
  {
    slug: 'where-ai-automation-creates-value',
    category: 'ai',
    categoryLabel: 'AI & automation',
    tag: 'AI & Automation',
    step: '02 / Automate',
    title: 'Where AI automation creates real business value',
    excerpt: 'Move beyond the hype and identify the workflows where automation can make a difference.',
    image: u('photo-1677442136019-21780ecad995'),
    imageAlt: 'Artificial intelligence visualization on a computer screen',
    author: 'DigiKon Team',
    initials: 'AI',
    avatar: ['#7767f5', '#c2a5ff'],
    readMinutes: 7,
    date: 7,
    popular: 9,
  },
  {
    slug: 'seo-foundations-that-keep-delivering',
    category: 'seo',
    categoryLabel: 'SEO & digital growth',
    tag: 'Search strategy',
    step: '03 / Grow',
    title: 'SEO foundations that keep delivering over time',
    excerpt: 'A practical look at the technical, content, and experience basics worth getting right.',
    image: u('photo-1460925895917-afdab827c52f'),
    imageAlt: 'Analytics dashboard with charts on a laptop screen',
    author: 'DigiKon Team',
    initials: 'DG',
    avatar: ['#c58d49', '#e8c58e'],
    readMinutes: 5,
    date: 6,
    popular: 8,
  },
  {
    slug: 'designing-experiences-people-trust',
    category: 'design',
    categoryLabel: 'Design & UX',
    tag: 'Design & experience',
    step: '04 / Design',
    title: 'Designing digital experiences people trust',
    excerpt: 'Small interface decisions that make products clearer, easier to use, and more credible.',
    image: u('photo-1559028012-481c04fa702d'),
    imageAlt: 'Designer working on a digital interface and UX wireframes',
    author: 'DigiKon Team',
    initials: 'UX',
    avatar: ['#e17b6b', '#f1b4a2'],
    readMinutes: 4,
    date: 5,
    popular: 7,
  },
  {
    slug: 'choosing-the-right-tech-stack',
    category: 'software',
    categoryLabel: 'Software development',
    tag: 'Tech strategy',
    step: '05 / Plan',
    title: 'Choosing the right tech stack for your next product',
    excerpt: 'Balance performance, maintainability, and future needs before committing to a technology.',
    image: u('photo-1519389950473-47ba0277781c'),
    imageAlt: 'Software team collaborating around computers in a modern office',
    author: 'DigiKon Team',
    initials: 'DK',
    readMinutes: 8,
    date: 4,
    popular: 6,
  },
  {
    slug: 'introducing-ai-to-your-team',
    category: 'ai',
    categoryLabel: 'AI & automation',
    tag: 'AI readiness',
    step: '06 / Adopt',
    title: 'A practical guide to introducing AI to your team',
    excerpt: 'Start with a clear problem, responsible experimentation, and a plan your people can trust.',
    image: u('photo-1531482615713-2afd69097998'),
    imageAlt: 'Technology team discussing ideas around a laptop',
    author: 'DigiKon Team',
    initials: 'AI',
    avatar: ['#7767f5', '#c2a5ff'],
    readMinutes: 6,
    date: 3,
    popular: 5,
  },
]
