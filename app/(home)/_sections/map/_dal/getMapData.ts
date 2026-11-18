import 'server-only'
import { cacheLife } from 'next/cache'
import { getPoints } from '@/_dal/points/getPoints'
import { sqcDemoMarks } from '../sqc-demo'
import { groupPreviewMarks } from '../group-preview'
import type { MapGroup, MapMark } from '../types'

const TOLERANCE_METERS = 5
const EARTH_RADIUS_METERS = 6371008.8

function distanceMeters(a: MapMark, b: MapMark) {
  const radians = Math.PI / 180
  const latitudeDelta = (b.position.lat - a.position.lat) * radians
  const longitudeDelta = (b.position.lng - a.position.lng) * radians
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(a.position.lat * radians) * Math.cos(b.position.lat * radians) * Math.sin(longitudeDelta / 2) ** 2
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(Math.min(1, haversine)))
}

async function prepareMapData(marks: MapMark[], toleranceMeters: number) {
  'use cache'

  cacheLife({ stale: 300, revalidate: 604800, expire: 2592000 })

  const ordered = marks.toSorted((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  const ids = new Set<string>()
  for (const mark of ordered) {
    if (ids.has(mark.id)) throw new Error(`Duplicate map instrument ID: ${mark.id}`)
    ids.add(mark.id)
    if (!Number.isFinite(mark.position.lat) || !Number.isFinite(mark.position.lng)) {
      throw new Error(`Invalid map coordinates: ${mark.id}`)
    }
  }

  const neighbors = ordered.map(() => new Set<number>())
  for (let i = 0; i < ordered.length; i++) {
    for (let j = i + 1; j < ordered.length; j++) {
      if (distanceMeters(ordered[i], ordered[j]) <= toleranceMeters) {
        neighbors[i].add(j)
        neighbors[j].add(i)
      }
    }
  }

  // Detect every four-member clique before partitioning; never disguise an oversized site as smaller groups.
  for (let i = 0; i < ordered.length; i++) {
    const candidates = [...neighbors[i]].filter((index) => index > i)
    for (let a = 0; a < candidates.length; a++) {
      for (let b = a + 1; b < candidates.length; b++) {
        if (!neighbors[candidates[a]].has(candidates[b])) continue
        for (let c = b + 1; c < candidates.length; c++) {
          if (neighbors[candidates[a]].has(candidates[c]) && neighbors[candidates[b]].has(candidates[c])) {
            const members = [i, candidates[a], candidates[b], candidates[c]].map((index) => ordered[index].id)
            throw new Error(`Map proximity group exceeds three instruments: ${members.join(', ')}`)
          }
        }
      }
    }
  }

  const partitions: number[][] = []
  for (let index = 0; index < ordered.length; index++) {
    // Complete linkage, not connected components: all pairwise distances must fit the tolerance.
    const partition = partitions.find((members) => members.every((member) => neighbors[index].has(member)))
    if (partition) partition.push(index)
    else partitions.push([index])
  }
  const groups: MapGroup[] = partitions.map((indices) => {
    const members = indices.map((index) => ordered[index])
    return {
      id: JSON.stringify(members.map(({ id }) => id)),
      // The first stable member anchors the group; source coordinates remain untouched.
      position: members[0].position,
      members
    }
  })

  return {
    marks: ordered,
    groups,
    pointCount: marks.filter((mark) => mark.instrumentType !== 'SQC').length,
    demoCount: marks.filter((mark) => mark.instrumentType === 'SQC').length
  }
}

export async function getMapData() {
  const points = await getPoints()
  // Both the complete source snapshot and tolerance participate in the processed cache key.
  return prepareMapData([...points, ...sqcDemoMarks, ...groupPreviewMarks], TOLERANCE_METERS)
}
