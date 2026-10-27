

import { FaqSection } from '@/components/sections/FAQ/FaqSection'
import { CtaSection } from '@/components/sections/CtaSection'

import { PageMeta } from './PageMeta'
import WorkHero from '@/components/sections/Work/WorkHero'
import { WorkShowcase } from '@/components/sections/Work/WorkShowcase'
import { WorkPromise } from '@/components/sections/Work/WorkPromise'

export function WorkPage() {
  return (
    <>
      <PageMeta title="Work" />
      <WorkHero />
      <WorkShowcase />
      <WorkPromise />
   
      <FaqSection />
      <CtaSection />
    </>
  )
}