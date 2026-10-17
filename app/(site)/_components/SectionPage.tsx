import type { ReactNode } from 'react'
import { SectionHeading } from '@/_components/SectionHeading'
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs'

interface SectionPageProps {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
  breadcrumbs?: readonly BreadcrumbItem[]
}

export function SectionPage({ eyebrow, title, description, children, breadcrumbs }: SectionPageProps) {
  return (
    <div className="container mx-auto grid grid-cols-1 gap-10">
      <div className="mx-auto w-full max-w-360 min-w-0">
        <Breadcrumbs items={breadcrumbs ?? [{ label: 'Inicio', href: '/' }, { label: title }]} />
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} subtitle={description} />
      </div>
      <div className="mx-auto w-full max-w-360 min-w-0">{children}</div>
    </div>
  )
}
