import Image from 'next/image'
import Link from 'next/link'
import { LinkButton } from '@/_components/LinkButton'
import { SectionHeading } from '@/_components/SectionHeading'
import { ArrowIcon } from '@/_components/icons/Arrow'
import { getArticles } from '@/_dal/articles/getArticles'
import { getNews } from '@/_dal/news/getNews'

export async function NewsArticlesSection() {
  const [news, articles] = await Promise.all([getNews(), getArticles()])

  return (
    <section className="relative z-10 px-4 sm:px-5" aria-label="Noticias y artículos">
      <div className="mx-auto grid w-full max-w-360 gap-20 lg:grid-cols-2 lg:gap-24">
        <section id="noticias" className="space-y-8" aria-labelledby="noticias-title">
          <SectionHeading
            titleId="noticias-title"
            className="py-0"
            eyebrow="03 / NOTICIAS"
            title="Noticias Recientes"
          />

          <div>
            {news.slice(0, 3).map((item) => (
              <article
                key={item.id}
                className="group relative min-h-0 items-start border-b border-border/40 py-5 sm:h-42 sm:min-h-auto sm:items-stretch sm:py-4"
              >
                <Link
                  href={`/noticias/${item.slug}`}
                  aria-label={`Leer ${item.title}`}
                  className="relative flex h-fit flex-col gap-4 sm:h-full sm:flex-row md:min-h-0"
                >
                  {item.image && (
                    <div className="aspect-video h-full shrink-0 overflow-hidden rounded border border-border sm:aspect-square sm:h-full">
                      <Image
                        className="size-full object-cover transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        src={item.image.url}
                        alt={item.image.alt ?? ''}
                        width={370}
                        height={240}
                        loading="lazy"
                        decoding="async"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="text-xs text-primary">{item.publishedAtLabel}</p>
                    <h3 className="line-clamp-2 font-heading text-[clamp(1.25rem,1.8vw,1.55rem)] leading-none text-balance text-foreground transition-colors duration-200 group-hover:text-primary motion-reduce:transition-none">
                      {item.title}
                    </h3>
                    <p className="line-clamp-2 text-sm font-light text-pretty text-text">{item.description}</p>
                  </div>
                  <ArrowIcon
                    size={24}
                    className="my-auto hidden text-primary transition-transform duration-200 group-hover:-rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 sm:block"
                  />
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <LinkButton href="/noticias" variant="important">
              Más Noticias
            </LinkButton>
          </div>
        </section>

        <section id="articulos" className="space-y-8" aria-labelledby="articulos-title">
          <SectionHeading
            titleId="articulos-title"
            className="py-0"
            eyebrow="04 / ARTÍCULOS"
            title="Artículos y Publicaciones"
          />

          <div>
            {articles.slice(0, 3).map((item) => (
              <article
                key={item.id}
                className="group relative min-h-0 items-start border-b border-border/40 py-5 sm:h-42 sm:min-h-auto sm:items-stretch sm:py-4"
              >
                <a
                  href={item.resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ver publicación: ${item.title} (se abre en una nueva pestaña)`}
                  className="relative flex h-fit flex-col gap-4 sm:h-full sm:flex-row md:min-h-0"
                >
                  {item.image && (
                    <div className="aspect-video h-full shrink-0 overflow-hidden rounded border border-border sm:aspect-square sm:h-full">
                      <Image
                        className="size-full object-cover transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        src={item.image.url}
                        alt={item.image.alt ?? ''}
                        width={370}
                        height={240}
                        loading="lazy"
                        decoding="async"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="text-xs text-primary">{item.publishedAtLabel}</p>
                    <h3 className="line-clamp-2 font-heading text-[clamp(1.25rem,1.8vw,1.55rem)] leading-none text-balance text-foreground transition-colors duration-200 group-hover:text-primary motion-reduce:transition-none">
                      {item.title}
                    </h3>
                    <span className="mt-auto inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4">
                      Ver publicación
                      <ArrowIcon
                        size={16}
                        className="transition-transform duration-200 group-hover:-rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
                      />
                    </span>
                  </div>
                  <ArrowIcon
                    size={24}
                    className="my-auto hidden text-primary transition-transform duration-200 group-hover:-rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 sm:block"
                  />
                </a>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <LinkButton href="/articulos" variant="important">
              Más Artículos
            </LinkButton>
          </div>
        </section>
      </div>
    </section>
  )
}
