

import { FaqSection } from '@/components/sections/FAQ/FaqSection'
import { PageMeta } from './PageMeta'
import { CtaSection } from '@/components/sections/CtaSection'
import ProductHero from '@/components/Products/ProductHero'
import BuildingSomething from '@/components/Products/BuildingSomething'
import ProductCollection from '@/components/Products/ProductCollection'

export function ProductsPage() {
  return (
    <>
      <PageMeta title="Products" />
      <ProductHero />
      <ProductCollection />
      <BuildingSomething />
     <FaqSection />
          <CtaSection />
    </>
  )
}
