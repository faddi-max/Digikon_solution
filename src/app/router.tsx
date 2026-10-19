import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

type AppRouterProps = { children: ReactNode }

export function AppRouter({ children }: AppRouterProps) {
  return (
    <HelmetProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </HelmetProvider>
  )
}
