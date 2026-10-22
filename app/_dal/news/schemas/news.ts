import { z } from 'zod'
import { createSlug } from '@/_utils/createSlug'

const newsApiItemSchema = z.object({
  titulo: z.string().refine((value) => value.trim().length > 0),
  resumen: z.string(),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/)
    .refine((value) => Number.isFinite(Date.parse(value))),
  cuerpo: z.string(),
  imagen: z.url().nullable(),
  mostrar: z.boolean(),
  mostrar_principal: z.boolean()
})

export const newsResponseSchema = z.array(newsApiItemSchema).transform((items, ctx) => {
  const nextSuffixBySlug = new Map<string, number>()

  return items.flatMap((item, index) => {
    if (!item.mostrar) return []

    const titleSlug = createSlug(item.titulo)

    if (!titleSlug) {
      ctx.addIssue({
        code: 'custom',
        path: [index, 'titulo'],
        message: 'Noticias title must produce a non-empty slug'
      })
      return []
    }

    const slug = findAvailableSlug(titleSlug, nextSuffixBySlug)

    return [
      {
        id: Date.parse(item.fecha),
        slug,
        title: item.titulo,
        description: item.resumen,
        publishedAt: item.fecha,
        image: item.imagen ? { url: item.imagen, alt: item.titulo } : null,
        body: item.cuerpo
      }
    ]
  })
})

function findAvailableSlug(titleSlug: string, nextSuffixBySlug: Map<string, number>) {
  let slug = titleSlug
  let nextSuffix = nextSuffixBySlug.get(titleSlug) ?? 2

  while (nextSuffixBySlug.has(slug)) {
    slug = `${titleSlug}-${nextSuffix}`
    nextSuffix += 1
  }

  nextSuffixBySlug.set(titleSlug, nextSuffix)
  nextSuffixBySlug.set(slug, 2)

  return slug
}
