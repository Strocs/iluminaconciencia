/**
 * BSC5 → star-catalog.ts extractor (SDD change hero-sky-south-first-person).
 *
 * Parametrized window extractor for the hero night-sky catalog. Two modes in
 * one run:
 *
 * 1. STALE-PATH VALIDATION — regenerates the OLD window (RA 2..18h,
 *    Dec −85..+70, Vmag ≤ 6.5) from the BSC5 catalog and diffs it against the
 *    committed star-catalog.ts record list. A non-empty diff proves the parser
 *    drifted from the committed window/path and aborts before any write.
 * 2. EMISSION — extracts the NEW south window (RA 0..24h, Dec −90..−15,
 *    Vmag ≤ 6.5), asserts the record count (3,369) and the Achernar guard
 *    (RA ≈ 1.62h, mag ≈ 0.46), sorts by RA, and rewrites star-catalog.ts.
 *
 * BSC5 fixed-width layout (1-indexed byte columns, J2000 fields):
 *   1-4 HR | 5-14 Name | 76-77 RAh | 78-79 RAm | 80-83 RAs | 84 DE sign |
 *   85-86 DEd | 87-88 DEm | 89-90 DEs | 103-107 Vmag | 110-114 B-V
 *
 * Usage: node scripts/sky-extract.mjs <catalog.gz>
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

/** New south window (NS-2): full RA ring, southern hemisphere down to Dec −15. */
const WINDOW = { raMin: 0, raMax: 24, decMin: -90, decMax: -15, magMax: 6.5 }
/** Previous committed window, regenerated only as a parser drift check. */
const OLD_WINDOW = { raMin: 2, raMax: 18, decMin: -85, decMax: 70, magMax: 6.5 }
const EXPECTED_COUNT = 3369
const ACHERNAR = { raMin: 1.62, raMax: 1.64, magMin: 0.4, magMax: 0.5 }
const CATALOG_PATH = 'src/features/hero/capabilities/night-sky/star-catalog.ts'

const HEADER = `/**
 * Southern summer sky catalog — fixed celestial fragment visible from Coquimbo, Chile.
 *
 * This module is pure data: the records below are the source of truth for the
 * hero night sky. The renderer never sees this schema; \`star-mapper.ts\`
 * projects and derives GPU-ready values once at startup.
 *
 * Window: RA 0h – 24h, Dec −90° … −15° (first-person view SOUTH from ~30°S:
 * the whole southern circumpolar field down to the Dec −15 parallel), Vmag
 * <= 6.5.
 *
 * Provenance:
 * - Source: Yale Bright Star Catalog (BSC5), 5th Revised Ed. (Hoffleit+, 1991),
 *   public domain. Extracted from the CDS VizieR mirror on 2026-08-17:
 *   https://cdsarc.cds.unistra.fr/ftp/cats/V/50/catalog.gz
 * - Extraction: REGENERABLE — run \`node scripts/sky-extract.mjs <catalog.gz>\`
 *   with the same BSC5 catalog to reproduce this file byte-identically.
 *   Parses the fixed-width J2000 fields (RAh/RAm/RAs, DE/DEd/DEm/DEs, Vmag,
 *   B-V), filters RA 0–24h, Dec −90°…−15°, Vmag <= 6.5, sorts by RA.
 */

export interface StarCatalogRecord {
  /** Right ascension in decimal hours (BSC5 native unit), epoch J2000. */
  readonly ra: number
  /** Declination in decimal degrees, epoch J2000. */
  readonly dec: number
  /** Visual magnitude (Vmag): lower is brighter. */
  readonly mag: number
  /** B–V color index: blue stars are negative, red stars are positive. */
  readonly bv: number
}

export const starCatalog: readonly StarCatalogRecord[] = [
`

/** Fixed 2-decimal emission: strip trailing zeros, keep at least one decimal. */
const fmt2 = (value) => {
  const fixed = value.toFixed(2)
  const stripped = fixed.endsWith('0') ? fixed.slice(0, -1) : fixed
  return stripped === '-0.0' ? '0.0' : stripped
}

/** Fixed 4-decimal emission (RA/dec): strip trailing zeros, keep >= 1 decimal. */
const fmt4 = (value) => {
  const fixed = value.toFixed(4)
  const stripped = fixed.replace(/0+$/, '')
  return stripped.endsWith('.') ? `${stripped}0` : stripped
}

function parseCatalog(gzPath) {
  const text = gunzipSync(readFileSync(gzPath)).toString('utf8')
  const lines = text.split(/\r?\n/).filter((line) => line.length >= 114)
  return lines.map((line) => ({
    hr: parseInt(line.slice(0, 4), 10),
    name: line.slice(4, 14).trim(),
    ra: parseInt(line.slice(75, 77), 10) + parseInt(line.slice(77, 79), 10) / 60 + parseFloat(line.slice(79, 83)) / 3600,
    dec: (line[83] === '-' ? -1 : 1) * (parseInt(line.slice(84, 86), 10) + parseInt(line.slice(86, 88), 10) / 60 + parseInt(line.slice(88, 90), 10) / 3600),
    mag: parseFloat(line.slice(102, 107)),
    bv: parseFloat(line.slice(109, 114))
  }))
}

