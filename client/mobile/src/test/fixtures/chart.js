const horizontalSegments = [
  // 1st horizontal line
  {
    p1: { x: 0, y: 0 },
    p2: { x: 10, y: 0 },
  },
  {
    p1: { x: 10, y: 0 },
    p2: { x: 20, y: 0 },
  },
  {
    p1: { x: 20, y: 0 },
    p2: { x: 30, y: 0 },
  },
  {
    p1: { x: 30, y: 0 },
    p2: { x: 40, y: 0 },
  },
  {
    p1: { x: 40, y: 0 },
    p2: { x: 50, y: 0 },
  },
  // 2nd horizontal line
  {
    p1: { x: 0, y: 10 },
    p2: { x: 10, y: 10 },
  },
  {
    p1: { x: 10, y: 10 },
    p2: { x: 20, y: 10 },
  },
  {
    p1: { x: 20, y: 10 },
    p2: { x: 30, y: 10 },
  },
  {
    p1: { x: 30, y: 10 },
    p2: { x: 40, y: 10 },
  },
  {
    p1: { x: 40, y: 10 },
    p2: { x: 50, y: 10 },
  },
  // 3rd horizontal line
  {
    p1: { x: 0, y: 20 },
    p2: { x: 10, y: 20 },
  },
  {
    p1: { x: 10, y: 20 },
    p2: { x: 20, y: 20 },
  },
  {
    p1: { x: 20, y: 20 },
    p2: { x: 30, y: 20 },
  },
  {
    p1: { x: 30, y: 20 },
    p2: { x: 40, y: 20 },
  },
  {
    p1: { x: 40, y: 20 },
    p2: { x: 50, y: 20 },
  },
  // 4th horizontal line
  {
    p1: { x: 0, y: 30 },
    p2: { x: 10, y: 30 },
  },
  {
    p1: { x: 10, y: 30 },
    p2: { x: 20, y: 30 },
  },
  {
    p1: { x: 20, y: 30 },
    p2: { x: 30, y: 30 },
  },
  {
    p1: { x: 30, y: 30 },
    p2: { x: 40, y: 30 },
  },
  {
    p1: { x: 40, y: 30 },
    p2: { x: 50, y: 30 },
  },
  // 5th horizontal line
  {
    p1: { x: 0, y: 40 },
    p2: { x: 10, y: 40 },
  },
  {
    p1: { x: 10, y: 40 },
    p2: { x: 20, y: 40 },
  },
  {
    p1: { x: 20, y: 40 },
    p2: { x: 30, y: 40 },
  },
  {
    p1: { x: 30, y: 40 },
    p2: { x: 40, y: 40 },
  },
  {
    p1: { x: 40, y: 40 },
    p2: { x: 50, y: 40 },
  },
]

const verticalSegments = [
  // 1st vertical line
  {
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 10 },
  },
  {
    p1: { x: 0, y: 10 },
    p2: { x: 0, y: 20 },
  },
  {
    p1: { x: 0, y: 20 },
    p2: { x: 0, y: 30 },
  },
  {
    p1: { x: 0, y: 30 },
    p2: { x: 0, y: 40 },
  },
  {
    p1: { x: 0, y: 40 },
    p2: { x: 0, y: 50 },
  },
  // 2nd vertical line
  {
    p1: { x: 10, y: 0 },
    p2: { x: 10, y: 10 },
  },
  {
    p1: { x: 10, y: 10 },
    p2: { x: 10, y: 20 },
  },
  {
    p1: { x: 10, y: 20 },
    p2: { x: 10, y: 30 },
  },
  {
    p1: { x: 10, y: 30 },
    p2: { x: 10, y: 40 },
  },
  {
    p1: { x: 10, y: 40 },
    p2: { x: 10, y: 50 },
  },
  // 3rd vertical line
  {
    p1: { x: 20, y: 0 },
    p2: { x: 20, y: 10 },
  },
  {
    p1: { x: 20, y: 10 },
    p2: { x: 20, y: 20 },
  },
  {
    p1: { x: 20, y: 20 },
    p2: { x: 20, y: 30 },
  },
  {
    p1: { x: 20, y: 30 },
    p2: { x: 20, y: 40 },
  },
  {
    p1: { x: 20, y: 40 },
    p2: { x: 20, y: 50 },
  },
  // 4th vertical line
  {
    p1: { x: 30, y: 0 },
    p2: { x: 30, y: 10 },
  },
  {
    p1: { x: 30, y: 10 },
    p2: { x: 30, y: 20 },
  },
  {
    p1: { x: 30, y: 20 },
    p2: { x: 30, y: 30 },
  },
  {
    p1: { x: 30, y: 30 },
    p2: { x: 30, y: 40 },
  },
  {
    p1: { x: 30, y: 40 },
    p2: { x: 30, y: 50 },
  },
  // 5th vertical line
  {
    p1: { x: 40, y: 0 },
    p2: { x: 40, y: 10 },
  },
  {
    p1: { x: 40, y: 10 },
    p2: { x: 40, y: 20 },
  },
  {
    p1: { x: 40, y: 20 },
    p2: { x: 40, y: 30 },
  },
  {
    p1: { x: 40, y: 30 },
    p2: { x: 40, y: 40 },
  },
  {
    p1: { x: 40, y: 40 },
    p2: { x: 40, y: 50 },
  },
]

const horizontalLines = [
  {
    p1: { x: 0, y: 0 },
    p2: { x: 50, y: 0 },
  },
  {
    p1: { x: 0, y: 10 },
    p2: { x: 50, y: 10 },
  },
  {
    p1: { x: 0, y: 20 },
    p2: { x: 50, y: 20 },
  },
  {
    p1: { x: 0, y: 30 },
    p2: { x: 50, y: 30 },
  },
  {
    p1: { x: 0, y: 40 },
    p2: { x: 50, y: 40 },
  },
]

const verticalLines = [
  {
    p1: { x: 0, y: 0 },
    p2: { x: 50, y: 0 },
  },
  {
    p1: { x: 0, y: 10 },
    p2: { x: 50, y: 10 },
  },
  {
    p1: { x: 0, y: 20 },
    p2: { x: 50, y: 20 },
  },
  {
    p1: { x: 0, y: 30 },
    p2: { x: 50, y: 30 },
  },
  {
    p1: { x: 0, y: 40 },
    p2: { x: 50, y: 40 },
  },
]

const chartData = {
  boundingBox: {
    p1: { x: 0, y: 0 },
    p2: { x: 50, y: 40 },
  },
  rowPositions: [0, 10, 20, 30, 40],
}

export default {
  chartData,
  horizontalLines,
  horizontalSegments,
  verticalLines,
  verticalSegments,
}
