#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const HEADER_BYTES = 32
const RECORD_BYTES = 12
const AMPLIFICATION_BYTES = 4
const VERSION = 1
const MAGIC = 'HSKY'
const SOURCE_FORMAT = 'hero-sky-source-v1'
const COMPLETE_SOURCE_COUNT = 2000

const fail = (message) => {
  throw new Error(`Hero sky contract: ${message}`)
}

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

const assertExactKeys = (value, keys, label) => {
  if (!isPlainObject(value)) fail(`${label} must be an object`)
  const actual = Object.keys(value).sort()
  const expected = [...keys].sort()
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    fail(`${label} has unsupported or missing fields`)
  }
}

const assertInteger = (value, minimum, maximum, label) => {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    fail(`${label} must be an integer between ${minimum} and ${maximum}`)
  }
  return value
}

const parseColor = (value, label) => {
  if (typeof value !== 'string' || !/^#[0-9a-fA-F]{8}$/.test(value)) {
    fail(`${label} must be an eight-digit RGBA hex color`)
  }
  return Buffer.from(value.slice(1), 'hex')
}

const validateSource = (source) => {
  assertExactKeys(source, ['format', 'seed', 'referenceViewport', 'palette', 'stars', 'maxInstances'], 'source')
  if (source.format !== SOURCE_FORMAT) fail(`source.format must be ${SOURCE_FORMAT}`)
  assertInteger(source.seed, 0, 0xffffffff, 'source.seed')
  assertExactKeys(source.referenceViewport, ['width', 'height'], 'source.referenceViewport')
  assertInteger(source.referenceViewport.width, 1, 65535, 'source.referenceViewport.width')
  assertInteger(source.referenceViewport.height, 1, 65535, 'source.referenceViewport.height')
  if (!Array.isArray(source.palette) || source.palette.length < 1 || source.palette.length > 256) {
    fail('source.palette must contain 1 to 256 RGBA colors')
  }
  source.palette.forEach((color, index) => parseColor(color, `source.palette[${index}]`))
  if (!Array.isArray(source.stars) || source.stars.length < 1 || source.stars.length > 0xffffffff) {
    fail('source.stars must contain at least one record')
  }
  assertInteger(source.maxInstances, source.stars.length, 0xffffffff, 'source.maxInstances')

  return source.stars.map((star, index) => {
    const label = `source.stars[${index}]`
    assertExactKeys(star, ['x', 'y', 'phase', 'size', 'alpha', 'speed', 'color', 'layerFlags', 'densityWeight'], label)
    return {
      x: assertInteger(star.x, 0, 65535, `${label}.x`),
      y: assertInteger(star.y, 0, 65535, `${label}.y`),
      phase: assertInteger(star.phase, 0, 65535, `${label}.phase`),
      size: assertInteger(star.size, 0, 255, `${label}.size`),
      alpha: assertInteger(star.alpha, 0, 255, `${label}.alpha`),
      speed: assertInteger(star.speed, 0, 255, `${label}.speed`),
      color: assertInteger(star.color, 0, source.palette.length - 1, `${label}.color`),
      layerFlags: assertInteger(star.layerFlags, 0, 31, `${label}.layerFlags`),
      densityWeight: assertInteger(star.densityWeight, 1, 255, `${label}.densityWeight`)
    }
  })
}

const createRandom = (seed) => {
  let state = seed >>> 0
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return (state >>> 0) / 0x100000000
  }
}

const createAmplification = (stars, maxInstances, seed) => {
  const random = createRandom(seed)
  const permutation = Array.from({ length: stars.length }, (_, index) => index)
  for (let index = permutation.length - 1; index > 0; index -= 1) {
    const next = Math.floor(random() * (index + 1))
    ;[permutation[index], permutation[next]] = [permutation[next], permutation[index]]
  }

  const totalWeight = stars.reduce((sum, star) => sum + star.densityWeight, 0)
  const entries = permutation.map((sourceIndex) => ({ sourceIndex, replicaOrdinal: 0 }))
  const replicaOrdinals = Array.from({ length: stars.length }, () => 0)
  while (entries.length < maxInstances) {
    let target = Math.floor(random() * totalWeight)
    let sourceIndex = 0
    for (; sourceIndex < stars.length - 1; sourceIndex += 1) {
      if (target < stars[sourceIndex].densityWeight) break
      target -= stars[sourceIndex].densityWeight
    }
    replicaOrdinals[sourceIndex] += 1
    entries.push({ sourceIndex, replicaOrdinal: replicaOrdinals[sourceIndex] })
  }
  return entries
}

