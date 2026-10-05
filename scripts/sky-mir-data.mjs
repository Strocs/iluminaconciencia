/**
 * Compute MIR_RECTS lookup table for the hero night-sky cover crop.
 *
 * Projects the south catalog (RA 0..24h, Dec −90..−15, Vmag ≤ 6.5) through the
 * stereographic tangent at RA 9.75h / Dec −70°, mirrors projectedX (east-left),
 * and derives a gap-aware maximum inscribed rectangle (MIR) per aspect ratio from
 * 1.00 to 2.00 in steps of 0.05 (21 rows).
 *
 * HORIZON_Y = −0.933: stars below this projected y are excluded from the
 * visible viewport (619 below-horizon stars). The MIR bottom edge must be
 * ≥ HORIZON_Y.
 *
 * Usage: node scripts/sky-mir-data.mjs <catalog.gz>
 *
 * Output: JSON array of { aspect, x0, y0, h } objects to stdout.
 * The caller copies these into sky-crop.ts MIR_RECTS.
 */
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

const DEG_TO_RAD = Math.PI / 180

/** Stereographic tangent point: RA 9.75h, Dec −70° (first-person south view). */
const RA0 = 9.75 * 15 * DEG_TO_RAD
const DEC0 = -70 * DEG_TO_RAD
const SIN_DEC0 = Math.sin(DEC0)
const COS_DEC0 = Math.cos(DEC0)

const WINDOW = { raMin: 0, raMax: 24, decMin: -90, decMax: -15, magMax: 6.5 }
const HORIZON_Y = -0.933

function parseCatalog(gzPath) {
  const text = gunzipSync(readFileSync(gzPath)).toString('utf8')
  const lines = text.split(/\r?\n/).filter((line) => line.length >= 114)
  return lines.map((line) => ({
    ra: parseInt(line.slice(75, 77), 10) + parseInt(line.slice(77, 79), 10) / 60 + parseFloat(line.slice(79, 83)) / 3600,
    dec: (line[83] === '-' ? -1 : 1) * (parseInt(line.slice(84, 86), 10) + parseInt(line.slice(86, 88), 10) / 60 + parseInt(line.slice(88, 90), 10) / 3600),
    mag: parseFloat(line.slice(102, 107))
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
  const x = scale * cosDec * Math.sin(deltaRa)
  const y = scale * (COS_DEC0 * sinDec - SIN_DEC0 * cosDec * Math.cos(deltaRa))
  // Mirror: negate projectedX (east-left convention)
  return { x: -x, y }
}

const [catalogPath] = process.argv.slice(2)
if (!catalogPath) {
  console.error('Usage: node scripts/sky-mir-data.mjs <catalog.gz>')
  process.exit(2)
}

const allRecords = parseCatalog(catalogPath).filter(inWindow)
console.error(`Parsed ${allRecords.length} records in window`)

// Project all stars (mirrored: x negated for east-left)
const allProjected = allRecords.map(project)

// Filter stars above horizon (y >= HORIZON_Y)
const projected = allProjected.filter((p) => p.y >= HORIZON_Y)
console.error(`Stars above horizon (y >= ${HORIZON_Y}): ${projected.length} (excluded ${allProjected.length - projected.length})`)

// Compute region bounding box from ABOVE-HORIZON stars
let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
for (const p of projected) {
  if (p.x < xMin) xMin = p.x
  if (p.x > xMax) xMax = p.x
  if (p.y < yMin) yMin = p.y
  if (p.y > yMax) yMax = p.y
}
console.error(`Region bbox (above-horizon): x[${xMin.toFixed(4)}, ${xMax.toFixed(4)}] y[${yMin.toFixed(4)}, ${yMax.toFixed(4)}]`)

// Design-specified constants (mirrored space, from design decision #2608)
const REGION_DESIGN = { xMin: -1.5916, xMax: 1.6023, yMin: -2.1536, yMax: 1.0328 }

// Verify computed bboxes are close to design
const xMinDiff = Math.abs(xMin - REGION_DESIGN.xMin)
const xMaxDiff = Math.abs(xMax - REGION_DESIGN.xMax)
const yMinDiff = Math.abs(yMin - REGION_DESIGN.yMin)
const yMaxDiff = Math.abs(yMax - REGION_DESIGN.yMax)
console.error(`Region bbox diff from design: xMin=${xMinDiff.toFixed(4)} xMax=${xMaxDiff.toFixed(4)} yMin=${yMinDiff.toFixed(4)} yMax=${yMaxDiff.toFixed(4)}`)
if (xMinDiff > 0.01 || xMaxDiff > 0.01 || yMinDiff > 0.01 || yMaxDiff > 0.01) {
  console.error('WARNING: computed bbox differs significantly from design')
}

// Use design-specified bboxes for MIR computation
const regionXMin = REGION_DESIGN.xMin
const regionXMax = REGION_DESIGN.xMax
const regionYMin = REGION_DESIGN.yMin
const regionYMax = REGION_DESIGN.yMax

// Find max inscribed rectangle for a given aspect ratio
function findMIR(aspect) {
  const spanX = regionXMax - regionXMin
  const spanY = regionYMax - regionYMin

  let bestCount = -1
  let bestX0 = regionXMin
  let bestY0 = HORIZON_Y
  let bestH = spanY

  const steps = 50
  for (let yi = 0; yi <= steps; yi++) {
    const y0 = Math.max(HORIZON_Y, regionYMin) + ((regionYMax - Math.max(HORIZON_Y, regionYMin)) * yi) / steps
    for (let hi = 1; hi <= steps; hi++) {
      const maxH = regionYMax - y0
      const h = (maxH * hi) / steps
      if (h < 0.1) continue
      if (y0 + h > regionYMax + 0.001) break
      const w = aspect * h
      if (w > spanX + 0.001) continue

      for (let xi = 0; xi <= steps; xi++) {
        const x0 = regionXMin + ((spanX - w) * xi) / steps
        if (x0 + w > regionXMax + 0.001) continue

        let count = 0
        for (const p of projected) {
          if (p.x >= x0 && p.x <= x0 + w && p.y >= y0 && p.y <= y0 + h) {
            count++
          }
        }

        if (count > bestCount || (count === bestCount && h > bestH)) {
          bestCount = count
          bestX0 = x0
          bestY0 = y0
          bestH = h
        }
      }
    }
  }

  return { x0: bestX0, y0: bestY0, h: bestH, w: aspect * bestH, count: bestCount }
}

// Generate MIR_RECTS for aspects 1.00 to 2.00, step 0.05
const rects = []
for (let a = 1.0; a <= 2.001; a += 0.05) {
  const aspect = Math.round(a * 100) / 100
  const mir = findMIR(aspect)
  rects.push({ aspect, x0: mir.x0, y0: mir.y0, h: mir.h, count: mir.count })
  console.error(`aspect=${aspect.toFixed(2)} x0=${mir.x0.toFixed(4)} y0=${mir.y0.toFixed(4)} h=${mir.h.toFixed(4)} stars=${mir.count}`)
}

console.log(JSON.stringify(rects, null, 2))
