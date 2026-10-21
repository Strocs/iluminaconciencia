export type NewsNode = NewsText | NewsElement

export interface NewsText {
  type: 'text'
  id: string
  value: string
}

export interface NewsElement {
  type: 'element'
  id: string
  tag: string
  attributes: Record<string, string>
  children: NewsNode[]
}

export interface NewsBlock {
  node: NewsNode
  ancestors: NewsElement[]
}

export interface NewsSegment {
  content: NewsBlock[]
  media: NewsBlock[]
  /** Original reading order, including text following the final resource. */
  source: NewsBlock[]
}

export interface NewsContentTree {
  nodes: NewsNode[]
  segments: NewsSegment[]
}
