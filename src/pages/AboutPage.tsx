

import { FaqSection } from '@/components/sections/FAQ/FaqSection'
import { PageMeta } from './PageMeta'
import { CtaSection } from '@/components/sections/CtaSection'
import { MissionSection } from '@/components/sections/About/MissionSection'
import { AboutHero } from '@/components/sections/About/AboutHero'
import { WorkflowSection } from '@/components/sections/About/WorkflowSection'
import { GuidesSection } from '@/components/sections/About/GuidesSection'
import { TeamSection } from '@/components/sections/About/TeamSection'


export function AboutPage() {
  return (
    <>
      <PageMeta title="About" />
      <AboutHero />
        <MissionSection />
            <WorkflowSection />
               <GuidesSection />
               <TeamSection />
       <FaqSection />
            <CtaSection />
         
    </>
  )
}
