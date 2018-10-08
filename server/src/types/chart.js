type Axis = 'x' | 'y'

type Coord = {
  x: number,
  y: number,
}

type Line = {
  p1: Coord,
  p2: Coord,
}

type SegmentMap = {
  [id: number]: Line[],
  totalLength: number,
}

type BoundingBox = {
  p1: Coord,
  p2: Coord,
}

type RowPositions = number[]

type ChartData = {
  boundingBox: BoundingBox,
  path: String,
  rowPositions: RowPositions,
}

export type {
  Axis,
  Coord,
  Line,
  SegmentMap,
  BoundingBox,
  RowPositions,
  ChartData,
}