const crc32 = (bytes) => {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const packSource = (source) => {
  const stars = validateSource(source)
  const palette = Buffer.concat(source.palette.map((color, index) => parseColor(color, `source.palette[${index}]`)))
  const records = Buffer.alloc(stars.length * RECORD_BYTES)
  stars.forEach((star, index) => {
    const offset = index * RECORD_BYTES
    records.writeUInt16LE(star.x, offset)
    records.writeUInt16LE(star.y, offset + 2)
    records.writeUInt16LE(star.phase, offset + 4)
    records.set([star.size, star.alpha, star.speed, star.color, star.layerFlags, star.densityWeight], offset + 6)
  })
  const amplificationEntries = createAmplification(stars, source.maxInstances, source.seed)
  const amplification = Buffer.alloc(amplificationEntries.length * AMPLIFICATION_BYTES)
  amplificationEntries.forEach((entry, index) => {
    const offset = index * AMPLIFICATION_BYTES
    amplification.writeUInt16LE(entry.sourceIndex, offset)
    amplification.writeUInt16LE(entry.replicaOrdinal, offset + 2)
  })
  const payload = Buffer.concat([palette, records, amplification])
  const packed = Buffer.alloc(HEADER_BYTES + payload.length)
  packed.write(MAGIC, 0, 'ascii')
  packed.writeUInt16LE(VERSION, 4)
  packed.writeUInt16LE(HEADER_BYTES, 6)
  packed.writeUInt16LE(RECORD_BYTES, 8)
  packed.writeUInt16LE(AMPLIFICATION_BYTES, 10)
  packed.writeUInt32LE(stars.length, 12)
  packed.writeUInt32LE(source.maxInstances, 16)
  packed.writeUInt32LE(source.seed, 20)
  packed.writeUInt16LE(source.palette.length, 24)
  packed.writeUInt16LE(0, 26)
  packed.writeUInt32LE(crc32(payload), 28)
  payload.copy(packed, HEADER_BYTES)
  return { packed, amplificationEntries }
}

const decodePacked = (packed) => {
  if (packed.length < HEADER_BYTES || packed.subarray(0, 4).toString('ascii') !== MAGIC)
    fail('packed data has an invalid magic')
  if (packed.readUInt16LE(4) !== VERSION) fail('packed data has an unsupported version')
  if (packed.readUInt16LE(6) !== HEADER_BYTES) fail('packed data has an unsupported header length')
  if (packed.readUInt16LE(8) !== RECORD_BYTES || packed.readUInt16LE(10) !== AMPLIFICATION_BYTES) {
    fail('packed data has an unsupported record layout')
  }
  const sourceCount = packed.readUInt32LE(12)
  const maxInstances = packed.readUInt32LE(16)
  const paletteCount = packed.readUInt16LE(24)
  if (sourceCount < 1 || maxInstances < sourceCount || paletteCount < 1) fail('packed data has invalid counts')
  const expectedLength =
    HEADER_BYTES + paletteCount * 4 + sourceCount * RECORD_BYTES + maxInstances * AMPLIFICATION_BYTES
  if (packed.length !== expectedLength) fail('packed data has an invalid length')
  const payload = packed.subarray(HEADER_BYTES)
  if (packed.readUInt32LE(28) !== crc32(payload)) fail('packed data failed its payload CRC32')
  const amplificationOffset = HEADER_BYTES + paletteCount * 4 + sourceCount * RECORD_BYTES
  for (let index = 0; index < maxInstances; index += 1) {
    const sourceIndex = packed.readUInt16LE(amplificationOffset + index * AMPLIFICATION_BYTES)
    if (sourceIndex >= sourceCount) fail('packed data has an out-of-range amplification index')
  }
  return {
    headerBytes: packed.readUInt16LE(6),
    recordBytes: packed.readUInt16LE(8),
    amplificationBytes: packed.readUInt16LE(10),
    sourceCount,
    maxInstances,
    paletteCount,
    payloadCrc32: packed.readUInt32LE(28)
  }
}

const createSvg = (source, amplificationEntries) => {
  const stars = validateSource(source)
  const { width, height } = source.referenceViewport
  const circles = amplificationEntries
    .slice(0, stars.length)
    .map(({ sourceIndex }) => {
      const star = stars[sourceIndex]
      const color = source.palette[star.color]
      const x = ((star.x / 65535) * width).toFixed(3)
      const y = ((star.y / 65535) * height).toFixed(3)
      const radius = (0.5 + (star.size / 255) * 2.5).toFixed(3)
      const opacity = (star.alpha / 255).toFixed(3)
      return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color.slice(0, 7)}" fill-opacity="${opacity}"/>`
    })
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Static hero sky fallback"><rect width="100%" height="100%" fill="#07111fff"/>${circles}</svg>\n`
}

const sha256 = (value) => createHash('sha256').update(value).digest('hex')

