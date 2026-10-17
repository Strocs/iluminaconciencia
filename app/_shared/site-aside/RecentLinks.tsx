import Link from 'next/link'

interface RecentLink {
  id: string
  label: string
  href: string
  external?: boolean
}

export function RecentLinks({ items }: { items: readonly RecentLink[] }) {
  if (items.length === 0) {
    return <p className="mt-4 text-sm text-text">No hay publicaciones disponibles por el momento.</p>
  }

  const linkClassName =
    'block min-w-0 rounded-sm py-2 text-sm text-text transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none'

  return (
    <ul className="mt-4 space-y-1">
      {items.map((item) => (
        <li key={item.id} className="min-w-0">
          {item.external ? (
            <a href={item.href} target="_blank" rel="noopener noreferrer" title={item.label} className={linkClassName}>
              <span className="block truncate">{item.label}</span>
              <span className="sr-only"> (se abre en una nueva pestaña)</span>
            </a>
          ) : (
            <Link href={item.href} title={item.label} className={linkClassName}>
              <span className="block truncate">{item.label}</span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}
