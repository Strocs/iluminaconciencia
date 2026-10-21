import { createElement } from 'react'
import type { NewsNode } from '../_content/types'

const attributeNames: Record<string, string> = {
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  datetime: 'dateTime',
  srclang: 'srcLang'
}
const booleanAttributes = new Set(['open', 'reversed', 'default'])
const voidElements = new Set(['br', 'hr', 'img', 'source', 'track', 'wbr', 'col'])

/** Render only the sanitized tree; semantic interpretation belongs to the parser. */
export function NewsHtml({ nodes, excludedImageUrl }: { nodes: NewsNode[]; excludedImageUrl?: string }) {
  return nodes.map((node) => {
    if (node.type === 'text') return node.value
    if (node.tag === 'img' && node.attributes.src === excludedImageUrl) return null

    const attributes: Record<string, unknown> = { key: node.id }
    for (const [name, value] of Object.entries(node.attributes)) {
      attributes[attributeNames[name] ?? name] = booleanAttributes.has(name) ? true : value
    }
    switch (node.tag) {
      case 'a':
        if (node.attributes.href) Object.assign(attributes, { target: '_blank', rel: 'noopener noreferrer' })
        break
      case 'img': {
        const sourceWidth = Number(node.attributes.width)
        const sourceHeight = Number(node.attributes.height)
        const hasWidth = Number.isFinite(sourceWidth) && sourceWidth > 0
        const hasHeight = Number.isFinite(sourceHeight) && sourceHeight > 0
        const width = hasWidth ? sourceWidth : hasHeight ? Math.max(1, Math.round((sourceHeight * 16) / 9)) : 1200
        const height = hasHeight ? sourceHeight : Math.max(1, Math.round((width * 9) / 16))
        Object.assign(attributes, {
          alt: node.attributes.alt ?? '',
          width,
          height,
          loading: 'lazy',
          decoding: 'async',
          className: 'h-auto max-w-full break-inside-avoid rounded border border-border object-contain'
        })
        break
      }
      case 'iframe':
        Object.assign(attributes, {
          // Keep source dimensions in the tree, but preserve responsive embed sizing.
          width: undefined,
          height: undefined,
          title: node.attributes.title || 'Video relacionado con la noticia',
          loading: 'lazy',
          referrerPolicy: 'strict-origin-when-cross-origin',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
          allowFullScreen: true,
          className: 'aspect-video w-full break-inside-avoid rounded border border-border'
        })
        break
      case 'video':
      case 'audio':
        Object.assign(attributes, {
          width: undefined,
          height: undefined,
          controls: true,
          preload: 'metadata',
          className: 'w-full break-inside-avoid'
        })
        break
      case 'hr':
        attributes.className = 'border-border'
        break
    }

    if (voidElements.has(node.tag)) return createElement(node.tag, attributes)
    return createElement(node.tag, attributes, <NewsHtml nodes={node.children} excludedImageUrl={excludedImageUrl} />)
  })
}
