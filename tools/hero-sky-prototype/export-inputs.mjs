#!/usr/bin/env node
// Execute the owned pure modules in memory; never emit JS into the application.
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { createHash } from 'node:crypto'
import ts from 'typescript'

const root = path.resolve(import.meta.dirname, '../..')
const sourceDir = path.join(root, 'app/(home)/_sections/hero/capabilities/night-sky')
// Additive isolated export destination; no-argument behavior remains historical.
const args = process.argv.slice(2)
if (args.length && (args.length !== 2 || args[0] !== '--output')) {
  throw new Error('Usage: node export-inputs.mjs [--output DIRECTORY]')
}
const output = args.length ? path.resolve(args[1]) : path.join(root, 'output/hero-sky-prototype/input')
const cache = new Map()
const hashes = {}
function load(filename) {
  const resolved = path.resolve(filename)
  if (path.dirname(resolved) !== sourceDir) throw new Error('Only local pure sky modules are allowed')
  if (cache.has(resolved)) return cache.get(resolved)
  const source = fs.readFileSync(resolved, 'utf8')
  hashes[path.basename(resolved)] = createHash('sha256').update(source).digest('hex')
  const result = { exports: {} }
  cache.set(resolved, result.exports)
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText
  const localRequire = (specifier) => {
    if (!specifier.startsWith('./')) throw new Error(`Unexpected import: ${specifier}`)
    const target = path.resolve(path.dirname(resolved), specifier)
    return load(path.extname(target) ? target : `${target}.ts`)
  }
  vm.runInNewContext(`(function(require,module,exports){${js}\n})`, {}, { filename: resolved })(
    localRequire, result, result.exports
  )
  return result.exports
}
const { starCatalog, starCatalogOriginalIndices } = load(path.join(sourceDir, 'star-catalog.ts'))
const backup = load(path.join(sourceDir, 'star-catalog.ts.bak')).starCatalog
if (!Array.isArray(backup)) throw new Error('Backup catalog export missing')
const reference = load(path.join(sourceDir, 'sky-reference.ts'))
const { computeSkyCrop } = load(path.join(sourceDir, 'sky-crop.ts'))
const { mapStarCatalog } = load(path.join(sourceDir, 'star-mapper.ts'))
const { nightSkyConfig } = load(path.join(sourceDir, 'config.ts'))
const renderer = fs.readFileSync(path.join(sourceDir, 'webgl-star-renderer.ts'), 'utf8')
hashes['webgl-star-renderer.ts'] = createHash('sha256').update(renderer).digest('hex')
const shader = (name) => {
  const match = renderer.match(new RegExp(`const ${name} = \x60([\\s\\S]*?)\x60`))
  if (!match) throw new Error(`Missing ${name}`)
  return match[1]
}
const mapped = Object.fromEntries(Object.entries(mapStarCatalog(starCatalog, starCatalogOriginalIndices)).map(([k, v]) => [k, Array.from(v)]))
if (mapped.origins.length !== 2 * starCatalog.length || mapped.stars.length !== 4 * starCatalog.length ||
    mapped.colors.length !== 4 * starCatalog.length) throw new Error('GPU buffer schema mismatch')
const frames = [[1920, 1080, 1], [390, 844, 2], [1440, 1080, 1], [1920, 823, 1],
  [360, 800, 2], [1920, 1440, 1], [1920, 2160, 1]].map(([width, height, dpr]) => ({
  width, height, dpr, crop: computeSkyCrop(width / height)
}))
const evidence = JSON.parse(fs.readFileSync(path.join(root, 'odd/plans/evidence/hero-hybrid-sky-feasibility.json'), 'utf8'))
const payload = {
  schema: 1, hashes, catalog: starCatalog, controlCatalog: backup,
  projected: starCatalog.map(reference.projectStar), mapped, frames,
  reference: reference.SKY_REFERENCE, region: reference.REGION_BBOX,
  tangent: reference.PROJECTION_TANGENT, config: nightSkyConfig,
  candidateMasterWcs: evidence.candidateMasterWcs,
  shaders: { vertex: shader('vertexShader'), fragment: shader('fragmentShader') }
}
fs.mkdirSync(output, { recursive: true })
fs.writeFileSync(path.join(output, 'current-sky.json'), `${JSON.stringify(payload)}\n`)
console.log(JSON.stringify({ output: args.length ? path.relative(root, path.join(output, 'current-sky.json')) : 'output/hero-sky-prototype/input/current-sky.json',
  currentStars: starCatalog.length, controlStars: backup.length, frames: frames.length,
  buffers: Object.fromEntries(Object.entries(mapped).map(([k, v]) => [k, v.length])) }))
