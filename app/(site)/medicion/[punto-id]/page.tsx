import { notFound } from 'next/navigation'
import { getPoints } from '@/_dal/points/getPoints'
import { SectionHeading } from '@/_components/SectionHeading'
import { Breadcrumbs } from '../../_components/Breadcrumbs'
import { DefaultSidebar } from '../../_features/sidebar'

export async function generateStaticParams() {
  const points = await getPoints()

  return points.map(({ id }) => ({ 'punto-id': id }))
}

export default async function PuntoPage({ params }: PageProps<'/medicion/[punto-id]'>) {
  const { 'punto-id': pointId } = await params
  const points = await getPoints()
  const point = points.find(({ id }) => id === pointId)

  if (!point) notFound()

  return (
    <div className="grid grid-cols-1 gap-10">
      <div className="min-w-0">
        <Breadcrumbs
          items={[{ label: 'Inicio', href: '/' }, { label: 'Medición', href: '/medicion' }, { label: point.name }]}
        />
        <SectionHeading as="h1" eyebrow="MEDICIÓN / PUNTO" title={point.name} subtitle={`Identificador: ${point.id}`} />
      </div>
      <div className="container mx-auto grid grid-cols-1 gap-10 2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0">
          <dl className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-semibold">Instrumento</dt>
              <dd>{point.instrumentType}</dd>
            </div>
            <div>
              <dt className="font-semibold">Nivel de Bortle</dt>
              <dd>{point.bortleLevel ?? 'Sin datos'}</dd>
            </div>
            <div>
              <dt className="font-semibold">Mediciones</dt>
              <dd>{point.dataCount?.toLocaleString('es-CL') ?? 'Sin datos'}</dd>
            </div>
            <div>
              <dt className="font-semibold">Ubicación aproximada</dt>
              <dd>
                {point.position.lat}, {point.position.lng}
              </dd>
            </div>
          </dl>
          {point.detailUrl && (
            <p className="mt-8 text-center">
              <a
                className="text-primary underline underline-offset-4"
                href={point.detailUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir información detallada del punto
              </a>
            </p>
          )}
        </div>
        <DefaultSidebar />
      </div>
    </div>
  )
}
