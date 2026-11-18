import type { Point } from '@/_dal/points/types'

export type MapMark = Point & {
  demoLocation?: 'Coquimbo' | 'La Serena'
  detailHref?: string | null
}

export interface MapGroup {
  id: string
  position: MapMark['position']
  members: MapMark[]
}
