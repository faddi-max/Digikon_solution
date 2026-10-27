export type TestimonialsHeroData = {
  crumb: string
  label: string
  /** Plain first line, then the accent line that carries the green marker. */
  line: string
  accent: string
  body: string
  primary: { label: string; href: string }
  secondary: { label: string; to: string }
  illustrationLabel: string
}

/** Copy from the supplied design. */
export const TESTIMONIALS_HERO: TestimonialsHeroData = {
  crumb: 'Testimonials',
  label: 'Testimonials',
  line: 'Good work.',
  accent: 'Real trust.',
  body: 'Trust is earned stage by stage, not claimed in a headline. Here is what clients say about each step of working with DIGIKON, from the first conversation to launch.',
  primary: { label: 'Read the notes', href: '#testimonials' },
  secondary: { label: 'Start a conversation', to: '/contact' },
  illustrationLabel: 'Illustration of three client review cards with star ratings and quote marks.',
}
