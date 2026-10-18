import { PublicationCardSkeleton } from '@/_features/publications/PublicationCardSkeleton'

export function ArticleListSkeleton() {
  return (
    <div role="status" className="min-w-0">
      <span className="sr-only">Cargando publicaciones…</span>
      <ul className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
        {Array.from({ length: 8 }, (_, index) => (
          <li key={index} className="min-w-0">
            <PublicationCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  )
}
