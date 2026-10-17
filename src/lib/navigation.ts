export type NavigationItem = {
  href: string
  label: string
}

export const NAV_LINKS: readonly NavigationItem[] = [
  { label: 'About', href: '/#about' },
  { label: 'Services', href: '/#services' },
  { label: 'Work', href: '/#work' },
  { label: 'Products', href: '/#products' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'FAQs', href: '/#faqs' },
]

export const PRIMARY_CTA = {
  href: '/#contact',
  label: 'Get started',
} as const