/** Emit the shared record-line format used by both window comparisons. Blank B-V defaults to 0.5 (committed convention). */
const emitRecord = ({ ra, dec, mag, bv }, isLast = false) =>
  `  { ra: ${fmt4(ra)}, dec: ${fmt4(dec)}, mag: ${fmt2(mag)}, bv: ${fmt2(Number.isNaN(bv) ? 0.5 : bv)} }${isLast ? '' : ','}`

function inWindow(record, window) {
  return (
    record.ra >= window.raMin && record.ra < window.raMax &&
    record.dec >= window.decMin && record.dec <= window.decMax &&
    record.mag <= window.magMax
  )
}

/** Read the committed catalog's record lines from the TS file. */
function readCommittedRecords(path) {
  const text = readFileSync(path, 'utf8')
  const lines = text.split('\n').filter((line) => /^\s*\{ ra: /.test(line))
  return lines.map((line) => {
    const ra = Number(line.match(/ra: (-?[\d.]+)/)[1])
    const dec = Number(line.match(/dec: (-?[\d.]+)/)[1])
    const mag = Number(line.match(/mag: (-?[\d.]+)/)[1])
    const bv = Number(line.match(/bv: (-?[\d.]+)/)[1])
    return { ra, dec, mag, bv }
  })
}

const [catalogPath] = process.argv.slice(2)
if (!catalogPath) {
  console.error('Usage: node scripts/sky-extract.mjs <catalog.gz>')
  process.exit(2)
}

const records = parseCatalog(catalogPath)

// Sanity check: HR 1 must be HD 3 (BD+44 4550), Vmag 6.70 — proves column offsets.
const first = records[0]
if (first.hr !== 1 || first.mag < 6.69 || first.mag > 6.71) {
  console.error(`Sanity check failed: HR ${first.hr} mag ${first.mag} (expected HR 1, mag 6.70)`)
  process.exit(1)
}

// 1. Stale-path validation: if the committed catalog matches the OLD window
// (5,530 records), verify parser hasn't drifted. If it already matches the
// NEW window (3,369 records), the catalog is already regenerated — skip check.
const oldWindow = records.filter((record) => inWindow(record, OLD_WINDOW)).sort((a, b) => a.ra - b.ra)
const committed = readCommittedRecords(CATALOG_PATH)
if (committed.length === EXPECTED_COUNT) {
  console.log(`Stale-path SKIPPED: committed catalog already has ${EXPECTED_COUNT} records (new window)`)
} else if (oldWindow.length !== committed.length) {
  console.error(`Stale-path check FAILED: old window regenerates ${oldWindow.length} records, committed has ${committed.length}`)
  process.exit(1)
} else {
  let drift = 0
  for (let index = 0; index < oldWindow.length; index += 1) {
    if (emitRecord(oldWindow[index], index === oldWindow.length - 1) !== emitRecord(committed[index], index === committed.length - 1)) drift += 1
  }
  if (drift > 0) {
    console.error(`Stale-path check FAILED: ${drift} of ${oldWindow.length} records differ from committed catalog`)
    process.exit(1)
  }
  console.log(`Stale-path OK: old window regenerates all ${oldWindow.length} committed records byte-identically`)
}

// 2. Emission: new south window.
const selected = records.filter((record) => inWindow(record, WINDOW)).sort((a, b) => a.ra - b.ra)
if (selected.length !== EXPECTED_COUNT) {
  console.error(`Window check FAILED: ${selected.length} records (expected ${EXPECTED_COUNT})`)
  process.exit(1)
}
const achernar = selected.find((record) => record.ra >= ACHERNAR.raMin && record.ra <= ACHERNAR.raMax && record.mag >= ACHERNAR.magMin && record.mag <= ACHERNAR.magMax)
if (!achernar || achernar.mag < ACHERNAR.magMin || achernar.mag > ACHERNAR.magMax) {
  console.error(`Window check FAILED: Achernar guard not met (found ${achernar ? achernar.ra + 'h mag ' + achernar.mag : 'none'})`)
  process.exit(1)
}
for (const record of selected) {
  if (record.ra < WINDOW.raMin || record.ra >= WINDOW.raMax || record.dec < WINDOW.decMin || record.dec > WINDOW.decMax || record.mag > WINDOW.magMax) {
    console.error(`Window check FAILED: record out of bounds (RA ${record.ra}h Dec ${record.dec} mag ${record.mag})`)
    process.exit(1)
  }
}
console.log(`Window OK: ${selected.length} records, Achernar at RA ${achernar.ra.toFixed(4)}h mag ${achernar.mag.toFixed(2)}`)

const body = selected.map((record, index) => emitRecord(record, index === selected.length - 1)).join('\n')
writeFileSync(CATALOG_PATH, `${HEADER}${body}\n]\n`)
console.log(`Wrote ${CATALOG_PATH} (${selected.length} records)`)