import Link from 'next/link'
import { getPoints } from '@/_dal/points/getPoints'
import { SectionHeading } from '@/_components/SectionHeading'
import { Breadcrumbs } from '../../_components/Breadcrumbs'
import { DefaultSidebar } from '../../_features/sidebar'

export default async function TablaDeDatosPage() {
  const points = await getPoints()

  return (
    <div className="grid grid-cols-1 gap-10">
      <div className="min-w-0">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Medición', href: '/medicion' },
            { label: 'Tabla de datos' }
          ]}
        />
        <SectionHeading
          as="h1"
          eyebrow="MEDICIÓN"
          title="Tabla de datos"
          subtitle="Puntos disponibles en la red de monitoreo."
        />
      </div>
      <div className="container mx-auto grid grid-cols-1 gap-10 2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-primary">
                <th className="p-3" scope="col">
                  Punto
                </th>
                <th className="p-3" scope="col">
                  Instrumento
                </th>
                <th className="p-3" scope="col">
                  Nivel de Bortle
                </th>
                <th className="p-3" scope="col">
                  Datos
                </th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr className="border-b border-border" key={point.id}>
                  <th className="p-3 font-medium" scope="row">
                    <Link
                      className="text-primary underline underline-offset-4"
                      href={`/medicion/${encodeURIComponent(point.id)}`}
                    >
                      {point.name}
                    </Link>
                  </th>
                  <td className="p-3">{point.instrumentType}</td>
                  <td className="p-3">{point.bortleLevel ?? 'Sin datos'}</td>
                  <td className="p-3">{point.dataCount?.toLocaleString('es-CL') ?? 'Sin datos'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DefaultSidebar />
      </div>
    </div>
  )
}
