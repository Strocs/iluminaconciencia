import { Suspense } from 'react'
import { SectionHeading } from '@/_components/SectionHeading'
import { PageLayout } from '@/_shared/page/PageLayout'
import { getArticles } from '@/_dal/articles/getArticles'
import { getNews } from '@/_dal/news/getNews'
import { SiteAside, AsideSection } from '@/_shared/site-aside/SiteAside'
import { RecentLinks } from '@/_shared/site-aside/RecentLinks'
import { ArticleList } from './_components/ArticleList'

export default async function ArticulosPage({ searchParams }: PageProps<'/articulos'>) {
  const [articles, news] = await Promise.all([getArticles(), getNews()])
  const recentNews = news
    .toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 5)
    .map((item) => ({ id: item.id, label: item.title, href: `/noticias/${item.slug}` }))

  return (
    <PageLayout
      breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Artículos' }]}
      header={<SectionHeading as="h1" eyebrow="04 / ARTÍCULOS" title="Artículos y publicaciones" />}
      aside={
        <SiteAside>
          <AsideSection title="Últimas noticias" href="/noticias" linkLabel="Ver todas las noticias">
            <RecentLinks items={recentNews} />
          </AsideSection>
        </SiteAside>
      }
    >
      <Suspense fallback={<p className="py-8 text-center font-body text-text">Cargando publicaciones…</p>}>
        <RequestArticleList articles={articles} searchParams={searchParams} />
      </Suspense>
    </PageLayout>
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
