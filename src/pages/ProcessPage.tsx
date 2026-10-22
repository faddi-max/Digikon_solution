import { ProcessHero } from '@/components/sections/Process/ProcessHero'
import { ProcessPrinciples } from '@/components/sections/Process/ProcessPrinciples'
import { ProcessStages } from '@/components/sections/Process/ProcessStages'
import { ProcessSection } from '@/components/sections/Process/ProcessSection'

import { PageMeta } from './PageMeta'
import { CtaSection } from '@/components/sections/CtaSection'
import { FaqSection } from '@/components/sections/FAQ/FaqSection'
import { ProcessCta } from '@/components/sections/Process/ProcessCta'

export function ProcessPage() {
  return (
    <>
      <PageMeta title="How it works" />
      <ProcessHero />
      <ProcessPrinciples />
      <ProcessStages />
    
        <ProcessCta />
        <FaqSection />
        <CtaSection />
    </>
  )
}
