import { Suspense } from 'react'
import { SectionHeading } from '@/_components/SectionHeading'
import { getArticles } from '@/_dal/articles/getArticles'
import { Breadcrumbs } from '../_components/Breadcrumbs'
import { ArticleList } from './_components/ArticleList'

export default function ArticulosPage({ searchParams }: PageProps<'/articulos'>) {
  return (
    <div className="grid grid-cols-1 gap-10">
      <div className="min-w-0">
        <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Artículos' }]} />
        <SectionHeading as="h1" eyebrow="04 / ARTÍCULOS" title="Artículos y publicaciones" />
      </div>
      <div className="min-w-0">
        <Suspense fallback={<p className="py-8 text-center font-body text-text">Cargando publicaciones…</p>}>
          <RequestArticleList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}

async function RequestArticleList({ searchParams }: Pick<PageProps<'/articulos'>, 'searchParams'>) {
  await searchParams
  const articles = await getArticles()
  return <ArticleList articles={articles} />
}
