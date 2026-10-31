import { z } from 'zod'

// Add a tag here only after assigning it to cached data with cacheTag().
export const revalidationTags = ['noticias', 'articulos'] as const

export const revalidationRequestSchema = z.strictObject({
  tag: z.enum(revalidationTags)
})
