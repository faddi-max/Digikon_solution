

import { ServiceHero } from '@/components/sections/Services/ServiceHero'
import { PageMeta } from './PageMeta'
import { FaqSection } from '@/components/sections/FAQ/FaqSection'
import { CtaSection } from '@/components/sections/CtaSection'
import { SeoStrategy } from '@/components/sections/Services/SeoStrategy'
import { IntentSection } from '@/components/sections/Services/IntentSection'
import { ProcessSection } from '@/components/sections/Services/ProcessSection'
import { OutcomesSection } from '@/components/sections/Services/OutcomesSection'
import { DeliverablesSection } from '@/components/sections/Services/DeliverablesSection'


export function ServicesPage() {
  return (
    <>
      <PageMeta title="Services" />
         <ServiceHero />
           <SeoStrategy />
             <IntentSection />
                  <ProcessSection />
                    <OutcomesSection />
                      <DeliverablesSection />
           <FaqSection />
               <CtaSection />
    </>
  )
}
