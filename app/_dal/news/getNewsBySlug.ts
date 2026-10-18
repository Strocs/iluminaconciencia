import 'server-only'
import snapshot from './data/news.snapshot.json'
import { News } from './types'

interface NewsSnapshotItem extends News {
  sourcePosition: number
  sourceListingTitle: string
  sourcePageSha256: string
}

interface NewsSnapshot {
  items: NewsSnapshotItem[]
}

export async function getNewsBySlug(slug: string): Promise<News | undefined> {
  const item = (snapshot as NewsSnapshot).items.find((news) => news.slug === slug)

  if (!item) return undefined

  const {
    id,
    slug: newsSlug,
    title,
    description,
    descriptionIsTruncated,
    publishedAt,
    publishedAtLabel,
    datePrecision,
    image,
    content,
    sourceUrl
  } = item

  return {
    id,
    slug: newsSlug,
    title,
    description,
    descriptionIsTruncated,
    publishedAt,
    publishedAtLabel,
    datePrecision,
    image,
    sourceUrl,
    content: {
      sourceHtml: content.sourceHtml,
      text: content.text,
      images: content.images,
      links: content.links,
      embeds: content.embeds
    }
  }
}
