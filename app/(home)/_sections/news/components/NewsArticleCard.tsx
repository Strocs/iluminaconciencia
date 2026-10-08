import { BrandStarIcon } from '@/_components/BrandStarIcon'
import { ArrowIcon } from '@/_components/icons/Arrow'
import { cn } from '@/_utils/cn'
import Image from 'next/image'
import Link from 'next/link'

interface NewsArticleCardProps {
  href: string
  image: {
    src?: string
    alt: string
  }
  title: string
  category?: string
  description: string
  date: string
}

export function NewsArticleCard({ href, image, date, title, category, description }: NewsArticleCardProps) {
  return (
    <article
      className={cn(
        'group relative min-h-0 items-start border-b border-border/40 py-5 sm:min-h-auto sm:items-stretch sm:py-4 md:h-42 md:max-h-42'
      )}
    >
      <Link
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={`Leer ${title}`}
        className="relative flex h-fit gap-4 md:h-full md:min-h-0"
      >
        {image.src && (
          <div className="aspect-square h-full shrink-0 overflow-hidden rounded border border-border md:h-full">
            <Image
              className="size-full object-cover transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              src={image.src}
              alt={image.alt}
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
            <p className="text-xs text-primary">{date}</p>
            {category && (
              <>
                <BrandStarIcon className="text-primary" />
                <span className="rounded-xs bg-foreground/40 px-2 py-0.5 text-xs text-background">{category}</span>
              </>
            )}
          </div>
          <h3 className="line-clamp-2 font-heading text-[clamp(1.25rem,1.8vw,1.55rem)] leading-none text-balance text-foreground transition-colors duration-200 group-hover:text-primary motion-reduce:transition-none">
            {title}
          </h3>
          <p className="line-clamp-2 text-sm font-light text-pretty text-text">{description}</p>
        </div>
        <ArrowIcon
          size={24}
          className="my-auto text-primary transition-transform duration-200 group-hover:-rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
        />
      </Link>
    </article>
  )
}
