import type { Metadata } from 'next'
import { ProjectContent } from '../_components/ProjectContent'

export const metadata: Metadata = {
  title: 'Proyecto | IluminAconciencia',
  description:
    'Conoce IluminAconciencia: ciencia, territorio y comunidad para comprender la contaminación lumínica y cuidar el cielo nocturno.',
  alternates: { canonical: '/proyecto' }
}

export default function ProyectoPage() {
  return <ProjectContent />
}
