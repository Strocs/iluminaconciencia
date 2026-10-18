import Link from 'next/link'
import { getNews } from '@/_dal/news/getNews'
import { AsideSection } from './AsideSection'

export async function LatestNews() {
  const news = await getNews()
  const latestNews = news.toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 5)

  return (
    <AsideSection title="Últimas noticias" href="/noticias" linkLabel="Ver todas las noticias">
      {latestNews.length === 0 ? (
        <p className="mt-4 text-sm text-text">No hay publicaciones disponibles por el momento.</p>
      ) : (
        <ul className="mt-4 space-y-1">
          {latestNews.map((item) => (
            <li key={item.id} className="min-w-0">
              <Link
                href={`/noticias/${item.slug}`}
                title={item.title}
                className="block min-w-0 rounded-sm py-2 text-sm text-text transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
              >
                <span className="block truncate">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AsideSection>
  )
}
