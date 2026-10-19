import { ProductsSection } from '@/components/Products/ProductsSection'
import { Header } from '@/components/layout/Header'
import { AboutSection } from '@/components/sections/About/AboutSection'
import { CtaSection } from '@/components/sections/CtaSection'
import { Footer } from '@/components/sections/Footer/Footer'
import { FaqSection } from '@/components/sections/FAQ/FaqSection'
import { Hero } from '@/components/sections/Hero/Hero'
import { ProcessSection } from '@/components/sections/Process/ProcessSection'
import { ServicesSection } from '@/components/sections/Services/ServicesSection'
import { TestimonialsSection } from '@/components/sections/Testimonials/TestimonialsSection'
import { WorkSection } from '@/components/sections/Work/WorkSection'

import { PageMeta } from './PageMeta'

export function HomePage() {
  return (
    <>
      <PageMeta title="DigiKon Solutions" />
      <a className="dk-skip-link" href="#main">
        Skip to content
      </a>
      <div className="dk-top">
        <Header />
        <main className="text-body-m text-text-primary font-sans" id="main">
          <Hero />
        </main>
      </div>
      <AboutSection />
      <ServicesSection />
      <WorkSection />
      <ProductsSection />
      <ProcessSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </>
  )
}
