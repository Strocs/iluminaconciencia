import type { Metadata } from 'next'
import { ProjectContent } from '../_components/ProjectContent'

export const metadata: Metadata = {
  title: 'Proyecto | IluminAconciencia',
  alternates: { canonical: '/proyecto' },
  robots: { index: false, follow: true }
}

export default function EquipoPage() {
  return <ProjectContent teamEntry />
}