const validateFixture = async () => {
  const fixturePath = fileURLToPath(new URL('../src/features/hero/data/star-composition.fixture.json', import.meta.url))
  const fixture = JSON.parse(await readFile(fixturePath, 'utf8'))
  assertExactKeys(fixture, ['source', 'expected'], 'fixture')
  assertExactKeys(
    fixture.expected,
    ['payloadCrc32', 'packedSha256', 'svgSha256', 'amplificationPrefix'],
    'fixture.expected'
  )
  if (!Array.isArray(fixture.expected.amplificationPrefix))
    fail('fixture.expected.amplificationPrefix must be an array')
  const source = fixture.source
  const first = packSource(source)
  const header = decodePacked(first.packed)
  const firstSvg = createSvg(source, first.amplificationEntries)
  const second = packSource(source)
  const secondSvg = createSvg(source, second.amplificationEntries)
  if (!first.packed.equals(second.packed) || firstSvg !== secondSvg) fail('fixture generation is not deterministic')
  const payloadCrc32 = header.payloadCrc32.toString(16).padStart(8, '0')
  const packedSha256 = sha256(first.packed)
  const svgSha256 = sha256(firstSvg)
  const prefix = first.amplificationEntries.slice(0, source.stars.length)
  if (
    fixture.expected.payloadCrc32 !== payloadCrc32 ||
    fixture.expected.packedSha256 !== packedSha256 ||
    fixture.expected.svgSha256 !== svgSha256 ||
    JSON.stringify(fixture.expected.amplificationPrefix) !== JSON.stringify(prefix)
  ) {
    fail('fixture identity does not match the deterministic packed-v1 contract')
  }
  console.log(
    `Fixture valid: ${header.sourceCount} stars, ${header.maxInstances} instances, crc32=${payloadCrc32}, packed-sha256=${packedSha256}, svg-sha256=${svgSha256}`
  )
}

const validateSourceSegment = async (segment, requiredCount) => {
  const segmentCounts = { 1: 666, 2: 1333, 3: 2000 }
  if (!(segment in segmentCounts)) fail('supported source segments: 1, 2, 3')
  if (requiredCount !== undefined && requiredCount !== segmentCounts[segment]) {
    fail(`source segment ${segment} requires --require-count ${segmentCounts[segment]}`)
  }
  const sourcePath = fileURLToPath(new URL('../src/features/hero/data/star-composition.json', import.meta.url))
  const source = JSON.parse(await readFile(sourcePath, 'utf8'))
  const { packed } = packSource(source)
  const header = decodePacked(packed)
  if (header.sourceCount !== segmentCounts[segment]) {
    fail(`source segment ${segment} must contain exactly records 1–${segmentCounts[segment]}`)
  }
  console.log(
    `Source segment ${segment} valid: ${header.sourceCount} stars, ${header.maxInstances} instances, crc32=${header.payloadCrc32
      .toString(16)
      .padStart(8, '0')}`
  )
}

const sourcePath = fileURLToPath(new URL('../src/features/hero/data/star-composition.json', import.meta.url))
const outputPath = fileURLToPath(new URL('../public/images/hero/hero-stars-v1.bin', import.meta.url))

const describePacked = (header, packed) =>
  `${packed.length} bytes, sha256=${sha256(packed)}, magic=${MAGIC}, version=${VERSION}, header=${header.headerBytes}, record=${header.recordBytes}, amplification=${header.amplificationBytes}, stars=${header.sourceCount}, instances=${header.maxInstances}, palette=${header.paletteCount}, crc32=${header.payloadCrc32
    .toString(16)
    .padStart(8, '0')}`

const packCompleteSource = async () => {
  const source = JSON.parse(await readFile(sourcePath, 'utf8'))
  if (source.stars.length !== COMPLETE_SOURCE_COUNT) {
    fail(`production source must contain exactly ${COMPLETE_SOURCE_COUNT} stars`)
  }
  const { packed } = packSource(source)
  return { packed, header: decodePacked(packed) }
}

const generateBinary = async () => {
  const { packed, header } = await packCompleteSource()
  await writeFile(outputPath, packed)
  console.log(`Generated hero-stars-v1.bin: ${describePacked(header, packed)}`)
}

const checkBinary = async () => {
  const { packed: expected } = await packCompleteSource()
  const actual = await readFile(outputPath)
  const actualHeader = decodePacked(actual)
  if (!actual.equals(expected)) fail('hero-stars-v1.bin does not match the deterministic source output')
  console.log(`Checked hero-stars-v1.bin: ${describePacked(actualHeader, actual)}`)
}

const args = process.argv.slice(2)
const [command, option, segment, requireCountOption, requiredCount] = args
const run =
  args.length === 1 && command === '--validate-fixture'
    ? validateFixture
    : command === '--validate-source' &&
        option === '--segment' &&
        segment !== undefined &&
        (args.length === 3 ||
          (args.length === 5 && requireCountOption === '--require-count' && requiredCount !== undefined))
      ? () => validateSourceSegment(segment, requiredCount === undefined ? undefined : Number(requiredCount))
      : args.length === 1 && command === '--generate'
        ? generateBinary
        : args.length === 1 && command === '--check'
          ? checkBinary
          : null

if (!run)
  fail(
    'supported commands: --validate-fixture | --validate-source --segment 1|2|3 [--require-count count] | --generate | --check'
  )

run().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
