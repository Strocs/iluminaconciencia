'use client'

import Image from 'next/image'
import { LinkButton } from '@/_components/LinkButton'
import type { Article } from '@/_dal/articles/types'
import { usePagination } from '@/_hooks/usePagination'

interface ArticleListProps {
  articles: Article[]
}

export function ArticleList({ articles }: ArticleListProps) {
  const { page, pageCount, startIndex, endIndex, hasPreviousPage, hasNextPage, previousPage, nextPage } = usePagination(
    {
      totalItems: articles.length,
      pageSize: 6
    }
  )
  const pageArticles = articles.slice(startIndex, endIndex)

  if (articles.length === 0) {
    return <p className="py-8 text-center font-body text-text">No hay publicaciones disponibles por el momento.</p>
  }

  return (
    <>
      <ul className="space-y-6">
        {pageArticles.map((article) => (
          <li key={article.id} className="min-w-0 border-b border-border/40 pb-6">
            <article>
              <a
                href={article.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:gap-6"
              >
                {article.image && (
                  <Image
                    src={article.image.url}
                    alt={article.image.alt ?? ''}
                    width={224}
                    height={224}
                    loading="lazy"
                    unoptimized
                    className="size-20 shrink-0 rounded border border-border/40 object-cover sm:size-28"
                  />
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="font-body text-xs text-primary">
                    <time dateTime={article.publishedAt}>{article.publishedAtLabel}</time>
                  </p>
                  <h2 className="line-clamp-3 font-heading text-xl leading-snug text-foreground transition-colors group-hover:text-primary group-focus-visible:text-primary motion-reduce:transition-none sm:text-2xl">
                    {article.title}
                  </h2>
                  <span className="inline-flex font-body text-sm text-primary underline underline-offset-4">
                    Ver publicación
                    <span className="sr-only"> (se abre en una nueva pestaña)</span>
                  </span>
                </div>
              </a>
            </article>
          </li>
        ))}
      </ul>

      {pageCount > 1 ? (
        <nav aria-label="Paginación de artículos" className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <LinkButton
            as="btn"
            variant="neutral"
            disabled={!hasPreviousPage}
            onClick={() => void previousPage()}
            aria-label="Mostrar publicaciones anteriores"
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
            aria-label="Mostrar publicaciones siguientes"
          >
            Siguiente
          </LinkButton>
        </nav>
      ) : null}
    </>
  )
}
