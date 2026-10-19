import { Route, Routes } from 'react-router-dom'

import { AppRouter } from '@/app/router'
import { AboutPage } from '@/pages/AboutPage'
import { ContactPage } from '@/pages/ContactPage'
import { FaqPage } from '@/pages/FaqPage'
import { HomePage } from '@/pages/HomePage'
import { PageLayout } from '@/pages/PageLayout'
import { ProcessPage } from '@/pages/ProcessPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { WorkPage } from '@/pages/WorkPage'

import './SitePage.css'

export default function App() {
  return (
    <AppRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<PageLayout />}>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/how-it-works" element={<ProcessPage />} />
          <Route path="/faqs" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
      </Routes>
    </AppRouter>
  )
}
