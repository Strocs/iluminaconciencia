'use client'

import { Button } from '@/_components/Button'
import { PublicationCard } from '@/_features/publications/PublicationCard'
import type { Article } from '@/_dal/articles/types'
import { usePagination } from '@/_hooks/usePagination'

interface ArticleListProps {
  articles: Article[]
}

export function ArticleList({ articles }: ArticleListProps) {
  const { page, pageCount, startIndex, endIndex, hasPreviousPage, hasNextPage, previousPage, nextPage } = usePagination(
    {
      totalItems: articles.length,
      pageSize: 8
    }
  )
  const pageArticles = articles.slice(startIndex, endIndex)

  if (articles.length === 0) {
    return <p className="py-8 text-center font-body text-text">No hay publicaciones disponibles por el momento.</p>
  }

  return (
    <>
      <ul className="grid min-w-0 grid-cols-1 gap-x-8 md:grid-cols-2">
        {pageArticles.map((article) => (
          <li key={article.id} className="min-w-0">
            <PublicationCard
              title={article.title}
              image={article.image}
              publishedAt={article.publishedAt}
              publishedAtLabel={article.publishedAtLabel}
              href={article.resourceUrl}
              external
              linkLabel={`Ver publicación: ${article.title} (se abre en una nueva pestaña)`}
              headingAs="h2"
            />
          </li>
        ))}
      </ul>

      {pageCount > 1 ? (
        <nav
          aria-label="Paginación de artículos"
          className="order-last col-span-full flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            as="btn"
            variant="neutral"
            size="sm"
            disabled={!hasPreviousPage}
            onClick={() => void previousPage()}
            aria-label="Mostrar publicaciones anteriores"
          >
            Anterior
          </Button>
          <p aria-live="polite" aria-atomic="true" className="font-body text-sm text-text">
            Página {page} de {pageCount}
          </p>
          <Button
            as="btn"
            variant="neutral"
            size="sm"
            disabled={!hasNextPage}
            onClick={() => void nextPage()}
            aria-label="Mostrar publicaciones siguientes"
          >
            Siguiente
          </Button>
        </nav>
      ) : null}
    </>
  )
}
