import { Helmet } from 'react-helmet-async'

import { CtaSection } from '@/components/sections/CtaSection'
import { FaqBrowser } from '@/components/sections/FAQ/FaqBrowser'
import { FaqHero } from '@/components/sections/FAQ/FaqHero'
import { FAQ_CATEGORIES } from '@/components/sections/FAQ/faqPageData'

import { PageMeta } from './PageMeta'

/** schema.org FAQPage data, so search engines can read the questions and answers. */
const FAQ_SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_CATEGORIES.flatMap((c) =>
    c.items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  ),
})

export function FaqPage() {
  return (
    <>
      <PageMeta title="FAQs" />
      <Helmet>
        <meta
          name="description"
          content="Answers to common questions about working with DigiKon Solutions: getting started, scope, process, design and development, pricing and support after launch."
        />
        <script type="application/ld+json">{FAQ_SCHEMA}</script>
      </Helmet>
      <FaqHero />
      <FaqBrowser />
      <CtaSection />
    </>
  )
}
