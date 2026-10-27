import { Navigate, useParams } from 'react-router-dom'

import { WorkDetail } from '@/components/sections/Work/WorkDetail'
import { findProject } from '@/components/sections/Work/workProjects'

import { PageMeta } from './PageMeta'

export function WorkDetailPage() {
  const { slug } = useParams()
  const project = findProject(slug)

  if (!project) return <Navigate to="/work" replace />

  return (
    <>
      <PageMeta title={project.title} />
      <WorkDetail key={project.slug} project={project} />
    </>
  )
}
