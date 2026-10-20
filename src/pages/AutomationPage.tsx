import { PageMeta } from './PageMeta'
import { AutomationHero } from '@/components/sections/Automation/AutomationHero'


import { FaqSection } from '@/components/sections/FAQ/FaqSection'
import { CtaSection } from '@/components/sections/CtaSection'
import { OpportunitySection } from '@/components/sections/Automation/Automation/OpportunitySection'
import { InvisibleWorkSection } from '@/components/sections/Automation/InvisibleWorkSection'
import { AutomationShowcase } from '@/components/sections/Automation/Automation/AutomationShowcase'
import { ProcessSection } from '@/components/sections/Automation/Automation/ProcessSection'
import { CapabilitiesSection } from '@/components/sections/Automation/Automation/CapabilitiesSection'
import { UnlockSection } from '@/components/sections/Automation/Automation/UnlockSection'
import { CostEstimatorSection } from '@/components/sections/CostEstimatorSection'

const AUTOMATION_FAQS = [
  {
    q: 'How do you prevent AI hallucinations in automated workflows?',
    a: 'We use strict structured output schemas (JSON mode / Pydantic validation), high-confidence semantic retrieval (RAG) restricted to your verified company sources, and deterministic fallback logic that fails closed if confidence thresholds are not met.',
  },
  {
    q: 'Will automation replace our existing software or work with it?',
    a: 'Our automations sit on top of your existing tools (HubSpot, Slack, Google Workspace, PostgreSQL, Salesforce, Stripe, etc.) via secure APIs and webhooks. You do not have to migrate or replace your current software.',
  },
  {
    q: 'What happens if an external API (like Slack or CRM) goes down?',
    a: 'We engineer all workflows with exponential backoff retry mechanisms, persistent queue dead-lettering, and automated alerts so no event or customer submission is ever lost during third-party outages.',
  },
  {
    q: 'How long does a custom automation engagement take?',
    a: 'A focused automation (such as lead enrichment or support triage) typically launches in 2 to 3 weeks. A complex multi-agent operational engine across several departments takes 4 to 6 weeks.',
  },
  {
    q: 'Do you train models on our proprietary data?',
    a: 'Never. We utilize enterprise API agreements (Anthropic, OpenAI, AWS Bedrock) where data privacy clauses guarantee zero model training or retention on your business data.',
  },
]

export function AutomationPage() {
  return (
    <>
      <PageMeta title="Automation & AI | DigiKon Solutions" />
      <AutomationHero />
      <OpportunitySection />
      <InvisibleWorkSection />
      <section className="bg-white">
        <AutomationShowcase fill />
      </section>
        <ProcessSection />
           <CapabilitiesSection />
            <UnlockSection />
              <CostEstimatorSection />
      <FaqSection items={AUTOMATION_FAQS} />
      <CtaSection />
    </>
  )
}