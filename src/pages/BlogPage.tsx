import { CtaSection } from '@/components/sections/CtaSection'
import { BlogHero } from '@/components/sections/Blog/BlogHero'

import { PageMeta } from './PageMeta'
import { BlogGrid } from '@/components/sections/Blog/BlogGrid'
import { BlogNewsletter } from '@/components/sections/Blog/BlogNewsletter'

export function BlogPage() {
  return (
    <>
      <PageMeta title="Blogs" />
      <BlogHero />
      <section id="posts" aria-label="Blog posts" />
      <BlogGrid />
      <BlogNewsletter />
      <CtaSection />
    </>
  )
}