import type { ReactElement } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

type AppRouterProps = { element: ReactElement }

export function AppRouter({ element }: AppRouterProps) {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={element} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  )
}
