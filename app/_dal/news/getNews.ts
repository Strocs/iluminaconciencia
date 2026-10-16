import 'server-only'
import snapshot from './data/news.snapshot.json'
import { NewsSummary } from './types'

interface NewsSnapshot {
  items: NewsSummary[]
}

export async function getNews(): Promise<NewsSummary[]> {
  return (snapshot as NewsSnapshot).items.map(
    ({
      id,
      slug,
      title,
      description,
      descriptionIsTruncated,
      publishedAt,
      publishedAtLabel,
      datePrecision,
      image
    }) => ({
      id,
      slug,
      title,
      description,
      descriptionIsTruncated,
      publishedAt,
      publishedAtLabel,
      datePrecision,
      image
    })
  )
}
