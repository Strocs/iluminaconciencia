import 'server-only'

export function getApiBaseUrl(): URL {
  const value = process.env.API_BASE_URL
  if (!value) throw new Error('API_BASE_URL is required')

  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('API_BASE_URL must use HTTP or HTTPS')
  }
  if (!url.pathname.endsWith('/')) url.pathname += '/'
  return url
}
