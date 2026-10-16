import type { ReactNode } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Header } from '@/_shared/header'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <NuqsAdapter>{children}</NuqsAdapter>
    </>
  )
}
