/**
 * Generate the hero sky fallback SVG (mirrored, 16:9 crop).
 *
 * Projects the south catalog through the stereographic tangent at RA 9.75h /
 * Dec −70°, mirrors projectedX (east-left), crops to 16:9, and emits ~60
 * star circles in a 1600×900 viewBox grouped by B–V color temperature.
 *
 * Usage: node scripts/sky-fallback-svg.mjs <catalog.gz> [output.svg]
 *
 * If output.svg is omitted, writes to public/images/hero/hero-sky-fallback.svg.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

const DEG_TO_RAD = Math.PI / 180

/** Stereographic tangent point: RA 9.75h, Dec −70° (first-person south view). */
const RA0 = 9.75 * 15 * DEG_TO_RAD
const DEC0 = -70 * DEG_TO_RAD
const SIN_DEC0 = Math.sin(DEC0)
const COS_DEC0 = Math.cos(DEC0)

const WINDOW = { raMin: 0, raMax: 24, decMin: -90, decMax: -15, magMax: 6.5 }

const SVG_WIDTH = 1600
const SVG_HEIGHT = 900
const ASPECT = SVG_WIDTH / SVG_HEIGHT // 16:9

function parseCatalog(gzPath) {
  const text = gunzipSync(readFileSync(gzPath)).toString('utf8')
  const lines = text.split(/\r?\n/).filter((line) => line.length >= 114)
  return lines.map((line) => ({
    ra: parseInt(line.slice(75, 77), 10) + parseInt(line.slice(77, 79), 10) / 60 + parseFloat(line.slice(79, 83)) / 3600,
    dec: (line[83] === '-' ? -1 : 1) * (parseInt(line.slice(84, 86), 10) + parseInt(line.slice(86, 88), 10) / 60 + parseInt(line.slice(88, 90), 10) / 3600),
    mag: parseFloat(line.slice(102, 107)),
    bv: parseFloat(line.slice(109, 114))
  }))
}

function inWindow(record) {
  return (
    record.ra >= WINDOW.raMin && record.ra < WINDOW.raMax &&
    record.dec >= WINDOW.decMin && record.dec <= WINDOW.decMax &&
    record.mag <= WINDOW.magMax
  )
}

function project(record) {
  const ra = record.ra * 15 * DEG_TO_RAD
  const dec = record.dec * DEG_TO_RAD
  const sinDec = Math.sin(dec)
  const cosDec = Math.cos(dec)
  const deltaRa = ra - RA0
  const cosC = SIN_DEC0 * sinDec + COS_DEC0 * cosDec * Math.cos(deltaRa)
  const scale = 2 / (1 + cosC)
  let x = scale * cosDec * Math.sin(deltaRa)
  const y = scale * (COS_DEC0 * sinDec - SIN_DEC0 * cosDec * Math.cos(deltaRa))
  // Mirror: negate projectedX (east-left convention)
  x = -x
  return { x, y }
}

/** Classify B–V into a color group for SVG grouping. */
function bvGroup(bv) {
  if (bv < 0) return 'blue'   // blue-white stars
  if (bv < 0.5) return 'white' // white to yellow-white
  return 'warm'                 // yellow to red
}

const COLOR_MAP = {
  blue: { fill: '#cce7ff', opacity: '0.75' },
  white: { fill: '#ffffff', opacity: '0.9' },
  warm: { fill: '#ffe3a0', opacity: '0.8' }
}

const [catalogPath, outputPath] = process.argv.slice(2)
if (!catalogPath) {
  console.error('Usage: node scripts/sky-fallback-svg.mjs <catalog.gz> [output.svg]')
  process.exit(2)
}

const outPath = outputPath || 'public/images/hero/hero-sky-fallback.svg'

const records = parseCatalog(catalogPath).filter(inWindow)
console.error(`Parsed ${records.length} records in window`)

// Project all stars
const stars = records.map((r) => {
  const p = project(r)
  return { ...r, px: p.x, py: p.y }
})

// Compute bounding box
let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
for (const s of stars) {
  if (s.px < xMin) xMin = s.px
  if (s.px > xMax) xMax = s.px
  if (s.py < yMin) yMin = s.py
  if (s.py > yMax) yMax = s.py
}

const spanX = xMax - xMin
const spanY = yMax - yMin

// Crop to 16:9: find the largest 16:9 rect inside the bbox
let cropW, cropH, cropX0, cropY0

if (spanX / spanY > ASPECT) {
  // Bbox is wider than 16:9 → fit height, center x
  cropH = spanY
  cropW = cropH * ASPECT
  cropX0 = xMin + (spanX - cropW) / 2
  cropY0 = yMin
} else {
  // Bbox is taller than 16:9 → fit width, center y
  cropW = spanX
  cropH = cropW / ASPECT
  cropX0 = xMin
  cropY0 = yMin + (spanY - cropH) / 2
}

// Select ~60 brightest stars for the fallback
const sorted = [...stars].sort((a, b) => a.mag - b.mag)
const selected = sorted.slice(0, 60)

// Map projected coords to SVG pixel coords
function toSvg(px, py) {
  const nx = (px - cropX0) / cropW
  const ny = (py - cropY0) / cropH
  return {
    cx: Math.max(0, Math.min(SVG_WIDTH, nx * SVG_WIDTH)).toFixed(1),
    cy: Math.max(0, Math.min(SVG_HEIGHT, (1 - ny) * SVG_HEIGHT)).toFixed(1)
  }
}

// Compute star radius from magnitude (brighter = larger)
const magMin = Math.min(...selected.map((s) => s.mag))
const magMax = Math.max(...selected.map((s) => s.mag))
const magSpan = Math.max(magMax - magMin, 0.01)
function starRadius(mag) {
  const t = 1 - (mag - magMin) / magSpan // 1 = brightest
  return (0.5 + t * 2.0).toFixed(2) // radius 0.5..2.5
}

// Group stars by color
const groups = { blue: [], white: [], warm: [] }
for (const star of selected) {
  const group = bvGroup(star.bv)
  const { cx, cy } = toSvg(star.px, star.py)
  const r = starRadius(star.mag)
  groups[group].push(`    <circle cx="${cx}" cy="${cy}" r="${r}"/>`)
}

// Build SVG
const lines = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">',
  '  <title>Hero sky fallback</title>'
]

for (const [group, circles] of Object.entries(groups)) {
  if (circles.length === 0) continue
  const { fill, opacity } = COLOR_MAP[group]
  lines.push(`  <g fill="${fill}" opacity="${opacity}">`)
  lines.push(...circles)
  lines.push('  </g>')
}

lines.push('</svg>')
lines.push('')

writeFileSync(outPath, lines.join('\n'))
console.log(`Wrote ${outPath} (${selected.length} stars, crop ${cropW.toFixed(2)}×${cropH.toFixed(2)})`)
