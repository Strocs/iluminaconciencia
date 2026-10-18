import { LinkButton } from '@/_components/LinkButton'
import { SectionHeading } from '@/_components/SectionHeading'
import { getArticles } from '@/_dal/articles/getArticles'
import { getNews } from '@/_dal/news/getNews'
import { PublicationCard } from '@/_features/publications/PublicationCard'

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
              <PublicationCard
                key={item.id}
                title={item.title}
                image={item.image}
                publishedAt={item.publishedAt}
                publishedAtLabel={item.publishedAtLabel}
                href={`/noticias/${item.slug}`}
                linkLabel={`Leer ${item.title}`}
                description={item.description}
              />
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
              <PublicationCard
                key={item.id}
                title={item.title}
                image={item.image}
                publishedAt={item.publishedAt}
                publishedAtLabel={item.publishedAtLabel}
                href={item.resourceUrl}
                external
                linkLabel={`Ver publicación: ${item.title} (se abre en una nueva pestaña)`}
              />
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
