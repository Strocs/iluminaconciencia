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
      <ul className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
        {pageArticles.map((article) => (
          <li key={article.id} className="min-w-0 border-b border-border/40 pb-6">
            <article className="flex h-full flex-col items-start gap-3">
              {article.image ? (
                <Image
                  src={article.image.url}
                  alt={article.image.alt ?? ''}
                  width={1200}
                  height={675}
                  loading="lazy"
                  unoptimized
                  className="aspect-video h-auto w-full rounded border border-border object-cover"
                />
              ) : null}
              <p className="font-body text-sm text-text">
                <time dateTime={article.publishedAt}>{article.publishedAtLabel}</time>
              </p>
              <h2 className="font-heading text-2xl leading-tight font-semibold text-foreground">{article.title}</h2>
              <a
                href={article.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-sm font-body text-primary underline underline-offset-4 transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
              >
                Ver publicación
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
