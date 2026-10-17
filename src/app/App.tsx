import { Helmet } from 'react-helmet-async'

import { AppRouter } from '@/app/router'

function FoundationPage() {
  return (
    <main className="bg-bg-canvas text-body-m text-text-primary font-sans">
      <Helmet>
        <title>DigiKon Solutions</title>
        <meta name="description" content="DigiKon Solutions website." />
      </Helmet>
      <h1>DigiKon Solutions</h1>
      <p>Foundation ready.</p>
    </main>
  )
}

export default function App() {
  return <AppRouter element={<FoundationPage />} />
}
