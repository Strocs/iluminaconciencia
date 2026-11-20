import { addProtocol } from 'maplibre-gl'

const protocol = 'chile-region'
const assetDirectory = '/maps/chile-regions-9469f09/'

export function registerRegionBoundaryProtocol() {
  addProtocol(protocol, async ({ url }, { signal }) => {
    const code = url.match(/^chile-region:\/\/geometry\/(CL-[A-Z]{2}|CL-VS-RN-JF)$/)?.[1]
    if (!code) throw new Error('Invalid regional boundary URL: ' + url)

    // These versioned files are gzip payloads, independent of HTTP compression settings.
    const response = await fetch(assetDirectory + code + '.geojson.gz', { signal, cache: 'force-cache' })
    if (!response.ok || !response.body) throw new Error('Could not load regional boundary: ' + code)

    const decoded = response.body.pipeThrough(new DecompressionStream('gzip'), { signal })
    return { data: await new Response(decoded).json() }
  })
}

export function regionBoundaryUrl(code: string) {
  return protocol + '://geometry/' + code
}
