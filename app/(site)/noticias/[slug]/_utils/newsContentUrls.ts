export function getNewsContentUrl(value: string | undefined, baseUrl: string): string | undefined {
  if (!value?.trim()) return undefined

  const input = value.trim()
  // Some archived links have a hostname but omit the protocol.
  const normalized = /^[\w-]+(?:\.[\w-]+)+(?:[/?#]|$)/.test(input) ? `https://${input}` : input

  try {
    const url = new URL(normalized, baseUrl)
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) return undefined
    return url.href
  } catch {
    return undefined
  }
}

export function getNewsMediaUrl(value: string | undefined, baseUrl: string): string | undefined {
  const url = getNewsContentUrl(value, baseUrl)
  return url && ['http:', 'https:'].includes(new URL(url).protocol) ? url : undefined
}

export function getNewsEmbedUrl(value: string | undefined, baseUrl: string): string | undefined {
  const valueUrl = getNewsMediaUrl(value, baseUrl)
  if (!valueUrl) return undefined

  const url = new URL(valueUrl)
  return url.protocol === 'https:' && url.hostname === 'www.youtube.com' && url.pathname.startsWith('/embed/')
    ? url.href
    : undefined
}
