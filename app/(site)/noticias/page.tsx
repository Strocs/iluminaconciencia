import { Suspense } from 'react'
import { SectionHeading } from '@/_components/SectionHeading'
import { Separator } from '@/_components/Separator'
import { getNews } from '@/_dal/news/getNews'
import { Breadcrumbs } from '../_components/Breadcrumbs'
import { NewsListingSidebar } from '../_features/sidebar'
import { NewsList } from './_components/NewsList'
import { NewsListSkeleton } from './_components/NewsListSkeleton'

export default function NoticiasPage() {
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
      <div className="container mx-auto grid grid-cols-1 gap-10 2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <Suspense fallback={<NewsListSkeleton />}>
          <RequestNewsList />
        </Suspense>
        <NewsListingSidebar />
      </div>
    </div>
  )
}

async function RequestNewsList() {
  const news = await getNews()
  const summaries = news.map(({ id, slug, title, description, publishedAt, publishedAtLabel, image }) => ({
    id,
    slug,
    title,
    description,
    publishedAt,
    publishedAtLabel,
    image
  }))
  return <NewsList news={summaries} />
}
