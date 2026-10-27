import { CtaSection } from '@/components/sections/CtaSection'
import { FaqSection } from '@/components/sections/FAQ/FaqSection'
import { Testimonialsreview } from '@/components/sections/Testimonials/Testimonialsreview'
import { TestimonialsHero } from '@/components/sections/Testimonials/TestimonialsHero'
import { TestimonialsWall } from '@/components/sections/Testimonials/TestimonialsWall'

import { PageMeta } from './PageMeta'

export function TestimonialsPage() {
  return (
    <>
      <PageMeta title="Testimonials" />
      <TestimonialsHero />
      
      <Testimonialsreview />
      <TestimonialsWall />
      <FaqSection />
      <CtaSection />
    </>
  )
}