import type {
  HeroSkyAssetLoadFailure,
  HeroSkyAssetLoadRequest,
  HeroSkyAssetLoadResult,
  HeroSkyAssetLoadSuccess
} from '../contracts/hero-runtime'
import { decodePackedStarData } from './packed-star-data'

export type HeroSkyAssetFetch = (url: string, init?: RequestInit) => Promise<Response>

export interface LoadHeroSkyAssetsOptions {
  readonly fetch?: HeroSkyAssetFetch
}

export const isRootRelativeLocalUrl = (url: string): boolean =>
  url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')

const failure = (
  generation: number,
  code: HeroSkyAssetLoadFailure['error']['code'],
  cause?: unknown
): HeroSkyAssetLoadFailure => ({
  ok: false,
  generation,
  error: { code, ...(cause === undefined ? {} : { cause }) }
})

const ownershipFailure = (request: HeroSkyAssetLoadRequest): HeroSkyAssetLoadFailure | undefined => {
  if (request.signal?.aborted) return failure(request.generation, 'aborted')
  if (request.isCurrentGeneration && !request.isCurrentGeneration(request.generation)) {
    return failure(request.generation, 'stale')
  }
}

export async function loadHeroSkyAssets(
  request: HeroSkyAssetLoadRequest,
  options: LoadHeroSkyAssetsOptions = {}
): Promise<HeroSkyAssetLoadResult> {
  if (!isRootRelativeLocalUrl(request.packedDataUrl)) return failure(request.generation, 'invalid-url')

  const beforeFetch = ownershipFailure(request)
  if (beforeFetch) return beforeFetch

  let buffer: ArrayBuffer
  try {
    const response = await (options.fetch ?? fetch)(request.packedDataUrl, { signal: request.signal })
    if (!response.ok) return failure(request.generation, 'fetch-failed', response.status)
    buffer = await response.arrayBuffer()
  } catch (cause) {
    return failure(request.generation, request.signal?.aborted ? 'aborted' : 'fetch-failed', cause)
  }

  const afterFetch = ownershipFailure(request)
  if (afterFetch) return afterFetch

  try {
    const packedStarData = decodePackedStarData(buffer)
    const afterDecode = ownershipFailure(request)
    if (afterDecode) return afterDecode

    const result: HeroSkyAssetLoadSuccess = {
      ok: true,
      generation: request.generation,
      assets: { packedStarData }
    }
    return result
  } catch (cause) {
    return failure(request.generation, 'decode-failed', cause)
  }
}
