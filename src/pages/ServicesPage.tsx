import { useLocation, useParams } from 'react-router-dom'

import { ServiceHero } from '@/components/sections/Services/ServiceHero'
import { PageMeta } from './PageMeta'
import { FaqSection } from '@/components/sections/FAQ/FaqSection'
import { CtaSection } from '@/components/sections/CtaSection'
import { SeoStrategy } from '@/components/sections/Services/SeoStrategy'
import { IntentSection } from '@/components/sections/Services/IntentSection'
import { ProcessSection } from '@/components/sections/Services/ProcessSection'
import { OutcomesSection } from '@/components/sections/Services/OutcomesSection'
import { DeliverablesSection } from '@/components/sections/Services/DeliverablesSection'
import { getServiceDetail } from '@/components/sections/Services/servicesDetailData'
import { AutomationPage } from './AutomationPage'

export function ServicesPage() {
  const { serviceId } = useParams<{ serviceId?: string }>()
  const location = useLocation()

  // Resolve service slug from route params or URL hash fallback
  const hashSlug = location.hash ? location.hash.replace(/^#/, '') : ''
  const activeSlug = (serviceId || hashSlug || 'search-seo').toLowerCase()

  // Automation has a completely different design and layout
  if (activeSlug === 'automation-ai' || activeSlug === 'automation') {
    return <AutomationPage />
  }

  // All other services share the same high-performance components with dedicated data
  const service = getServiceDetail(activeSlug)

  return (
    <>
      <PageMeta title={service.metaTitle} />
      <ServiceHero key={`hero-${service.id}`} data={service.hero} />
      <SeoStrategy key={`strategy-${service.id}`} data={service.strategy} />
      <IntentSection key={`intent-${service.id}`} data={service.intent} />
      <ProcessSection key={`process-${service.id}`} data={service.process} />
      <OutcomesSection key={`outcomes-${service.id}`} data={service.outcomes} />
      <DeliverablesSection key={`deliverables-${service.id}`} data={service.deliverables} />
      <FaqSection key={`faq-${service.id}`} items={service.faqs} />
      <CtaSection />
    </>
  )
}
