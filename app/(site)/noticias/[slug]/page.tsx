import { notFound } from 'next/navigation'
import { LinkButton } from '@/_components/LinkButton'
import { Breadcrumbs } from '../../_components/Breadcrumbs'
import { DefaultSidebar } from '../../_features/sidebar'
import { SectionHeading } from '@/_components/SectionHeading'
import { getNews } from '@/_dal/news/getNews'
import { createSlug } from '@/_utils/createSlug'
import { formatPublishedAt } from '@/_utils/formatPublishedAt'
import { NewsContent } from './_components/NewsContent'
import { Separator } from '@/_components/Separator'

export async function generateStaticParams() {
  const news = await getNews()

  return news.map(({ slug }) => ({ slug }))
}

export default async function NewsDetailPage({ params }: PageProps<'/noticias/[slug]'>) {
  const { slug } = await params
  const news = (await getNews()).find((item) => item.slug === slug)

  if (!news) notFound()

  return (
    <div className="grid grid-cols-1 gap-10">
      <div className="min-w-0">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Noticias', href: '/noticias' },
            { label: createSlug(news.title) }
          ]}
        />
        <SectionHeading as="h1" eyebrow="03 / NOTICIAS" title={news.title} />
      </div>
      <Separator />

      <div className="container mx-auto grid grid-cols-1 gap-10 2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <article className="mx-auto w-full min-w-0">
          <p className="pb-4 text-start font-body text-sm text-text">
            <time dateTime={news.publishedAt}>{formatPublishedAt(news.publishedAt)}</time>
          </p>

          <NewsContent news={news} />

          <Separator />
        </article>
        <DefaultSidebar />
        <div className="col-span-full flex justify-center">
          <LinkButton href="/noticias" variant="neutral">
            Volver a noticias
          </LinkButton>
        </div>
      </div>
    </div>
  )
}
