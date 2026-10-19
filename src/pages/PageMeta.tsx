import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

export function PageMeta({ title }: { title: string }) {
  const pageTitle =
    title === 'DigiKon Solutions' ? title : `${title} | DigiKon Solutions`

  useEffect(() => {
    document.title = pageTitle
  }, [pageTitle])

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta
        name="description"
        content="DigiKon Solutions digital systems and services."
      />
    </Helmet>
  )
}
