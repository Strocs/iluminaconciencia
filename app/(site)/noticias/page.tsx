import { Suspense } from 'react'
import { SectionHeading } from '@/_components/SectionHeading'
import { PageLayout } from '@/_shared/page/PageLayout'
import { getNews } from '@/_dal/news/getNews'
import { getArticles } from '@/_dal/articles/getArticles'
import { Separator } from '@/_components/Separator'
import { SiteAside, AsideSection } from '@/_shared/site-aside/SiteAside'
import { RecentLinks } from '@/_shared/site-aside/RecentLinks'
import { NewsList } from './_components/NewsList'

export default async function NoticiasPage({ searchParams }: PageProps<'/noticias'>) {
  const [news, articles] = await Promise.all([getNews(), getArticles()])
  const recentArticles = articles
    .toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 5)
    .map((article) => ({ id: article.id, label: article.title, href: article.resourceUrl, external: true }))

  return (
    <PageLayout
      breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Noticias' }]}
      header={
        <>
          <SectionHeading
            as="h1"
            eyebrow="03 / NOTICIAS"
            title="Noticias"
            subtitle="Actualidad del proyecto y novedades sobre la protección de nuestros cielos nocturnos."
          />
          <Separator />
        </>
      }
      aside={
        <SiteAside>
          <AsideSection title="Últimos artículos" href="/articulos" linkLabel="Ver todos los artículos">
            <RecentLinks items={recentArticles} />
          </AsideSection>
        </SiteAside>
      }
    >
      <Suspense fallback={<p className="py-8 text-center text-text">Cargando noticias…</p>}>
        <RequestNewsList news={news} searchParams={searchParams} />
      </Suspense>
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
