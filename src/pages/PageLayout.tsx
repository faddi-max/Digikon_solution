import { Outlet } from 'react-router-dom'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/sections/Footer/Footer'

export function PageLayout() {
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
