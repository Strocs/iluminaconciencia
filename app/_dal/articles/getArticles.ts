import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { getApiBaseUrl } from '../api'
import { articlesResponseSchema } from './schemas/articles'
import type { Article } from './types'

export async function getArticles(): Promise<Article[]> {
  'use cache'

  cacheLife({ stale: 300, revalidate: 604800, expire: 2592000 })
  cacheTag('articulos')

  const response = await fetch(new URL('articulos/?format=json', getApiBaseUrl()), {
    signal: AbortSignal.timeout(10000)
  })

  if (!response.ok) throw new Error(`Articulos API request failed: HTTP ${response.status}`)

  const data: unknown = await response.json()
  const articles = articlesResponseSchema.parse(data)

  return articles.toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}
