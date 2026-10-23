'use client'

import { Button } from '@/_components/Button'
import { PublicationCard } from '@/_features/publications/PublicationCard'
import { usePagination } from '@/_hooks/usePagination'
import type { NewsSummary } from '@/_dal/news/types'

interface NewsListProps {
  news: NewsSummary[]
}

export function NewsList({ news }: NewsListProps) {
  const { page, pageCount, startIndex, endIndex, hasPreviousPage, hasNextPage, previousPage, nextPage } = usePagination(
    { totalItems: news.length, pageSize: 8 }
  )
  const pageNews = news.slice(startIndex, endIndex)

  if (news.length === 0) {
    return <p className="py-8 text-center font-body text-text">No hay noticias disponibles por el momento.</p>
  }

  return (
    <>
      <ul className="grid min-w-0 grid-cols-1 gap-x-8 md:grid-cols-2">
        {pageNews.map((item) => (
          <li key={item.id} className="min-w-0">
            <PublicationCard
              title={item.title}
              image={item.image}
              publishedAt={item.publishedAt}
              href={`/noticias/${item.slug}`}
              linkLabel={`Leer ${item.title}`}
              description={item.description}
              headingAs="h2"
            />
          </li>
        ))}
      </ul>

      {pageCount > 1 && (
        <nav
          aria-label="Paginación de noticias"
          className="order-last col-span-full flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            as="btn"
            variant="neutral"
            size="sm"
            disabled={!hasPreviousPage}
            onClick={() => void previousPage()}
            aria-label="Mostrar noticias anteriores"
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
            aria-label="Mostrar noticias siguientes"
          >
            Siguiente
          </Button>
        </nav>
      )}
    </>
  )
}
