import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { getApiBaseUrl } from '../api'
import { newsResponseSchema } from './schemas/news'
import type { News } from './types'

export async function getNews(): Promise<News[]> {
  'use cache'

  cacheLife({ stale: 300, revalidate: 604800, expire: 2592000 })
  cacheTag('noticias')

  const response = await fetch(new URL('noticias/?format=json', getApiBaseUrl()), {
    signal: AbortSignal.timeout(10000)
  })

  if (!response.ok) throw new Error(`Noticias API request failed: HTTP ${response.status}`)

  const data: unknown = await response.json()
  if (Array.isArray(data) && data.length === 0) return []

  const news = newsResponseSchema.parse(data)

  return news.toSorted((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
}
