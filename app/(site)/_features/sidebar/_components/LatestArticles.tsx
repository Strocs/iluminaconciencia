import { getArticles } from '@/_dal/articles/getArticles'
import { BrandStarIcon } from '@/_components/BrandStarIcon'
import { SidebarSection } from './SidebarSection'

export async function LatestArticles() {
  const articles = await getArticles()
  const latestArticles = articles.toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 5)

  return (
    <SidebarSection title="Últimos artículos" href="/articulos" linkLabel="Ver todos los artículos">
      {latestArticles.length === 0 ? (
        <p className="mt-4 text-sm text-text">No hay publicaciones disponibles por el momento.</p>
      ) : (
        <ul className="mt-4 space-y-1">
          {latestArticles.map((article) => (
            <li key={article.id} className="min-w-0">
              <a
                href={article.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={article.title}
                className="flex min-w-0 items-center gap-2 rounded-sm py-2 text-sm text-text transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
              >
                <BrandStarIcon className="shrink-0 text-primary" />
                <span className="block truncate">{article.title}</span>
                <span className="sr-only"> (se abre en una nueva pestaña)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </SidebarSection>
  )
}
