import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const sourcePath = process.argv[2]
if (!sourcePath) throw new Error('Usage: node scripts/split-chile-regions.mjs <source.geojson>')

const source = readFileSync(sourcePath)
const checksum = createHash('sha256').update(source).digest('hex')
if (checksum !== '64ca160bd88f899ab5b2134733e1e191059fe20cdc9329dc189b40c1a9d194fa') {
  throw new Error('Source must match geoBoundaries CHL ADM1 simplified, revision 9469f09')
}

const codes = new Map([
  ['47653553B1207481020383', 'CL-AP'],
  ['47653553B97418467345315', 'CL-TA'],
  ['47653553B40993810137393', 'CL-AN'],
  ['47653553B71653813080592', 'CL-AT'],
  ['47653553B91907313612474', 'CL-CO'],
  ['47653553B5611469222723', 'CL-VS'],
  ['47653553B78904739401519', 'CL-RM'],
  ['47653553B66141875659978', 'CL-LI'],
  ['47653553B65340542415201', 'CL-ML'],
  ['47653553B32293817275864', 'CL-NB'],
  ['47653553B66835736668351', 'CL-BI'],
  ['47653553B84299910343297', 'CL-AR'],
  ['47653553B67595840047202', 'CL-LR'],
  ['47653553B69224850096491', 'CL-LL'],
  ['47653553B77266651052380', 'CL-AI'],
  ['47653553B86325292267162', 'CL-MA']
])

const output = new URL('../public/maps/chile-regions-9469f09/', import.meta.url)
mkdirSync(output, { recursive: true })

function writeRegion(code, shapeID, geometry) {
  const feature = { type: 'Feature', properties: { code, shapeID }, geometry }
  const gzip = gzipSync(JSON.stringify(feature), { level: 9 })
  writeFileSync(new URL(code + '.geojson.gz', output), gzip)
  console.log(`${code}: ${gzip.byteLength} bytes (gzip)`)
}

const islandAreas = [
  [-110, -28, -109, -27], // Rapa Nui and its nearby islets
  [-81, -34, -78, -33] // Juan Fernández archipelago
]

function isSelectedIsland([exteriorRing]) {
  return islandAreas.some(([west, south, east, north]) =>
    exteriorRing.every(([lng, lat]) => lng >= west && lng <= east && lat >= south && lat <= north)
  )
}

for (const {
  properties: { shapeID },
  geometry
} of JSON.parse(source).features) {
  const code = codes.get(shapeID)
  if (code !== 'CL-VS') {
    writeRegion(code, shapeID, geometry)
    continue
  }

  // In the pinned source the mainland polygon has the largest exterior ring.
  const polygons = geometry.coordinates
  const mainland = polygons.reduce((largest, polygon) => (polygon[0].length > largest[0].length ? polygon : largest))
  writeRegion(code, shapeID, { type: 'Polygon', coordinates: mainland })
  writeRegion('CL-VS-RN-JF', shapeID, {
    type: 'MultiPolygon',
    coordinates: polygons.filter(isSelectedIsland)
  })
}
