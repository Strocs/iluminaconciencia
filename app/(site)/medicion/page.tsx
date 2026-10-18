import Link from 'next/link'
import { SectionHeading } from '@/_components/SectionHeading'
import { Breadcrumbs } from '../_components/Breadcrumbs'
import { DefaultSidebar } from '../_features/sidebar'

export default function MedicionPage() {
  return (
    <div className="grid grid-cols-1 gap-10">
      <div className="min-w-0">
        <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Medición de la contaminación lumínica' }]} />
        <SectionHeading
          as="h1"
          eyebrow="MEDICIÓN"
          title="Medición de la contaminación lumínica"
          subtitle="Explora los puntos de monitoreo y sus datos."
        />
      </div>
      <div className="container mx-auto grid grid-cols-1 gap-10 2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0">
          <p className="text-center">
            <Link className="text-primary underline underline-offset-4" href="/medicion/tabla-de-datos">
              Consultar tabla de datos
            </Link>
          </p>
        </div>
        <DefaultSidebar />
      </div>
    </div>
  )
}
