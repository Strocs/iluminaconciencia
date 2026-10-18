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
    <header
      {...rest}
      className={cn('container mx-auto flex w-full flex-col items-center py-12 text-center', className)}
    >
      <div className="flex w-full flex-col items-center gap-4">
        <p className="font-body text-xs leading-4 font-light tracking-[3px] text-primary uppercase">{eyebrow}</p>

        <div className="flex w-full items-center justify-center gap-4">
          <span className="hidden h-px min-w-4 flex-1 bg-border sm:flex" aria-hidden="true" />
          <Heading
            id={titleId}
            className="max-w-full min-w-0 font-heading text-3xl leading-tight font-extrabold tracking-wide text-foreground sm:text-5xl sm:leading-12"
          >
            {title}
          </Heading>
          <span className="hidden h-px min-w-4 flex-1 bg-border sm:flex" aria-hidden="true" />
        </div>
      </div>

      {subtitle && (
        <div className="mt-4 flex max-w-full items-center justify-center gap-2 px-4">
          <BrandStarIcon className="shrink-0 text-primary" />
          <p className="font-body leading-relaxed font-extralight tracking-wide text-foreground">{subtitle}</p>
        </div>
      )}
    </header>
  )
}
