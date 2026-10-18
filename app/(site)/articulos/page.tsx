import { Suspense } from 'react'
import { SectionHeading } from '@/_components/SectionHeading'
import { getArticles } from '@/_dal/articles/getArticles'
import { PublicationCardSkeleton } from '@/_features/publications/PublicationCardSkeleton'
import { Breadcrumbs } from '../_components/Breadcrumbs'
import { ArticleListingSidebar } from '../_features/sidebar'
import { ArticleList } from './_components/ArticleList'

export default function ArticulosPage({ searchParams }: PageProps<'/articulos'>) {
  return (
    <div className="grid grid-cols-1 gap-10">
      <div className="min-w-0">
        <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Artículos' }]} />
        <SectionHeading as="h1" eyebrow="04 / ARTÍCULOS" title="Artículos y publicaciones" />
      </div>
      <div className="container mx-auto grid grid-cols-1 gap-10 2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0">
          <Suspense
            fallback={
              <div role="status">
                <span className="sr-only">Cargando publicaciones…</span>
                {Array.from({ length: 6 }, (_, index) => (
                  <PublicationCardSkeleton key={index} />
                ))}
              </div>
            }
          >
            <RequestArticleList searchParams={searchParams} />
          </Suspense>
        </div>
        <ArticleListingSidebar />
      </div>
    </div>
  )
}

async function RequestArticleList({ searchParams }: Pick<PageProps<'/articulos'>, 'searchParams'>) {
  await searchParams
  const articles = await getArticles()
  return <ArticleList articles={articles} />
}
