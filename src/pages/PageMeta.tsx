import { Helmet } from 'react-helmet-async'

export function PageMeta({ title }: { title: string }) {
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
