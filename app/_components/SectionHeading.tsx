import type { HTMLAttributes } from 'react'
import { BrandStarIcon } from './BrandStarIcon'
import { cn } from '@/_utils/cn'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type NativeHeaderProps = Omit<HTMLAttributes<HTMLElement>, 'className' | 'title'>

export interface SectionHeadingProps extends NativeHeaderProps {
  as?: HeadingTag
  className?: string
  eyebrow: string
  subtitle?: string
  title: string
  titleId?: string
}

export function SectionHeading({
  as: Heading = 'h2',
  className,
  eyebrow,
  subtitle,
  title,
  titleId,
  ...rest
}: SectionHeadingProps) {
  return (
    <header {...rest} className={cn('mx-auto flex w-full max-w-292 flex-col items-center py-8 text-center', className)}>
      <div className="flex w-full flex-col items-center gap-4">
        <p className="font-body text-xs leading-4 font-light tracking-[2px] text-primary uppercase">{eyebrow}</p>

        <div className="flex w-full items-center justify-center gap-4">
          <span className="h-px min-w-4 flex-1 bg-border max-sm:hidden" aria-hidden="true" />
          <Heading
            id={titleId}
            className="max-w-full min-w-0 font-heading text-3xl leading-tight font-bold text-foreground sm:text-[2.5rem] sm:leading-10.5"
          >
            {title}
          </Heading>
          <span className="h-px min-w-4 flex-1 bg-border max-sm:hidden" aria-hidden="true" />
        </div>
      </div>

      {subtitle && (
        <div className="mt-4 flex max-w-full items-center justify-center gap-2 px-4">
          <BrandStarIcon className="shrink-0 text-primary" />
          <p className="font-body text-base leading-section-subtitle font-normal text-foreground">{subtitle}</p>
        </div>
      )}
    </header>
  )
}
