import { WorkSection } from '@/components/sections/Work/WorkSection'

import { PageMeta } from './PageMeta'

import { FaqSection } from '@/components/sections/FAQ/FaqSection'
import { CtaSection } from '@/components/sections/CtaSection'

export function WorkPage() {
  return (
    <>
      <PageMeta title="Work" />
      <WorkSection />
   
            <FaqSection />
            <CtaSection />
    </>
  )
}
