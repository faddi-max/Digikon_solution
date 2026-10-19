import { Helmet } from 'react-helmet-async'
import { Outlet, Route, Routes } from 'react-router-dom'

import { AppRouter } from '@/app/router'
import { ProductsSection } from '@/components/Products/ProductsSection'
import { Header } from '@/components/layout/Header'
import { AboutSection } from '@/components/sections/About/AboutSection'
import { Footer } from '@/components/sections/Footer/Footer'
import { FaqSection } from '@/components/sections/FAQ/FaqSection'
import { Hero } from '@/components/sections/Hero/Hero'
import { ProcessSection } from '@/components/sections/Process/ProcessSection'
import { ServicesSection } from '@/components/sections/Services/ServicesSection'
import { WorkSection } from '@/components/sections/Work/WorkSection'

import './SitePage.css'
import { TestimonialsSection } from '@/components/sections/Testimonials/TestimonialsSection'

function PageMeta({ title }: { title: string }) {
  return (
    <Helmet>
      <title>{title} | DigiKon Solutions</title>
      <meta
        name="description"
        content="DigiKon Solutions digital systems and services."
      />
    </Helmet>
  )
}

function HomePage() {
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
      <Footer />
    </>
  )
}

function PageLayout() {
  return (
    <>
      <a className="dk-skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main className="dk-page" id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

function ContactPage() {
  return (
    <section className="dk-page__intro" aria-labelledby="contact-title">
      <PageMeta title="Contact" />
      <p className="dk-page__eyebrow">Start a project</p>
      <h1 id="contact-title">Let’s build your next digital system.</h1>
      <p>
        Tell us where growth feels disconnected. We’ll help you identify the
        next practical step.
      </p>
      <a className="dk-page__email" href="mailto:hello@example.com">
        hello@example.com
      </a>
    </section>
  )
}

export default function App() {
  return (
    <AppRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<PageLayout />}>
          <Route
            path="/about"
            element={
              <>
                <PageMeta title="About" />
                <AboutSection />
              </>
            }
          />
          <Route
            path="/services"
            element={
              <>
                <PageMeta title="Services" />
                <ServicesSection />
              </>
            }
          />
          <Route
            path="/work"
            element={
              <>
                <PageMeta title="Work" />
                <WorkSection />
              </>
            }
          />
          <Route
            path="/products"
            element={
              <>
                <PageMeta title="Products" />
                <ProductsSection />
              </>
            }
          />
          <Route
            path="/how-it-works"
            element={
              <>
                <PageMeta title="How it works" />
                <ProcessSection />
              </>
            }
          />
          <Route
            path="/faqs"
            element={
              <>
                <PageMeta title="FAQs" />
                <FaqSection />
              </>
            }
          />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
      </Routes>
    </AppRouter>
  )
}
