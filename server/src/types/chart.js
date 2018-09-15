export type Axis = 'x' | 'y'

export type Coord = {
  x: number,
  y: number,
}

export type Line = {
  p1: Coord,
  p2: Coord,
}

export type SegmentMap = {
  [id: number]: Line[],
  totalLength: number,
}

export type BoundingBox = {
  p1: Coord,
  p2: Coord,
}

export type RowPositions = number[]

export type ChartData = {
  boundingBox: BoundingBox,
  rowPositions: RowPositions,
}
