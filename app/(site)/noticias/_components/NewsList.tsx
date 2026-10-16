'use client'

import Image from 'next/image'
import Link from 'next/link'
import { LinkButton } from '@/_components/LinkButton'
import { usePagination } from '@/_hooks/usePagination'
import type { NewsSummary } from '@/_dal/news/types'

interface NewsListProps {
  news: NewsSummary[]
}

export function NewsList({ news }: NewsListProps) {
  const { page, pageCount, startIndex, endIndex, hasPreviousPage, hasNextPage, previousPage, nextPage } = usePagination(
    { totalItems: news.length, pageSize: 6 }
  )
  const pageNews = news.slice(startIndex, endIndex)

  if (news.length === 0) {
    return <p className="py-8 text-center font-body text-text">No hay noticias disponibles por el momento.</p>
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
        {pageNews.map((item) => (
          <li key={item.id} className="min-w-0 border-b border-border/40 pb-6">
            <article className="flex h-full flex-col gap-3">
              {item.image && (
                <Link
                  href={`/noticias/${item.slug}`}
                  aria-label={`Leer noticia: ${item.title}`}
                  className="group/image block overflow-hidden rounded border border-border focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Image
                    src={item.image.url}
                    alt={item.image.alt ?? ''}
                    width={1200}
                    height={675}
                    loading="lazy"
                    unoptimized
                    className="aspect-video h-auto w-full object-cover transition-transform duration-200 group-hover/image:scale-105 motion-reduce:transition-none motion-reduce:group-hover/image:scale-100"
                  />
                </Link>
              )}
              <p className="font-body text-sm text-text">
                <time dateTime={item.publishedAt}>{item.publishedAtLabel}</time>
              </p>
              <h2 className="font-heading text-2xl leading-tight font-semibold text-foreground">
                <Link
                  href={`/noticias/${item.slug}`}
                  className="rounded-sm transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
                >
                  {item.title}
                </Link>
              </h2>
              <p className="font-body leading-relaxed text-text">{item.description}</p>
            </article>
          </li>
        ))}
      </ul>

      {pageCount > 1 && (
        <nav aria-label="Paginación de noticias" className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <LinkButton
            as="btn"
            variant="neutral"
            disabled={!hasPreviousPage}
            onClick={() => void previousPage()}
            aria-label="Mostrar noticias anteriores"
          >
            Anterior
          </LinkButton>
          <p aria-live="polite" aria-atomic="true" className="font-body text-sm text-text">
            Página {page} de {pageCount}
          </p>
          <LinkButton
            as="btn"
            variant="neutral"
            disabled={!hasNextPage}
            onClick={() => void nextPage()}
            aria-label="Mostrar noticias siguientes"
          >
            Siguiente
          </LinkButton>
        </nav>
      )}
    </>
  )
}
