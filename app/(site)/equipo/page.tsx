import { SectionHeading } from '@/_components/SectionHeading'
import { Breadcrumbs } from '../_components/Breadcrumbs'
import { DefaultSidebar } from '../_features/sidebar'

export default function EquipoPage() {
  return (
    <div className="grid grid-cols-1 gap-10">
      <div className="min-w-0">
        <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Quiénes somos' }]} />
        <SectionHeading
          as="h1"
          eyebrow="EQUIPO"
          title="Quiénes somos"
          subtitle="Próximamente encontrarás aquí información sobre el equipo del proyecto."
        />
      </div>
      <div className="container mx-auto grid grid-cols-1 gap-10 2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <DefaultSidebar />
      </div>
    </div>
  )
}
