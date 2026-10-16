import 'server-only'
import snapshot from './data/articles.snapshot.json'
import { Article } from './types'

interface ArticleSnapshotItem extends Article {
  sourceUrl: string
  sourcePosition: number
}

interface ArticleSnapshot {
  items: ArticleSnapshotItem[]
}

export async function getArticles(): Promise<Article[]> {
  return (snapshot as ArticleSnapshot).items.map(
    ({ id, title, publishedAt, publishedAtLabel, datePrecision, resourceUrl, image }) => ({
      id,
      title,
      publishedAt,
      publishedAtLabel,
      datePrecision,
      resourceUrl,
      image
    })
  )
}
