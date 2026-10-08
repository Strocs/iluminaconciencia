import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { projectStar, SKY_REFERENCE } from './sky-reference.ts'

const directory = dirname(fileURLToPath(import.meta.url))
const backupPath = join(directory, 'star-catalog.ts.bak')
const outputPath = join(directory, 'star-catalog.ts')
const expectedBackupSha256 = '047dc4db80b635aae871633276dde9ab077bd7daaaf078467627d0b24b8f93da'
const expectedSourceRows = 5530
const referenceWidthPx = 1920
const referenceHeightPx = 1080
// Shader quads reach size * twinkle at their corners: max 9px * 1.06 = 9.54px.
const conservativeHaloCssPx = 10
const projectedMarginX = conservativeHaloCssPx * SKY_REFERENCE.width / referenceWidthPx
const projectedMarginY = conservativeHaloCssPx * SKY_REFERENCE.height / referenceHeightPx

const source = await readFile(backupPath, 'utf8')
const actualHash = createHash('sha256').update(source).digest('hex')
if (actualHash !== expectedBackupSha256) throw new Error(`Backup SHA-256 mismatch: ${actualHash}`)
const literalPattern = /\{\s*ra:\s*(-?(?:\d+\.?\d*|\.\d+)),\s*dec:\s*(-?(?:\d+\.?\d*|\.\d+)),\s*mag:\s*(-?(?:\d+\.?\d*|\.\d+)),\s*bv:\s*(-?(?:\d+\.?\d*|\.\d+))\s*\}/g
const rows = [...source.matchAll(literalPattern)]
if (rows.length !== expectedSourceRows) throw new Error(`Expected ${expectedSourceRows} source records; parsed ${rows.length}`)
const parsed = rows.map((match) => ({
  literal: match[0],
  record: { ra: Number(match[1]), dec: Number(match[2]), mag: Number(match[3]), bv: Number(match[4]) }
}))
if (parsed.some(({ record }) => Object.values(record).some((value) => !Number.isFinite(value)))) {
  throw new Error('Source contains a non-finite catalog value')
}

const selected = []
let centerInsideCount = 0
for (const row of parsed) {
  const [x, y] = projectStar(row.record)
  const centerInside = x >= SKY_REFERENCE.x0 && x <= SKY_REFERENCE.x0 + SKY_REFERENCE.width &&
    y >= SKY_REFERENCE.y0 && y <= SKY_REFERENCE.y0 + SKY_REFERENCE.height
  if (centerInside) centerInsideCount += 1
  const intersectsHalo = x >= SKY_REFERENCE.x0 - projectedMarginX &&
    x <= SKY_REFERENCE.x0 + SKY_REFERENCE.width + projectedMarginX &&
    y >= SKY_REFERENCE.y0 - projectedMarginY &&
    y <= SKY_REFERENCE.y0 + SKY_REFERENCE.height + projectedMarginY
  if (intersectsHalo) selected.push(row.literal)
}

const header = `/**
 * Southern sky static sample for the fixed safe 16:9 hero composition.
 * Retained rows are original BSC5 literals and remain in original catalog order.
 *
 * Source: star-catalog.ts.bak (BSC5), SHA-256 ${expectedBackupSha256}; ${rows.length} source records.
 * Selection: explicit offline command \`node --experimental-strip-types 'app/(home)/_sections/hero/capabilities/night-sky/prefilter-star-catalog.mjs'\`.
 * The generator parses record literals without evaluation and shares the runtime stereographic projection/reference.
 * Keep centers within the reference plus a ${conservativeHaloCssPx}px projected halo margin, calibrated for ${referenceWidthPx}x${referenceHeightPx}.
 * Shader quad maximum is 9px * 1.06 twinkle = 9.54px; 10px is conservative. Coverage at other canvas sizes is aspect/size-dependent and not guaranteed.
 * No runtime/build-time filtering occurs.
 * Persisted sample: ${selected.length} rows (${centerInsideCount} centers inside, ${selected.length - centerInsideCount} halo-only).
 */

export interface StarCatalogRecord {
  readonly ra: number
  readonly dec: number
  readonly mag: number
  readonly bv: number
}

export const starCatalog: readonly StarCatalogRecord[] = [
`
const generated = `${header}${selected.map((literal) => `  ${literal},`).join('\n')}\n]\n`
const checkOnly = process.argv.includes('--check')
if (process.argv.slice(2).some((argument) => argument !== '--check')) throw new Error('Supported option: --check')
if (checkOnly) {
  const persisted = await readFile(outputPath, 'utf8')
  if (persisted !== generated) throw new Error('Persisted catalog differs from deterministic offline selection')
} else {
  await writeFile(outputPath, generated)
}
console.log(JSON.stringify({ mode: checkOnly ? 'check' : 'write', sourceRows: rows.length, selectedRows: selected.length, centerInsideCount, haloOnlyCount: selected.length - centerInsideCount, projectedMarginX, projectedMarginY }, null, 2))
