export interface NewsImage {
  url: string
  alt: string | null
}

export interface NewsContentLink {
  url: string
  text: string | null
}

export interface NewsEmbed {
  url: string
  title: string | null
}

export interface NewsSummary {
  id: string
  slug: string
  title: string
  description: string
  descriptionIsTruncated: boolean
  publishedAt: string
  publishedAtLabel: string
  datePrecision: 'minute'
  image: NewsImage | null
}

export interface News extends NewsSummary {
  sourceUrl: string
  content: {
    sourceHtml: string
    text: string
    images: NewsImage[]
    links: NewsContentLink[]
    embeds: NewsEmbed[]
  }
}
