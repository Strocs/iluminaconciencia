import { PublicationCardSkeleton } from '@/_features/publications/PublicationCardSkeleton'

export function NewsListSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Cargando noticias…</span>
      <ul className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {Array.from({ length: 8 }, (_, index) => (
          <li key={index} className="min-w-0">
            <PublicationCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  )
}
