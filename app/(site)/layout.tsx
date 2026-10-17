import type { ReactNode } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Header } from '@/_shared/header'
import { SiteAside } from './_components/site-aside/SiteAside'

export default function SiteLayout({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  return (
    <>
      <Header />
      <NuqsAdapter>
        <div className="min-h-[60dvh] px-4 pt-32 pb-16 text-foreground sm:px-5">
          <div className="mx-auto grid w-full max-w-448 grid-cols-1 gap-10 2xl:grid-cols-[minmax(0,1fr)_17rem]">
            <main className="mx-auto w-full max-w-360 min-w-0">{children}</main>
            <div className="min-w-0">
              <SiteAside>{aside}</SiteAside>
            </div>
          </div>
        </div>
      </NuqsAdapter>
    </>
  )
}
