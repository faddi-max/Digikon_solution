
import { OurTeamHero } from '@/components/sections/Team/OurTeamHero'

import { PageMeta } from './PageMeta'
import { TeamPrinciples } from '@/components/sections/Team/TeamPrinciples'

export function OurTeam() {
  return (
    <>
      <PageMeta title="Our Team" />
      <OurTeamHero />
        <TeamPrinciples />
    
    </>
  )
}