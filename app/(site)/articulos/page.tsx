import { Suspense } from 'react'
import { SectionHeading } from '@/_components/SectionHeading'
import { getArticles } from '@/_dal/articles/getArticles'
import { Breadcrumbs } from '../_components/Breadcrumbs'
import { ArticleListingSidebar } from '../_features/sidebar'
import { ArticleList } from './_components/ArticleList'
import { ArticleListSkeleton } from './_components/ArticleListSkeleton'
import { Separator } from '@/_components/Separator'

export default function ArticulosPage() {
  return (
    <div className="grid grid-cols-1 gap-10">
      <div className="min-w-0">
        <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Artículos' }]} />
        <SectionHeading as="h1" eyebrow="04 / ARTÍCULOS" title="Artículos y publicaciones" />
      </div>
      <Separator />
      <div className="container mx-auto grid grid-cols-1 gap-10 2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <Suspense fallback={<ArticleListSkeleton />}>
          <RequestArticleList />
        </Suspense>
        <ArticleListingSidebar />
      </div>
    </div>
  )
}

async function RequestArticleList() {
  const articles = await getArticles()
  return <ArticleList articles={articles} />
}
