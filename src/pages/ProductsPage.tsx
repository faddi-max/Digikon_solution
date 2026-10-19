import { ProductsSection } from '@/components/Products/ProductsSection'

import { PageMeta } from './PageMeta'

export function ProductsPage() {
  return (
    <>
      <PageMeta title="Products" />
      <ProductsSection />
    </>
  )
}
