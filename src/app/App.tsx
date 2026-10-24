import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import { AppRouter } from '@/app/router'
import { AboutPage } from '@/pages/AboutPage'

import { FaqPage } from '@/pages/FaqPage'
import { HomePage } from '@/pages/HomePage'
import { PageLayout } from '@/pages/PageLayout'
import { ProcessPage } from '@/pages/ProcessPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { WorkPage } from '@/pages/WorkPage'

import './SitePage.css'
import { ContactOverlayProvider } from '@/components/sections/contact/ContactOverlayProvider'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { OurTeam } from '@/pages/OurTeam'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <AppRouter>
      <ScrollToTop />
      <ContactOverlayProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<PageLayout />}>
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:serviceId" element={<ServicesPage />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/how-it-works" element={<ProcessPage />} />
            <Route path="/faqs" element={<FaqPage />} />
            <Route path="/team" element={<OurTeam />} />
            <Route path="/privacy-policy" element={<PrivacyPage />} />
          </Route>
        </Routes>
      </ContactOverlayProvider>
    </AppRouter>
  )
}
