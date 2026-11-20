import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { gunzipSync, gzipSync } from 'node:zlib'

const [sourcePath, mode, ...extra] = process.argv.slice(2)
if (!sourcePath || (mode !== undefined && mode !== '--check') || extra.length) {
  throw new Error('Usage: node scripts/build-chile-commune-boundaries.mjs <source.geojson> [--check]')
}
const check = mode === '--check'

const source = readFileSync(sourcePath)
const checksum = createHash('sha256').update(source).digest('hex')
if (checksum !== 'f6852723bc6d44d4813086fe9df750e7228e1925a72284e3d2b65ed44e2aa99a') {
  throw new Error('Source must match geoBoundaries CHL ADM3 simplified, revision 9469f09')
}

const regionsDirectory = new URL('../public/maps/chile-regions-9469f09/', import.meta.url)
const output = new URL('../public/maps/chile-communes-9469f09/', import.meta.url)
const islands = 'CL-VS-RN-JF'
const polygons = ({ type, coordinates }) => (type === 'Polygon' ? [coordinates] : coordinates)

// Index the ray-casting candidates by latitude to avoid scanning ADM1 coastlines per vertex.
function indexRing(ring) {
  const bins = new Map()
  let west = Infinity
  let east = -Infinity
  const bin = (lat) => Math.floor(lat * 10)
  for (let i = 1; i < ring.length; i++) {
    const [a, b] = [ring[i - 1], ring[i]]
    west = Math.min(west, a[0])
    east = Math.max(east, a[0])
    for (let y = bin(Math.min(a[1], b[1])); y <= bin(Math.max(a[1], b[1])); y++) {
      if (!bins.has(y)) bins.set(y, [])
      bins.get(y).push([a, b])
    }
  }
  return ([lng, lat]) => {
    if (lng < west || lng > east) return false
    let inside = false
    for (const [[ax, ay], [bx, by]] of bins.get(bin(lat)) ?? []) {
      if ((ay > lat) !== (by > lat) && lng < ax + ((bx - ax) * (lat - ay)) / (by - ay)) inside = !inside
    }
    return inside
  }
}

const regions = readdirSync(regionsDirectory)
  .filter((name) => name.endsWith('.geojson.gz'))
  .sort()
  .map((name) => {
    const { properties: { code }, geometry } = JSON.parse(gunzipSync(readFileSync(new URL(name, regionsDirectory))))
    const tests = polygons(geometry).map(([outer, ...holes]) => ({
      outer: indexRing(outer),
      holes: holes.map(indexRing)
    }))
    return {
      code,
      contains: (point) => tests.some(({ outer, holes }) => outer(point) && !holes.some((hole) => hole(point))),
      count: 0,
      lines: [],
      edgeCount: 0
    }
  })

const communes = JSON.parse(source).features
const edges = new Map()
let minimumSupport = 1
let minimumLead = 1
for (const { properties: { shapeID, shapeName }, geometry } of communes) {
  const parts = polygons(geometry)
  const vertices = parts.flatMap(([outer]) => outer.slice(0, -1))
  const ranked = regions
    .map((region) => ({ region, score: vertices.filter(region.contains).length / vertices.length }))
    .sort((a, b) => b.score - a.score)
  const [best, next] = ranked
  const lead = best.score - next.score
  // ADM3 includes additional offshore islands not framed by the ADM1 map option.
  if (best.region.code === islands && best.score > 0 && vertices.every(([lng]) => lng < -78)) {
    console.log(`${shapeName}: ${islands} (offshore, ${(best.score * 100).toFixed(1)}% inside ADM1 selection)`)
  } else {
    if (best.score < 0.4 || lead < 0.25) {
      throw new Error(`Unclear regional assignment for ${shapeName}: ${best.region.code} (${best.score}), ${next.region.code} (${next.score})`)
    }
    minimumSupport = Math.min(minimumSupport, best.score)
    minimumLead = Math.min(minimumLead, lead)
  }
  best.region.count++

  for (const polygon of parts) {
    for (const ring of polygon) {
      for (let i = 1; i < ring.length; i++) {
        const [a, b] = [ring[i - 1].join(','), ring[i].join(',')].sort()
        if (a === b) continue
        const key = a + '|' + b
        if (!edges.has(key)) edges.set(key, new Map())
        edges.get(key).set(shapeID, best.region)
      }
    }
  }
}

