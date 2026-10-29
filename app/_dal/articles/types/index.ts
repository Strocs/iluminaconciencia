import type { z } from 'zod'
import type { articlesResponseSchema } from '../schemas/articles'

export interface ArticleImage {
  url: string
  alt: string | null
}

export type Article = z.output<typeof articlesResponseSchema>[number]
