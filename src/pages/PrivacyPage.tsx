import { PrivacyHero } from '@/components/sections/Privacy/PrivacyHero'
import { PageMeta } from './PageMeta'
import { PrivacyContend } from '@/components/sections/Privacy/PrivacyContent'
import { PolicyCta } from '@/components/sections/Privacy/PolicyCta'

export function PrivacyPage() {
  return (
    <>
      <PageMeta title="Privacy Policy" />
      <PrivacyHero />
      <PrivacyContend />
      <PolicyCta />
    </>
  )
}