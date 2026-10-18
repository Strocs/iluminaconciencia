import { Fragment } from 'react'
import { parseDocument } from 'htmlparser2'
import { getNewsContentUrl, getNewsEmbedUrl, getNewsMediaUrl } from '../_utils/newsContentUrls'

type HtmlNode = ReturnType<typeof parseDocument>['children'][number]
type HtmlElement = Extract<HtmlNode, { attribs: Record<string, string> }>

const textElements = {
  p: 'p',
  h1: 'h2',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  strong: 'strong',
  b: 'strong',
  em: 'em',
  i: 'em',
  u: 'u',
  s: 's',
  sub: 'sub',
  sup: 'sup',
  ul: 'ul',
  ol: 'ol',
  li: 'li',
  blockquote: 'blockquote',
  figure: 'figure',
  figcaption: 'figcaption',
  time: 'time',
  span: 'span'
} as const

export function NewsHtml({ nodes, baseUrl }: { nodes: HtmlNode[]; baseUrl: string }) {
  const sections: HtmlNode[][] = []
  let current: HtmlNode[] = []
  let hasHeadings = false

  for (const node of nodes) {
    const startsSection = node.type === 'tag' && /^(h[1-6]|header|hgroup)$/.test(node.name)
    if (startsSection) {
      hasHeadings = true
      if (current.some((child) => child.type !== 'text' || child.data.trim().length > 0)) sections.push(current)
      current = []
    }
    current.push(node)
  }
  if (current.length > 0) sections.push(current)

  if (!hasHeadings) return <NewsHtmlNodes nodes={nodes} baseUrl={baseUrl} />

  return sections.map((section, index) => (
    <section key={index} className="space-y-2">
      <NewsHtmlNodes nodes={section} baseUrl={baseUrl} />
    </section>
  ))
}

function NewsHtmlNodes({ nodes, baseUrl }: { nodes: HtmlNode[]; baseUrl: string }) {
  return nodes.map((node, index) => {
    if (node.type === 'text') return node.data
    if (node.type !== 'tag') return null
    return <NewsHtmlElement key={index} node={node} baseUrl={baseUrl} />
  })
}

function NewsHtmlElement({ node, baseUrl }: { node: HtmlElement; baseUrl: string }) {
  const children = <NewsHtml nodes={node.children} baseUrl={baseUrl} />
  const attributes = node.attribs

  switch (node.name) {
    case 'p': {
      const hasOnlySpacing = node.children.every(
        (child) =>
          (child.type === 'text' && child.data.trim().length === 0) || (child.type === 'tag' && child.name === 'br')
      )
      return hasOnlySpacing ? null : <p>{children}</p>
    }
    case 'a': {
      const href = getNewsContentUrl(attributes.href, baseUrl)
      if (!href) return children
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    }
    case 'img': {
      const src = getNewsMediaUrl(attributes.src || attributes['data-src'], baseUrl)
      if (!src) return null
      const sourceWidth = Number(attributes.width)
      const sourceHeight = Number(attributes.height)
      const hasWidth = Number.isFinite(sourceWidth) && sourceWidth > 0
      const hasHeight = Number.isFinite(sourceHeight) && sourceHeight > 0
      const width = hasWidth ? sourceWidth : hasHeight ? Math.max(1, Math.round((sourceHeight * 16) / 9)) : 1200
      const height = hasHeight ? sourceHeight : Math.max(1, Math.round((width * 9) / 16))
      return (
        // eslint-disable-next-line @next/next/no-img-element -- Keep native remote images, with a 16:9 fallback for incomplete source dimensions.
        <img
          src={src}
          alt={attributes.alt ?? ''}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="h-auto max-w-full break-inside-avoid rounded border border-border object-contain"
        />
      )
    }
    case 'iframe': {
      const src = getNewsEmbedUrl(attributes.src, baseUrl)
      if (!src) return null
      return (
        <iframe
          src={src}
          title={attributes.title || 'Video relacionado con la noticia'}
          className="aspect-video w-full break-inside-avoid rounded border border-border"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )
    }
    case 'video':
    case 'audio': {
      const src = getNewsMediaUrl(attributes.src, baseUrl)
      const Media = node.name
      return (
        <Media
          src={src}
          controls
          preload="metadata"
          className="w-full break-inside-avoid"
          {...(node.name === 'video' ? { poster: getNewsMediaUrl(attributes.poster, baseUrl) } : {})}
        >
          {children}
        </Media>
      )
    }
    case 'source': {
      const src = getNewsMediaUrl(attributes.src, baseUrl)
      return src ? <source src={src} /> : null
    }
    case 'br':
      return <br />
    case 'hr':
      return <hr className="border-border" />
    case 'script':
    case 'style':
    case 'template':
    case 'object':
    case 'embed':
    case 'svg':
    case 'math':
    case 'form':
      return null
  }

  if (!Object.hasOwn(textElements, node.name)) return <Fragment>{children}</Fragment>
  const Tag = textElements[node.name as keyof typeof textElements]

  return <Tag>{children}</Tag>
}
