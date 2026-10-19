import { FaqSection } from '@/components/sections/FAQ/FaqSection'

import { PageMeta } from './PageMeta'

export function FaqPage() {
  return (
    <>
      <PageMeta title="FAQs" />
      <FaqSection />
    </>
  )
}
