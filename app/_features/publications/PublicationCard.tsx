import Image from 'next/image'
import Link from 'next/link'
import { BrandStarIcon } from '@/_components/BrandStarIcon'
import { ArrowIcon } from '@/_components/icons/Arrow'
import { formatPublishedAt } from '@/_utils/formatPublishedAt'

interface PublicationCardProps {
  title: string
  href: string
  image: { url: string; alt: string | null } | null
  publishedAt: string
  linkLabel: string
  external?: boolean
  headingAs?: 'h2' | 'h3'
  description?: string
  category?: string
}

export function PublicationCard({ headingAs: Heading = 'h3', ...props }: PublicationCardProps) {
  const content = (
    <>
      {props.image && (
        <div className="aspect-video h-full shrink-0 overflow-hidden rounded border border-border sm:aspect-square sm:h-full">
          <Image
            className="size-full object-cover transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            src={props.image.url}
            alt={props.image.alt ?? ''}
            width={370}
            height={240}
            loading="lazy"
            decoding="async"
            unoptimized
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-primary uppercase">
            <time dateTime={props.publishedAt}>{formatPublishedAt(props.publishedAt)}</time>
          </p>
          {props.category && (
            <>
              <BrandStarIcon className="text-primary" />
              <span className="rounded-xs bg-foreground/40 px-2 py-0.5 text-xs text-background">{props.category}</span>
            </>
          )}
        </div>
        <Heading className="line-clamp-2 font-heading text-[clamp(1.25rem,1.8vw,1.55rem)] leading-tight text-balance text-foreground transition-colors duration-200 group-hover:text-primary motion-reduce:transition-none">
          {props.title}
        </Heading>
        {props.description && (
          <p className="line-clamp-2 text-sm font-light text-pretty text-text">{props.description}</p>
        )}
      </div>
      <ArrowIcon
        size={24}
        className="my-auto hidden text-primary transition-transform duration-200 group-hover:-rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 sm:block"
      />
    </>
  )

  return (
    <article className="group relative min-h-0 items-start border-b border-border/40 py-5 sm:h-42 sm:min-h-auto sm:items-stretch sm:py-4">
      {!props.external ? (
        <Link
          href={props.href}
          aria-label={props.linkLabel}
          className="relative flex h-fit flex-col gap-4 sm:h-full sm:flex-row md:min-h-0"
        >
          {content}
        </Link>
      ) : (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={props.linkLabel}
          className="relative flex h-fit flex-col gap-4 sm:h-full sm:flex-row md:min-h-0"
        >
          {content}
        </a>
      )}
    </article>
  )
}
