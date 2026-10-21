import { cleanNewsEdges, isNewsSpacing } from './cleanNewsEdges'
import { sanitizeNewsHtml } from './sanitizeNewsHtml'
import type { NewsBlock, NewsContentTree, NewsElement, NewsNode, NewsSegment } from './types'

const mediaTags = new Set(['img', 'iframe', 'video', 'audio'])
const flowContainers = new Set(['div', 'section', 'article', 'main', 'aside', 'header', 'footer', 'nav', 'hgroup'])

function isMedia(node: NewsNode): boolean {
  if (node.type === 'text') return false
  if (mediaTags.has(node.tag)) return true
  if (node.tag === 'figure' || node.tag === 'picture') {
    const containsMedia = (child: NewsNode): boolean =>
      child.type === 'element' && (mediaTags.has(child.tag) || child.children.some(containsMedia))
    return node.children.some(containsMedia)
  }
  // Never split a paragraph/link that mixes narrative text with an image.
  return (
    node.children.some(isMedia) &&
    node.children.every(
      (child) => isNewsSpacing(child) || isMedia(child) || (child.type === 'element' && child.tag === 'figcaption')
    )
  )
}

function collectBlocks(nodes: NewsNode[], ancestors: NewsElement[] = []): NewsBlock[] {
  return nodes.flatMap((node): NewsBlock[] => {
    if (node.type === 'element' && flowContainers.has(node.tag) && !isMedia(node) && node.children.length > 0) {
      return collectBlocks(node.children, [...ancestors, node])
    }
    return [{ node, ancestors }]
  })
}

/** Media closes the preceding text run; the source tree itself is never reordered. */
export function parseNewsContent(sourceHtml: string, baseUrl: string): NewsContentTree {
  const nodes = sanitizeNewsHtml(sourceHtml, baseUrl)
  cleanNewsEdges(nodes)
  const segments: NewsSegment[] = []
  let pending: NewsBlock[] = []

  for (const block of collectBlocks(nodes)) {
    if (!isMedia(block.node)) {
      pending.push(block)
      continue
    }
    const previous = segments.at(-1)
    if (previous && pending.every(({ node }) => isNewsSpacing(node))) {
      previous.content.push(...pending)
      previous.media.push(block)
      previous.source.push(...pending, block)
    } else {
      segments.push({ content: pending, media: [block], source: [...pending, block] })
    }
    pending = []
  }

  if (pending.length > 0) {
    const previous = segments.at(-1)
    if (previous) {
      previous.content.push(...pending)
      previous.source.push(...pending)
    } else {
      segments.push({ content: pending, media: [], source: [...pending] })
    }
  }

  return { nodes, segments }
}
