import { addProtocol } from 'maplibre-gl'

const protocol = 'chile-commune'
const assetDirectory = '/maps/chile-communes-9469f09/'

export function registerCommuneBoundaryProtocol() {
  addProtocol(protocol, async ({ url }, { signal }) => {
    const code = url.match(/^chile-commune:\/\/geometry\/(CL-[A-Z]{2})$/)?.[1]
    if (!code) throw new Error('Invalid commune boundary URL: ' + url)

    const response = await fetch(assetDirectory + code + '.geojson.gz', { signal, cache: 'force-cache' })
    if (!response.ok || !response.body) throw new Error('Could not load commune boundaries: ' + code)

    const decoded = response.body.pipeThrough(new DecompressionStream('gzip'), { signal })
    return { data: await new Response(decoded).json() }
  })
}

export function communeBoundaryUrl(code: string) {
  // Neither commune in the offshore selection shares a land boundary.
  return code === 'CL-VS-RN-JF' ? null : protocol + '://geometry/' + code
}
