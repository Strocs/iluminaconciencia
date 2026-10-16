import { notFound } from 'next/navigation'
import { getPoints } from '@/_dal/points/getPoints'
import { SectionPage } from '@/_components/SectionPage'

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
    <SectionPage eyebrow="MEDICIÓN / PUNTO" title={point.name} description={`Identificador: ${point.id}`}>
      <dl className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
        <div><dt className="font-semibold">Instrumento</dt><dd>{point.instrumentType}</dd></div>
        <div><dt className="font-semibold">Nivel de Bortle</dt><dd>{point.bortleLevel ?? 'Sin datos'}</dd></div>
        <div><dt className="font-semibold">Mediciones</dt><dd>{point.dataCount?.toLocaleString('es-CL') ?? 'Sin datos'}</dd></div>
        <div><dt className="font-semibold">Ubicación aproximada</dt><dd>{point.position.lat}, {point.position.lng}</dd></div>
      </dl>
      {point.detailUrl && (
        <p className="mt-8 text-center">
          <a className="text-primary underline underline-offset-4" href={point.detailUrl} target="_blank" rel="noreferrer">
            Abrir información detallada del punto
          </a>
        </p>
      )}
    </SectionPage>
  )
}
