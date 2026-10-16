import { Suspense } from 'react'
import { SectionHeading } from '@/_components/SectionHeading'
import { getArticles } from '@/_dal/articles/getArticles'
import { ArticleList } from './_components/ArticleList'

export default async function ArticulosPage({ searchParams }: PageProps<'/articulos'>) {
  const articles = await getArticles()

  return (
    <main className="container mx-auto min-h-[60dvh] px-4 pt-32 pb-16 text-foreground sm:px-5">
      <SectionHeading as="h1" eyebrow="04 / ARTÍCULOS" title="Artículos y publicaciones" />
      <div className="mx-auto w-full max-w-360">
        <Suspense fallback={<p className="py-8 text-center font-body text-text">Cargando publicaciones…</p>}>
          <RequestArticleList articles={articles} searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  )
}

async function RequestArticleList({
  articles,
  searchParams
}: {
  articles: Awaited<ReturnType<typeof getArticles>>
  searchParams: PageProps<'/articulos'>['searchParams']
}) {
  // Reading search params within Suspense keeps the nuqs list request-rendered with the requested page.
  await searchParams
  return <ArticleList articles={articles} />
}
