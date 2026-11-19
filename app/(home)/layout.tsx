import type { ReactNode } from 'react'
import { StandardLayout } from '@/_features/site-layout/StandardLayout'

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <StandardLayout>{children}</StandardLayout>
}
