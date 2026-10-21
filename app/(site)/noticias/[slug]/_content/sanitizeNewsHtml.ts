import { parseDocument } from 'htmlparser2'
import { getNewsContentUrl, getNewsEmbedUrl, getNewsMediaUrl } from '../_utils/newsContentUrls'
import type { NewsNode } from './types'

type HtmlNode = ReturnType<typeof parseDocument>['children'][number]

const allowedTags = new Set(
  'a abbr address article aside audio b bdi bdo blockquote br caption cite code col colgroup dd del details dfn div dl dt em figcaption figure footer h1 h2 h3 h4 h5 h6 header hgroup hr i img ins kbd li main mark nav ol p picture pre q rp rt ruby s samp section small source span strong sub summary sup table tbody td tfoot th thead time tr track u ul var video wbr iframe'.split(
    ' '
  )
)
const discardedTags = new Set(
  'script style template object embed svg math form input button textarea select option link meta base noscript'.split(
    ' '
  )
)
const commonAttributes = new Set([
  'id',
  'title',
  'lang',
  'dir',
  'role',
  'aria-label',
  'aria-labelledby',
  'aria-describedby'
])
const tagAttributes: Record<string, string[]> = {
  img: ['alt', 'width', 'height'],
  iframe: ['width', 'height'],
  video: ['width', 'height'],
  audio: [],
  source: ['type', 'media'],
  track: ['kind', 'srclang', 'label', 'default'],
  ol: ['start', 'reversed', 'type'],
  li: ['value'],
  td: ['colspan', 'rowspan', 'headers'],
  th: ['colspan', 'rowspan', 'headers', 'scope', 'abbr'],
  col: ['span'],
  colgroup: ['span'],
  time: ['datetime'],
  del: ['datetime'],
  ins: ['datetime'],
  details: ['open']
}

export function sanitizeNewsHtml(sourceHtml: string, baseUrl: string): NewsNode[] {
  function sanitize(nodes: HtmlNode[], parentId = 'root'): NewsNode[] {
    return nodes.flatMap((node, index): NewsNode[] => {
      const id = `${parentId}.${index}`
      if (node.type === 'text') return [{ type: 'text', id, value: node.data }]
      // htmlparser2 distinguishes executable script/style nodes from ordinary tags.
      if (node.type !== 'tag' || discardedTags.has(node.name)) return []
      const children = sanitize(node.children, id)
      if (!allowedTags.has(node.name)) return children

      const attributes: Record<string, string> = {}
      for (const [name, value] of Object.entries(node.attribs)) {
        if (commonAttributes.has(name) || tagAttributes[node.name]?.includes(name)) attributes[name] = value
      }
      if (node.name === 'a') {
        const href = getNewsContentUrl(node.attribs.href, baseUrl)
        if (href) attributes.href = href
        if (['_blank', '_self'].includes(node.attribs.target)) attributes.target = node.attribs.target
        if (attributes.target === '_blank') attributes.rel = 'noopener noreferrer'
      }
      if (['blockquote', 'q', 'del', 'ins'].includes(node.name)) {
        const cite = getNewsContentUrl(node.attribs.cite, baseUrl)
        if (cite) attributes.cite = cite
      }
      if (['img', 'iframe', 'video', 'audio', 'source', 'track'].includes(node.name)) {
        const resolve = node.name === 'iframe' ? getNewsEmbedUrl : getNewsMediaUrl
        const src = resolve(node.attribs.src || (node.name === 'img' ? node.attribs['data-src'] : undefined), baseUrl)
        if (src) attributes.src = src
        if (!src && ['img', 'iframe', 'source', 'track'].includes(node.name)) return []
      }
      if (node.name === 'video') {
        const poster = getNewsMediaUrl(node.attribs.poster, baseUrl)
        if (poster) attributes.poster = poster
      }
      return [{ type: 'element', id, tag: node.name, attributes, children }]
    })
  }

  return sanitize(parseDocument(sourceHtml).children)
}
