export type BlogHeroData = {
  crumb: string
  label: string
  line: string            // was: lines: readonly [string, string]
  accent: string
  body: string
  primary: { label: string; href: string }
  secondary: { label: string }
  illustrationLabel: string
}

export const BLOG_HERO: BlogHeroData = {
  crumb: 'Blogs',
  label: 'Blogs',
  line: 'Ideas that move your',
  accent: 'business forward.',
 
  body: 'Fresh perspectives on software, AI, SEO, and digital growth built to help ambitious teams make smarter decisions and create what’s next.',
  primary: { label: 'Explore All', href: '#posts' },
  secondary: { label: 'Start a conversation' },
  illustrationLabel:
    'Illustration of a content dashboard with an article editor, charts and saved posts orbiting a central window.',
}