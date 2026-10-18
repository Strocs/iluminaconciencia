import Image from 'next/image'
import { notFound } from 'next/navigation'
import { LinkButton } from '@/_components/LinkButton'
import { Breadcrumbs } from '../../_components/Breadcrumbs'
import { DefaultSidebar } from '../../_features/sidebar'
import { SectionHeading } from '@/_components/SectionHeading'
import { getNews } from '@/_dal/news/getNews'
import { getNewsBySlug } from '@/_dal/news/getNewsBySlug'
import type { News } from '@/_dal/news/types'

export async function generateStaticParams() {
  const news = await getNews()

  return news.map(({ slug }) => ({ slug }))
}

function getYouTubeEmbedUrl(url: string): string | undefined {
  try {
    const parsedUrl = new URL(url)

    if (
      parsedUrl.protocol !== 'https:' ||
      parsedUrl.hostname !== 'www.youtube.com' ||
      !parsedUrl.pathname.startsWith('/embed/')
    ) {
      return undefined
    }

    return parsedUrl.toString()
  } catch {
    return undefined
  }
}

function renderParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={`${index}-${paragraph.slice(0, 32)}`} className="whitespace-pre-line">
        {paragraph}
      </p>
    ))
}

function renderArticleContent(news: News) {
  const paragraphs = renderParagraphs(news.content.text)
  const hasContent =
    paragraphs.length > 0 ||
    news.content.images.length > 0 ||
    news.content.links.length > 0 ||
    news.content.embeds.length > 0

  if (!hasContent) return null

  return (
    <div className="mt-8 space-y-6 font-body text-base leading-relaxed text-foreground sm:text-lg">
      {paragraphs}

      {news.content.images.map((image, index) => (
        <figure key={`${image.url}-${index}`} className="space-y-2">
          <Image
            src={image.url}
            alt={image.alt ?? ''}
            width={1200}
            height={675}
            unoptimized
            className="h-auto max-h-168 w-full rounded border border-border object-contain"
          />
          {image.alt && <figcaption className="text-center text-sm text-text">{image.alt}</figcaption>}
        </figure>
      ))}

      {news.content.embeds.map((embed, index) => {
        const embedUrl = getYouTubeEmbedUrl(embed.url)

        if (!embedUrl) return null

        return (
          <div key={`${embed.url}-${index}`} className="aspect-video overflow-hidden rounded border border-border">
            <iframe
              src={embedUrl}
              title={embed.title ?? `Video relacionado ${index + 1}`}
              className="size-full"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )
      })}

      {news.content.links.length > 0 && (
        <aside aria-label="Enlaces relacionados" className="border-t border-border pt-6">
          <h2 className="mb-3 font-heading text-xl font-semibold">Enlaces relacionados</h2>
          <ul className="list-inside list-disc space-y-2">
            {news.content.links.map((link, index) => (
              <li key={`${link.url}-${index}`}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {link.text ?? link.url}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  )
}

export default async function NewsDetailPage({ params }: PageProps<'/noticias/[slug]'>) {
  const news = await getNewsBySlug((await params).slug)

  if (!news) notFound()

  return (
    <div className="grid grid-cols-1 gap-10">
      <div className="min-w-0">
        <Breadcrumbs
          items={[{ label: 'Inicio', href: '/' }, { label: 'Noticias', href: '/noticias' }, { label: news.title }]}
        />
        <SectionHeading as="h1" eyebrow="03 / NOTICIAS" title={news.title} />
      </div>
      <div className="container mx-auto grid grid-cols-1 gap-10 2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <article className="mx-auto w-full max-w-292 min-w-0">
          <p className="text-center font-body text-sm text-text">
            <time dateTime={news.publishedAt}>{news.publishedAtLabel}</time>
          </p>

          {news.image && (
            <figure className="mt-8">
              <Image
                src={news.image.url}
                alt={news.image.alt ?? ''}
                width={1200}
                height={675}
                unoptimized
                className="h-auto max-h-168 w-full rounded border border-border object-contain"
              />
            </figure>
          )}

          {renderArticleContent(news)}

          <div className="mt-10 flex justify-center">
            <LinkButton href="/noticias" variant="neutral">
              Volver a noticias
            </LinkButton>
          </div>
        </article>
        <DefaultSidebar />
      </div>
    </div>
  )
}
