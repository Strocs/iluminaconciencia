import { z } from 'zod'
import { formatMonthYear } from '@/_utils/formatMonthYear'

const articleApiItemSchema = z.object({
  id: z.int().positive(),
  titulo: z.string().refine((value) => value.trim().length > 0),
  fecha: z.iso.date(),
  archivo: z.httpUrl()
})

export const articlesResponseSchema = z.array(articleApiItemSchema).transform((items) =>
  items.map((item) => ({
    id: item.id,
    title: item.titulo,
    publishedAt: item.fecha,
    publishedAtLabel: formatMonthYear(item.fecha),
    resourceUrl: item.archivo,
    image: null
  }))
)
