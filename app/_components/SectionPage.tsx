import type { ReactNode } from 'react'
import { SectionHeading } from './SectionHeading'
import { PageLayout } from '@/_shared/page/PageLayout'
import type { BreadcrumbItem } from '@/_shared/page/Breadcrumbs'

interface SectionPageProps {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
  breadcrumbs?: readonly BreadcrumbItem[]
}

export function SectionPage({ eyebrow, title, description, children, breadcrumbs }: SectionPageProps) {
  return (
    <PageLayout
      breadcrumbs={breadcrumbs ?? [{ label: 'Inicio', href: '/' }, { label: title }]}
      header={<SectionHeading as="h1" eyebrow={eyebrow} title={title} subtitle={description} />}
    >
      {children}
    </PageLayout>
  )
}
