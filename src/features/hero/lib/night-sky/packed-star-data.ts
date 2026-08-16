import { skyRendering } from '../../config/sky-rendering'

const HEADER_BYTES = 32
const RECORD_BYTES = 12
const AMPLIFICATION_BYTES = 4
const VERSION = 1
const MAGIC = 'HSKY'

export const starInstanceLevels = skyRendering.instanceCounts
export type StarInstanceLevel = (typeof starInstanceLevels)[number]

export interface PackedStarMetadata {
  readonly version: number
  readonly headerBytes: number
  readonly recordBytes: number
  readonly amplificationBytes: number
  readonly sourceCount: number
  readonly maxInstances: number
  readonly seed: number
  readonly paletteCount: number
  readonly payloadCrc32: number
}

export interface PackedStarData {
  readonly metadata: PackedStarMetadata
  readonly palette: Uint8Array
  readonly records: Float32Array
  readonly amplification: Uint16Array
}

const fail = (message: string): never => {
  throw new Error(`Hero sky packed data: ${message}`)
}

const crc32 = (bytes: Uint8Array): number => {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const assertRange = (value: number, minimum: number, maximum: number, label: string): number => {
  if (!Number.isInteger(value) || value < minimum || value > maximum) fail(`${label} is outside its supported range`)
  return value
}

export function decodePackedStarData(buffer: ArrayBuffer): PackedStarData {
  if (buffer.byteLength < HEADER_BYTES) fail('file is shorter than its v1 header')

  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)
  const magic = String.fromCharCode(...bytes.subarray(0, 4))
  if (magic !== MAGIC) fail('magic must be HSKY')

  const version = view.getUint16(4, true)
  const headerBytes = view.getUint16(6, true)
  const recordBytes = view.getUint16(8, true)
  const amplificationBytes = view.getUint16(10, true)
  const sourceCount = view.getUint32(12, true)
  const maxInstances = view.getUint32(16, true)
  const seed = view.getUint32(20, true)
  const paletteCount = view.getUint16(24, true)
  const reserved = view.getUint16(26, true)
  const payloadCrc32 = view.getUint32(28, true)

  if (version !== VERSION) fail(`version ${version} is unsupported`)
  if (headerBytes !== HEADER_BYTES) fail(`header stride ${headerBytes} is unsupported`)
  if (recordBytes !== RECORD_BYTES || amplificationBytes !== AMPLIFICATION_BYTES) fail('record layout is unsupported')
  if (reserved !== 0) fail('reserved header bits must be zero')
  assertRange(sourceCount, 1, 65_535, 'source count')
  assertRange(maxInstances, sourceCount, 65_535, 'instance count')
  assertRange(paletteCount, 1, 256, 'palette count')

  const expectedLength =
    HEADER_BYTES + paletteCount * 4 + sourceCount * RECORD_BYTES + maxInstances * AMPLIFICATION_BYTES
  if (buffer.byteLength !== expectedLength)
    fail(`length ${buffer.byteLength} does not match header length ${expectedLength}`)

  const payload = bytes.subarray(HEADER_BYTES)
  if (crc32(payload) !== payloadCrc32) fail('payload CRC32 does not match')

  const paletteOffset = HEADER_BYTES
  const recordsOffset = paletteOffset + paletteCount * 4
  const amplificationOffset = recordsOffset + sourceCount * RECORD_BYTES
  const records = new Float32Array(sourceCount * 8)
  for (let index = 0; index < sourceCount; index += 1) {
    const sourceOffset = recordsOffset + index * RECORD_BYTES
    const targetOffset = index * 8
    const color = view.getUint8(sourceOffset + 9)
    const layerFlags = view.getUint8(sourceOffset + 10)
    const densityWeight = view.getUint8(sourceOffset + 11)
    if (color >= paletteCount) fail(`record ${index} has an out-of-range palette index`)
    if (layerFlags > 31 || densityWeight === 0) fail(`record ${index} has an out-of-range flag or density value`)
    records[targetOffset] = view.getUint16(sourceOffset, true) / 65_535
    records[targetOffset + 1] = view.getUint16(sourceOffset + 2, true) / 65_535
    records[targetOffset + 2] = view.getUint16(sourceOffset + 4, true) / 65_535
    records[targetOffset + 3] = view.getUint8(sourceOffset + 6) / 255
    records[targetOffset + 4] = view.getUint8(sourceOffset + 7) / 255
    records[targetOffset + 5] = view.getUint8(sourceOffset + 8) / 255
    records[targetOffset + 6] = color / 255
    records[targetOffset + 7] = layerFlags / 31
  }

  const amplification = new Uint16Array(maxInstances * 2)
  for (let index = 0; index < maxInstances; index += 1) {
    const offset = amplificationOffset + index * AMPLIFICATION_BYTES
    const sourceIndex = view.getUint16(offset, true)
    if (sourceIndex >= sourceCount) fail(`amplification entry ${index} has an out-of-range source index`)
    amplification[index * 2] = sourceIndex
    amplification[index * 2 + 1] = view.getUint16(offset + 2, true)
  }

  return {
    metadata: {
      version,
      headerBytes,
      recordBytes,
      amplificationBytes,
      sourceCount,
      maxInstances,
      seed,
      paletteCount,
      payloadCrc32
    },
    palette: bytes.slice(paletteOffset, recordsOffset),
    records,
    amplification
  }
}

export async function fetchPackedStarData(url: string, request: typeof fetch = fetch): Promise<PackedStarData> {
  const response = await request(url)
  if (!response.ok) fail(`fetch failed with HTTP ${response.status}`)
  return decodePackedStarData(await response.arrayBuffer())
}

export function selectStarInstancePrefix(data: PackedStarData, requested: StarInstanceLevel): number {
  if (!starInstanceLevels.includes(requested)) fail(`instance level ${requested} is unsupported`)
  if (requested > data.metadata.maxInstances) fail(`instance level ${requested} exceeds packed data capacity`)
  return requested
}
