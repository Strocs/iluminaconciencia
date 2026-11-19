import type { ReactNode } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { StandardLayout } from '@/_features/site-layout/StandardLayout'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <StandardLayout>
      <NuqsAdapter>
        <main className="min-h-[60dvh] px-4 py-32 text-foreground sm:px-5">{children}</main>
      </NuqsAdapter>
    </StandardLayout>
  )
}
