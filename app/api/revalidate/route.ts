import { randomUUID } from 'node:crypto'
import { revalidateTag } from 'next/cache'
import { revalidationRequestSchema } from './_lib/request'

const maxBodyBytes = 1024

type ResponseCode =
  'TAG_INVALIDATED' | 'INVALID_REQUEST' | 'METHOD_NOT_ALLOWED' | 'UNSUPPORTED_MEDIA_TYPE' | 'INTERNAL_ERROR'

async function readPayload(request: Request): Promise<unknown> {
  if (!request.body) throw new Error('Missing request body')

  const reader = request.body.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let bytes = 0
  let text = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      bytes += value.byteLength
      if (bytes > maxBodyBytes) {
        await reader.cancel()
        throw new Error('Request body too large')
      }

      text += decoder.decode(value, { stream: true })
    }

    return JSON.parse(text + decoder.decode())
  } finally {
    reader.releaseLock()
  }
}

async function handleRequest(request: Request) {
  const method = request.method
  const requestId = randomUUID()
  const startedAt = performance.now()

  function respond(status: number, code: ResponseCode, tag?: string, error?: unknown) {
    const log = JSON.stringify({
      event:
        status === 200 ? 'revalidation.completed' : status === 500 ? 'revalidation.failed' : 'revalidation.rejected',
      requestId,
      method,
      status,
      code,
      ...(tag ? { tag } : {}),
      durationMs: Math.round(performance.now() - startedAt),
      ...(error instanceof Error ? { errorName: error.name, errorMessage: error.message } : {})
    })

    if (status === 500) console.error(log)
    else if (status === 200) console.info(log)
    else console.warn(log)

    return Response.json(
      { code, requestId, ...(tag ? { tag } : {}) },
      {
        status,
        headers: {
          'Cache-Control': 'no-store',
          'X-Request-Id': requestId,
          ...(status === 405 ? { Allow: 'POST' } : {})
        }
      }
    )
  }

  if (method !== 'POST') return respond(405, 'METHOD_NOT_ALLOWED')

  const mediaType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()
  if (mediaType !== 'application/json') return respond(415, 'UNSUPPORTED_MEDIA_TYPE')

  let payload: unknown
  try {
    payload = await readPayload(request)
  } catch {
    return respond(400, 'INVALID_REQUEST')
  }

  const result = revalidationRequestSchema.safeParse(payload)
  if (!result.success) return respond(400, 'INVALID_REQUEST')

  const { tag } = result.data
  try {
    revalidateTag(tag, { expire: 0 })
    return respond(200, 'TAG_INVALIDATED', tag)
  } catch (error) {
    return respond(500, 'INTERNAL_ERROR', tag, error)
  }
}

export const POST = handleRequest
export const GET = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest
export const HEAD = handleRequest
export const OPTIONS = handleRequest