// Keep only exact input segments shared by two distinct communes in the same region.
const pairs = new Map()
let crossRegion = 0
for (const [edge, owners] of edges) {
  if (owners.size === 1) continue
  if (owners.size !== 2) throw new Error('Non-manifold commune edge: ' + edge)
  const [region, other] = owners.values()
  if (region !== other) {
    crossRegion++
    continue
  }
  if (region.code === islands) throw new Error('Unexpected shared edge for the island selection')
  const key = [...owners.keys()].sort().join('|')
  if (!pairs.has(key)) pairs.set(key, { region, segments: [] })
  pairs.get(key).segments.push(edge.split('|'))
  region.edgeCount++
}

// Join existing segments along each commune pair so the dash pattern spans vertices.
let fragmentedPairs = 0
for (const { region, segments } of pairs.values()) {
  const neighbors = new Map()
  for (const [a, b] of segments) {
    if (!neighbors.has(a)) neighbors.set(a, new Set())
    if (!neighbors.has(b)) neighbors.set(b, new Set())
    neighbors.get(a).add(b)
    neighbors.get(b).add(a)
  }
  let paths = 0
  function trace(start, next) {
    const path = [start]
    let end = start
    while (next !== undefined) {
      neighbors.get(end).delete(next)
      neighbors.get(next).delete(end)
      path.push(next)
      end = next
      const remaining = neighbors.get(end)
      next = end !== start && remaining.size === 1 ? remaining.values().next().value : undefined
    }
    paths++
    region.lines.push(path.map((point) => point.split(',').map(Number)))
  }
  const junctions = [...neighbors].filter(([, adjacent]) => adjacent.size !== 2)
  for (const [point, adjacent] of [...junctions, ...neighbors]) {
    for (const next of adjacent) trace(point, next)
  }
  if (paths > 1) fragmentedPairs++
}

if (regions.length !== 17 || communes.length !== 345 || regions.some(({ code, count, lines }) => code === islands ? count !== 2 : !lines.length)) {
  throw new Error('Unexpected dataset coverage')
}

if (check) {
  const expected = regions.filter(({ code }) => code !== islands).map(({ code }) => code + '.geojson.gz').sort()
  const actual = readdirSync(output).filter((name) => name.endsWith('.geojson.gz')).sort()
  if (expected.join() !== actual.join()) throw new Error('Unexpected commune boundary files')
} else {
  mkdirSync(output, { recursive: true })
}
for (const { code, count, lines, edgeCount } of regions) {
  if (code === islands) {
    console.log(`${code}: ${count} communes, no internal edges`)
    continue
  }
  const feature = { type: 'Feature', properties: { code }, geometry: { type: 'MultiLineString', coordinates: lines } }
  const json = JSON.stringify(feature)
  const gzip = gzipSync(json, { level: 9 })
  const path = new URL(code + '.geojson.gz', output)
  if (check) {
    if (gunzipSync(readFileSync(path)).toString() !== json) throw new Error('Unexpected commune geometry: ' + code)
  } else {
    writeFileSync(path, gzip)
  }
  console.log(`${code}: ${count} communes, ${edgeCount} edges, ${lines.length} lines, ${gzip.byteLength} bytes (gzip)`)
}
console.log(`Minimum assignment support ${minimumSupport.toFixed(3)}, lead ${minimumLead.toFixed(3)}; ${crossRegion} cross-region edges excluded; ${fragmentedPairs}/${pairs.size} pairs have multiple lines`)
