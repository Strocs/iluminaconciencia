import Image from 'next/image'
import { LinkButton } from '@/_components/LinkButton'
import { SectionHeading } from '@/_components/SectionHeading'
import { cn } from '@/_utils/cn'
import { articleItems, newsItems } from './news-data'

const rowClasses =
  'group relative flex min-h-37 items-center gap-4 border-b border-foreground/18 py-4 pr-10 first:pt-0 max-sm:min-h-0 max-sm:items-start max-sm:py-5'
const imageClasses =
  'size-full max-w-50 object-cover transition-transform duration-200 ease-out group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100'
const titleClasses = 'mt-2 text-balance font-heading text-[clamp(1.25rem,1.8vw,1.55rem)] leading-[0.98] text-foreground'
const titleLinkClasses =
  'rounded-xs outline-none transition-colors duration-150 group-hover:text-primary focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none'
const arrowClasses =
  'absolute right-0.5 grid size-8 place-items-center rounded-full text-primary outline-none transition-[transform,color] duration-200 ease-out group-hover:-rotate-45 group-hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background max-sm:right-0 max-sm:bottom-5 motion-reduce:transition-none motion-reduce:group-hover:rotate-0'

export function NewsArticlesSection() {
  return (
    <section className="relative z-10 px-4 py-16 sm:px-5 sm:py-20 lg:py-28" aria-label="Noticias y artículos">
      <div className="mx-auto grid w-full max-w-360 gap-20 lg:grid-cols-2 lg:gap-24">
        <section id="noticias" className="scroll-mt-28" aria-labelledby="noticias-title">
          <SectionHeading
            titleId="noticias-title"
            className="py-0"
            eyebrow="03 / NOTICIAS"
            title="Noticias Recientes"
          />

          <div className="mt-12 lg:mt-16">
            {newsItems.map((item) => (
              <article key={item.href} className={cn('max-sm:flex-col', rowClasses)}>
                <div className="aspect-5/3 w-48 shrink-0 overflow-hidden rounded-xs border border-border max-sm:w-full">
                  <Image
                    className={imageClasses}
                    src={item.image}
                    alt={item.imageAlt}
                    width={370}
                    height={240}
                    loading="lazy"
                    decoding="async"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.67rem] text-primary">{item.date}</p>
                  <h3 className={titleClasses}>
                    <a className={titleLinkClasses} href={item.href} target="_blank" rel="noreferrer">
                      {item.title}
                    </a>
                  </h3>
                  <p className="mt-2.5 text-xs/4 text-pretty text-text">{item.description}</p>
                </div>
                <a
                  className={arrowClasses}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Leer ${item.title}`}
                >
                  <svg
                    className="size-6 fill-none stroke-current stroke-icon [stroke-linecap:round] [stroke-linejoin:round]"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M9 12h8m-4-4 4 4-4 4" />
                  </svg>
                </a>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <LinkButton
              href="https://iluminaconciencia.userena.digital/#news"
              target="_blank"
              rel="noreferrer"
              variant="important"
            >
              Más Noticias
            </LinkButton>
          </div>
        </section>

        <section id="articulos" className="scroll-mt-28" aria-labelledby="articulos-title">
          <SectionHeading
            titleId="articulos-title"
            className="py-0"
            eyebrow="04 / ARTÍCULOS"
            title="Artículos y Publicaciones"
          />

          <div className="mt-12 lg:mt-16">
            {articleItems.map((item) => (
              <article key={item.href} className={cn(rowClasses, item.image && 'max-sm:flex-col')}>
                {item.image && (
                  <div className="aspect-square w-29 shrink-0 overflow-hidden rounded-xs border border-border max-sm:w-24">
                    <Image
                      className={imageClasses}
                      src={item.image}
                      alt={item.imageAlt ?? ''}
                      width={240}
                      height={240}
                      loading="lazy"
                      decoding="async"
                      unoptimized
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[0.67rem] text-primary">{item.date}</p>
                    <span className="text-primary" aria-hidden="true">
                      ✦
                    </span>
                    <span className="rounded bg-foreground/55 px-2 py-0.5 text-[0.62rem] text-background">
                      {item.category}
                    </span>
                  </div>
                  <h3 className={titleClasses}>
                    <a className={titleLinkClasses} href={item.href} target="_blank" rel="noreferrer">
                      {item.title}
                    </a>
                  </h3>
                  <p className="mt-2.5 text-xs/4 text-pretty text-text">{item.description}</p>
                </div>
                <a
                  className={arrowClasses}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Leer ${item.title}`}
                >
                  <svg
                    className="size-6 fill-none stroke-current stroke-icon [stroke-linecap:round] [stroke-linejoin:round]"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M9 12h8m-4-4 4 4-4 4" />
                  </svg>
                </a>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <LinkButton
              href="https://iluminaconciencia.userena.digital/#articles"
              target="_blank"
              rel="noreferrer"
              variant="important"
            >
              Más Artículos
            </LinkButton>
          </div>
        </section>
      </div>
    </section>
  )
}
