export interface ArticleImage {
  url: string
  alt: string | null
}

export interface Article {
  id: string
  title: string
  publishedAt: string
  publishedAtLabel: string
  datePrecision: 'month' | 'year'
  resourceUrl: string
  image: ArticleImage | null
}
