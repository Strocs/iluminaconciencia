import type { ReactNode } from 'react'
import { SectionHeading } from './SectionHeading'

interface SectionPageProps {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}

export function SectionPage({ eyebrow, title, description, children }: SectionPageProps) {
  return (
    <main className="container mx-auto min-h-[60dvh] px-4 pt-32 pb-16 text-foreground sm:px-5">
      <SectionHeading as="h1" eyebrow={eyebrow} title={title} subtitle={description} />
      {children && <div className="mx-auto w-full max-w-360">{children}</div>}
    </main>
  )
}
