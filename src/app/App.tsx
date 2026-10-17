import { Helmet } from 'react-helmet-async'

import { AppRouter } from '@/app/router'
import { Header } from '@/components/layout/Header'
import { Hero } from '@/components/sections/Hero/Hero'
import { AboutSection } from '@/components/sections/About/AboutSection'
import { Footer } from '@/components/sections/Footer/Footer'
function FoundationPage() {
  return (
    <>
      <a className="dk-skip-link" href="#main">
        Skip to content
      </a>
      <div className="dk-top">
        <Header />
        <main className="text-body-m text-text-primary font-sans" id="main">
          <Helmet>
            <title>DigiKon Solutions</title>
            <meta name="description" content="DigiKon Solutions website." />
          </Helmet>
          <Hero />
            <main>
    <AboutSection />
  </main>
  <Footer />
        </main>
      </div>
    </>
  )
}

export default function App() {
  return <AppRouter element={<FoundationPage />} />
}
