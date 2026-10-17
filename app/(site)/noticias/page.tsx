import { Suspense } from 'react'
import { SectionHeading } from '@/_components/SectionHeading'
import { Separator } from '@/_components/Separator'
import { getNews } from '@/_dal/news/getNews'
import { Breadcrumbs } from '../_components/Breadcrumbs'
import { NewsList } from './_components/NewsList'

export default function NoticiasPage({ searchParams }: PageProps<'/noticias'>) {
  return (
    <div className="grid grid-cols-1 gap-10">
      <div className="min-w-0">
        <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Noticias' }]} />
        <SectionHeading
          as="h1"
          eyebrow="03 / NOTICIAS"
          title="Noticias"
          subtitle="Actualidad del proyecto y novedades sobre la protección de nuestros cielos nocturnos."
        />
        <Separator />
      </div>
      <div className="min-w-0">
        <Suspense fallback={<p className="py-8 text-center text-text">Cargando noticias…</p>}>
          <RequestNewsList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}

async function RequestNewsList({ searchParams }: Pick<PageProps<'/noticias'>, 'searchParams'>) {
  await searchParams
  const news = await getNews()
  return <NewsList news={news} />
}
