import type { ReactNode } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <main className="min-h-[60dvh] px-4 pt-32 pb-16 text-foreground sm:px-5">{children}</main>
    </NuqsAdapter>
  )
}
