import { Helmet } from 'react-helmet-async'

import { AppRouter } from '@/app/router'
import { Header } from '@/components/layout/Header'
import { Hero } from '@/components/sections/Hero/Hero'
import { AboutSection } from '@/components/sections/About/AboutSection'
import { ServicesSection } from '@/components/sections/Services/ServicesSection'
import { WorkSection } from '@/components/sections/Work/WorkSection'

import { ProcessSection } from '@/components/sections/Process/ProcessSection'
import { FaqSection } from '@/components/sections/FAQ/FaqSection'
import { Footer } from '@/components/sections/Footer/Footer'
import { ProductsSection } from '@/components/Products/ProductsSection'

function FoundationPage() {
  return (
    <>
      <a className="dk-skip-link" href="#main">
        Skip to content
      </a>
      <Helmet>
        <title>DigiKon Solutions</title>
        <meta name="description" content="DigiKon Solutions website." />
      </Helmet>

      {/* .dk-top is the shared header + hero shell (see Hero.css), so only those two live inside it. */}
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
      <FaqSection />
      <Footer />
    </>
  )
}

export default function App() {
  return <AppRouter element={<FoundationPage />} />
}