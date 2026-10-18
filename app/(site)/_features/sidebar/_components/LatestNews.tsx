import Link from 'next/link'
import { getNews } from '@/_dal/news/getNews'
import { BrandStarIcon } from '@/_components/BrandStarIcon'
import { SidebarSection } from './SidebarSection'

export async function LatestNews() {
  const news = await getNews()
  const latestNews = news.toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 5)

  return (
    <SidebarSection title="Últimas noticias" href="/noticias" linkLabel="Ver todas las noticias">
      {latestNews.length === 0 ? (
        <p className="mt-4 text-sm text-text">No hay publicaciones disponibles por el momento.</p>
      ) : (
        <ul className="mt-4 space-y-1">
          {latestNews.map((item) => (
            <li key={item.id} className="min-w-0">
              <Link
                href={`/noticias/${item.slug}`}
                title={item.title}
                className="flex min-w-0 items-center gap-2 rounded-sm py-2 text-sm text-text transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
              >
                <BrandStarIcon className="shrink-0 text-primary" />
                <span className="block truncate">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SidebarSection>
  )
}
