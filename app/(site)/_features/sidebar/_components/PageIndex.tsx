import type { ReactNode } from 'react'
import { BrandStarIcon } from '@/_components/BrandStarIcon'

type IndexItem = { id: string; label: string } & ({ href: string } | { attributes: Record<`data-${string}`, string> })

const itemClass =
  'flex min-w-0 cursor-pointer items-center gap-2 rounded-sm py-1 text-left text-sm text-text transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none'

export function PageIndex({ items, children }: { items: readonly IndexItem[]; children?: ReactNode }) {
  return (
    <nav aria-label="En esta página" className="space-y-4 font-body text-sm">
      <h2 className="font-heading text-xl text-foreground">En esta página</h2>
      <ol className="space-y-1">
        {items.map((item) => {
          const content = (
            <>
              <BrandStarIcon className="shrink-0 text-primary" />
              <span>{item.label}</span>
            </>
          )
          return (
            <li key={item.id}>
              {'href' in item ? (
                <a href={item.href} className={itemClass}>
                  {content}
                </a>
              ) : (
                <button type="button" {...item.attributes} className={itemClass}>
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ol>
      {children && (
        <p className="text-sm leading-relaxed font-extralight text-text [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4">
          {children}
        </p>
      )}
    </nav>
  )
}
