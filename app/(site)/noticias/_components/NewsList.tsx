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
    { totalItems: news.length, pageSize: 9 }
  )
  const pageNews = news.slice(startIndex, endIndex)

  if (news.length === 0) {
    return <p className="py-8 text-center font-body text-text">No hay noticias disponibles por el momento.</p>
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {pageNews.map((item) => (
          <li key={item.id} className="min-w-0 border-b border-border/40 pb-6">
            <article className="h-full">
              <Link
                href={`/noticias/${item.slug}`}
                className="group flex h-full items-start gap-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {item.image && (
                  <Image
                    src={item.image.url}
                    alt={item.image.alt ?? ''}
                    width={160}
                    height={160}
                    loading="lazy"
                    unoptimized
                    className="size-16 shrink-0 rounded border border-border/40 object-cover sm:size-20"
                  />
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="font-body text-xs text-primary">
                    <time dateTime={item.publishedAt}>{item.publishedAtLabel}</time>
                  </p>
                  <h2 className="line-clamp-3 font-heading text-xl leading-snug text-foreground transition-colors group-hover:text-primary group-focus-visible:text-primary motion-reduce:transition-none">
                    {item.title}
                  </h2>
                  <p className="line-clamp-3 font-body text-sm leading-relaxed text-text">{item.description}</p>
                </div>
              </Link>
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
