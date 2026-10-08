import { LinkButton } from '@/_components/LinkButton'
import { SectionHeading } from '@/_components/SectionHeading'
import { articleItems, newsItems } from './data/news-data'
import { NewsArticleCard } from './components/NewsArticleCard'

export function NewsArticlesSection() {
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
            {newsItems.map((item) => (
              <NewsArticleCard
                key={item.href}
                href={item.href}
                image={{
                  src: item.image,
                  alt: item.imageAlt
                }}
                date={item.date}
                title={item.title}
                description={item.description}
              />
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

        <section id="articulos" className="space-y-8" aria-labelledby="articulos-title">
          <SectionHeading
            titleId="articulos-title"
            className="py-0"
            eyebrow="04 / ARTÍCULOS"
            title="Artículos y Publicaciones"
          />

          <div>
            {articleItems.map((item) => (
              <NewsArticleCard
                key={item.href}
                href={item.href}
                image={{
                  src: item.image,
                  alt: item.imageAlt || ''
                }}
                date={item.date}
                title={item.title}
                description={item.description}
                category={item.category}
              />
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
