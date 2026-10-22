import type { z } from 'zod'
import type { newsResponseSchema } from '../schemas/news'

export type News = z.output<typeof newsResponseSchema>[number]
export type NewsSummary = Omit<News, 'body'>
export type NewsImage = NonNullable<News['image']>
