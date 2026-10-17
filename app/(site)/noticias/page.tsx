import { Suspense } from 'react'
import { SectionHeading } from '@/_components/SectionHeading'
import { PageLayout } from '@/_shared/page/PageLayout'
import { getNews } from '@/_dal/news/getNews'
import { NewsList } from './_components/NewsList'

export default async function NoticiasPage({ searchParams }: PageProps<'/noticias'>) {
  const news = await getNews()

  return (
    <PageLayout
      breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Noticias' }]}
      header={<SectionHeading as="h1" eyebrow="03 / NOTICIAS" title="Noticias" />}
    >
      <div className="mx-auto w-full max-w-360">
        <Suspense fallback={<p className="py-8 text-center text-text">Cargando noticias…</p>}>
          <RequestNewsList news={news} searchParams={searchParams} />
        </Suspense>
      </div>
    </PageLayout>
  )
}

async function RequestNewsList({
  news,
  searchParams
}: {
  news: Awaited<ReturnType<typeof getNews>>
  searchParams: PageProps<'/noticias'>['searchParams']
}) {
  // Reading request search params here keeps the nuqs client list in the request-rendered subtree.
  await searchParams
  return <NewsList news={news} />
}
