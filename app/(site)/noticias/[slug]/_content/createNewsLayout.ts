import type { NewsBlock, NewsElement, NewsNode, NewsSegment } from './types'

function hasContent(nodes: NewsNode[]): boolean {
  return nodes.some((node) =>
    node.type === 'text'
      ? node.value.trim().length > 0
      : ['img', 'iframe', 'video', 'audio', 'hr'].includes(node.tag) || hasContent(node.children)
  )
}

/** Project source blocks without mutating the canonical tree or repeating source IDs. */
export function createNewsLayout(segments: NewsSegment[], excludedImageUrl?: string) {
  const renderedAncestors = new Set<string>()

  function omitPrimaryImage(node: NewsNode): NewsNode | undefined {
    if (node.type === 'text') return node
    if (node.tag === 'img' && node.attributes.src === excludedImageUrl) return undefined
    const children = node.children.flatMap((child) => {
      const visible = omitPrimaryImage(child)
      return visible ? [visible] : []
    })
    if (children.every((child, index) => child === node.children[index]) && children.length === node.children.length) {
      return node
    }
    if (!hasContent(children)) return undefined
    return { ...node, children }
  }

  function project(blocks: NewsBlock[]): NewsNode[] {
    const roots: NewsNode[] = []
    for (const { node, ancestors } of blocks) {
      const visible = omitPrimaryImage(node)
      if (!visible) continue
      let siblings = roots
      for (const ancestor of ancestors) {
        let parent = siblings.at(-1)
        if (parent?.type !== 'element' || parent.id !== ancestor.id) {
          const attributes = { ...ancestor.attributes }
          if (renderedAncestors.has(ancestor.id)) delete attributes.id
          renderedAncestors.add(ancestor.id)
          parent = { ...ancestor, attributes, children: [] } satisfies NewsElement
          siblings.push(parent)
        }
        siblings = parent.children
      }
      siblings.push(visible)
    }
    return roots
  }

  const firstNarrative = segments.findIndex((segment) =>
    segment.content.some(({ node }) => {
      const visible = omitPrimaryImage(node)
      return visible ? hasContent([visible]) : false
    })
  )
  const openingBlocks = firstNarrative > 0 ? segments.slice(0, firstNarrative).flatMap((segment) => segment.source) : []
  const readingSegments = firstNarrative > 0 ? segments.slice(firstNarrative) : segments

  return readingSegments.map((segment, index) => {
    const opening = project(index === 0 ? openingBlocks : [])
    const mediaIds = new Set(segment.media.map(({ node }) => node.id))
    const firstMedia = segment.source.findIndex(({ node }) => mediaIds.has(node.id))
    const lastMedia = segment.source.findLastIndex(({ node }) => mediaIds.has(node.id))
    const before = project(firstMedia < 0 ? segment.source : segment.source.slice(0, firstMedia))
    const media = project(firstMedia < 0 ? [] : segment.source.slice(firstMedia, lastMedia + 1))
    const after = project(firstMedia < 0 ? [] : segment.source.slice(lastMedia + 1))

    return {
      id: index === 0 && openingBlocks.length > 0 ? openingBlocks[0].node.id : segment.source[0].node.id,
      opening,
      hasOpening: hasContent(opening),
      before,
      media,
      after,
      hasBefore: hasContent(before),
      hasMedia: hasContent(media),
      hasAfter: hasContent(after)
    }
  })
}
