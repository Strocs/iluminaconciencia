import Link from 'next/link'
import { BrandStarIcon } from '@/_components/BrandStarIcon'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="flex justify-center">
      <ol className="flex min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-2 font-body text-xs text-text sm:text-sm">
        {items.map((item, index) => (
          <li key={`${index}-${item.label}`} className="flex max-w-full min-w-0 items-center gap-3">
            {index > 0 && <BrandStarIcon size={10} className="shrink-0 text-primary/70" />}
            {index < items.length - 1 && item.href ? (
              <Link
                href={item.href}
                className="min-w-0 rounded-sm wrap-break-word transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={index === items.length - 1 ? 'page' : undefined}
                className="min-w-0 truncate text-foreground"
                title={item.label}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
