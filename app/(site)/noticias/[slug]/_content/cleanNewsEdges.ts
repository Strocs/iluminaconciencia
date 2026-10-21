import type { NewsNode } from './types'

const spacingTags = new Set(['br', 'p', 'span', 'div', 'section', 'article', 'header', 'footer'])

export function isNewsSpacing(node: NewsNode): boolean {
  if (node.type === 'text') return node.value.trim().length === 0
  return spacingTags.has(node.tag) && Object.keys(node.attributes).length === 0 && node.children.every(isNewsSpacing)
}

/** Only walk the two outer edges, never the boundaries of every subtree. */
export function cleanNewsEdges(nodes: NewsNode[]): void {
  function cleanEdge(children: NewsNode[], end: boolean): void {
    while (children.length > 0) {
      const index = end ? children.length - 1 : 0
      const node = children[index]
      if (isNewsSpacing(node)) {
        children.splice(index, 1)
        continue
      }
      if (node.type === 'text') {
        node.value = end ? node.value.trimEnd() : node.value.trimStart()
      } else if (!['pre', 'code'].includes(node.tag)) {
        cleanEdge(node.children, end)
      }
      break
    }
  }

  cleanEdge(nodes, false)
  cleanEdge(nodes, true)
}
