import Link from 'next/link'
import { SectionPage } from '@/_components/SectionPage'

export default function MedicionPage() {
  return (
    <SectionPage eyebrow="MEDICIÓN" title="Medición de la contaminación lumínica" description="Explora los puntos de monitoreo y sus datos." >
      <p className="text-center">
        <Link className="text-primary underline underline-offset-4" href="/medicion/tabla-de-datos">
          Consultar tabla de datos
        </Link>
      </p>
    </SectionPage>
  )
}
