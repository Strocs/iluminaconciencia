import type { ReactNode } from 'react'
import { cn } from '@/_utils/cn'
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs'

interface PageLayoutProps {
  breadcrumbs: readonly BreadcrumbItem[]
  header: ReactNode
  aside?: ReactNode
  children?: ReactNode
}

export function PageLayout({ breadcrumbs, header, aside, children }: PageLayoutProps) {
  return (
    <main className="min-h-[60dvh] px-4 pt-32 pb-16 text-foreground sm:px-5">
      <div
        className={cn(
          'mx-auto grid w-full grid-cols-1 gap-10',
          aside ? 'max-w-448 2xl:grid-cols-[minmax(0,1fr)_17rem]' : 'container'
        )}
      >
        <div className="col-start-1 mx-auto w-full max-w-360 min-w-0">
          <Breadcrumbs items={breadcrumbs} />
          {header}
        </div>
        <div className="col-start-1 mx-auto w-full max-w-360 min-w-0">{children}</div>
        {aside && <div className="min-w-0 2xl:col-start-2 2xl:row-start-2">{aside}</div>}
      </div>
    </main>
  )
}
