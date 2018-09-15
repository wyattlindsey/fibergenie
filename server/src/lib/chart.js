import dotProp from 'dot-prop'
import dv from 'ndv'
import fs from 'fs'

import type {
  Axis,
  BoundingBox,
  ChartData,
  Line,
  RowPositions,
  SegmentMap,
} from 'types/chart'
import type { ImageDimensions } from 'types/image'

type LineExtractionOptions = {
  maxSkew: number,
  maxShift: number,
  minLength: number,
  minSegments: number,
  gridTolerance: number,
}

const extractDirectionalLines = (
  lineSegments: Line[],
  axis: Axis = 'x',
  imageDimension: number,
  options?: LineExtractionOptions = {}
): { averageDistance: number, lines: Line[] } => {
  const isVertical = axis === 'y'
  const perpAxis: Axis = isVertical ? 'x' : 'y'

  /* options */
  // how far a line can fall outside of the mean distance between lines (% of mean distance)
  const gridTolerance = dotProp.get(options, 'gridTolerance', 10)

  // max perpendicular travel allowed for a segment to be considered horizontal or vertical (pixels)
  const maxSkew = dotProp.get(options, 'maxSkew', 2)

  // max perpendicular difference allowed for segments to be grouped together (+- pixels)
  const maxShift = dotProp.get(options, 'maxShift', 2)

  // min length of segment in pixels to be saved as part of a potential line
  const minLength = dotProp.get(options, 'minLength', 10)

  // min segments required for a group of co-linear segments to be considered a line
  const minSegments = dotProp.get(options, 'minSegments', 5)
  /* end options */

  // go through all the line segments and filter out short and non co-linear segments
  const directionalSegments: Line[] = lineSegments.filter(seg => {
    const colinearDistance = Math.abs(seg.p1[axis] - seg.p2[axis])
    const perpendicularDistance = Math.abs(seg.p1[perpAxis] - seg.p2[perpAxis])

    return colinearDistance >= minLength && perpendicularDistance <= maxSkew
  })

  // group them based on position along perpendicular of `axis`
  const mappedSegments: SegmentMap = directionalSegments.reduce(
    (segments, seg) => {
      const key = seg.p1[perpAxis]
      const length = Math.abs(seg.p2[axis] - seg.p1[axis])
      const maxColinearCoord = Math.max(seg.p2[axis], seg.p1[axis])
      const minColinearCoord = Math.min(seg.p2[axis], seg.p1[axis])

      // group this segment with other segments within +- `maxShift` pixels
      for (let i = 0; i <= maxShift * 2 + 1; i++) {
        const nearbyCoord = key - maxShift + i
        const candidate = segments[nearbyCoord]

        if (candidate) {
          segments[nearbyCoord] = {
            [`max${perpAxis}`]: Math.max(key, candidate[`max${perpAxis}`]),
            [`min${perpAxis}`]: Math.min(key, candidate[`min${perpAxis}`]),
            [`max${axis}`]: Math.max(maxColinearCoord, candidate[`max${axis}`]),
            [`min${axis}`]: Math.min(minColinearCoord, candidate[`min${axis}`]),
            segments: [...candidate.segments, seg],
            totalLength: candidate.totalLength + length,
          }
          break
        }

        // nothing was found so initialize a new object
        if (i === maxShift * 2 + 1) {
          segments[key] = {
            [`max${perpAxis}`]: key,
            [`min${perpAxis}`]: key,
            [`max${axis}`]: maxColinearCoord,
            [`min${axis}`]: minColinearCoord,
            segments: [seg],
            totalLength: length,
          }
        }
      }

      return segments
    },
    {}
  )

  // make a collection of lines by filtering out just those with a lot of co-linear segments or those segments
  // that are unusually large
  const directionalLines: SegmentMap = Object.keys(
    mappedSegments
  ).reduce((lines, key) => {
    const { segments, totalLength } = mappedSegments[key]

    if (segments.length >= minSegments || totalLength > imageDimension / 10) {
      dotProp.set(lines, key, mappedSegments[key])
    }

    return lines
  }, {})

  // move lines to the midpoint between the min and max segments found
  const normalizedLines: SegmentMap = Object.keys(
    directionalLines
  ).reduce((lines, key) => {
    const {
      [`max${perpAxis}`]: max,
      [`min${perpAxis}`]: min,
    } = directionalLines[key]

    const midPoint = min + Math.floor((max - min) / 2)

    lines[midPoint] = directionalLines[key]

    return lines
  }, {})

  // filter out any lines that don't fall within the average delta (perpendicular axis) of the line collection
  // sort key values just in case
  const sortedKeys = Object.keys(normalizedLines)
    .sort((a, b) => Number.parseInt(a) - Number.parseInt(b))
    .map(v => Number.parseInt(v))

  const meanDelta: number = sortedKeys.reduce((agg, v, i, arr) => {
    if (i === arr.length - 1) {
      agg.push(v - arr[i - 1])
      agg.sort()
      return agg[Math.floor(arr.length / 2)]
    } else if (i > 0) {
      agg.push(arr[i + 1] - v)
    }

    return agg
  }, [])

  const tolerance = meanDelta * gridTolerance / 100

  // split perp. axis values in half and move from the middle out to determine if other lines are within tolerance
  const midPointIndex = Math.floor(sortedKeys.length / 2)

  // move in forward direction from midpoint to beginning, which requires 2 reverses to iterate in the correct order
  const keysA: number[] = sortedKeys
    .slice(0, midPointIndex + 1)
    .reverse()
    .filter((v, i, arr) => {
      const dist = i === 0 ? v - arr[i + 1] : arr[i - 1] - v
      return dist >= meanDelta - tolerance && dist < meanDelta + tolerance
    })
    .reverse()

  // move from midpoint to end of yValuesSorted comparing always to the previous line for tolerance
  const keysB: number[] = sortedKeys
    .slice(midPointIndex)
    .filter((v, i, arr) => {
      const dist = v - arr[i - 1]
      return dist >= meanDelta - tolerance && dist < meanDelta + tolerance
    })

  const joinedKeys = [...keysA, ...keysB]

  let groupIndex = 0

  const groups: number[][] = joinedKeys.reduce(
    (all, v, i, arr) => {
      // check if current value and next value are within tolerance
      // otherwise start a new group
      const distToNext = arr[i + 1] - v

      all[groupIndex].push(v)

      if (distToNext > meanDelta + tolerance) {
        // outside of tolerance - increment groupIndex
        groupIndex++
        all.push([])
      }

      return all
    },
    [[]]
  )

  // todo allow for multiple charts per page
  const biggestGroup: number[] = groups.reduce(
    (biggest, group) =>
      Math.max(biggest.length, group.length) === group.length ? group : biggest
  )

  return {
    averageDistance: meanDelta,
    lines: biggestGroup.map(key => {
      const min = dotProp.get(normalizedLines, `${key}.min${axis}`)
      const max = dotProp.get(normalizedLines, `${key}.max${axis}`)
      return {
        p1: {
          [`${axis}`]: min,
          [`${perpAxis}`]: key,
        },
        p2: {
          [`${axis}`]: max,
          [`${perpAxis}`]: key,
        },
      }
    }),
  }
}

const extractLines = (
  sourcePath: string,
  targetDimensions: ImageDimensions
): ChartData => {
  const img = new dv.Image('png', fs.readFileSync(sourcePath))
  const segments = img.toGray().lineSegments(6, 0, false)

  const sourceDimensions: ImageDimensions = {
    height: img.height,
    width: img.width,
  }

  const {
    averageDistance: averageYDistance,
    lines: horizontalLines,
  } = extractDirectionalLines(segments, 'x', sourceDimensions.width)
  const {
    averageDistance: averageXDistance,
    lines: verticalLines,
  } = extractDirectionalLines(segments, 'y', sourceDimensions.height, {
    minLength: Math.ceil(averageYDistance / 3),
    minSegments: 8,
  })

  if (horizontalLines.length === 0 || verticalLines.length === 0) return

  // find the mean endpoints for each set of lines
  const meanMinXEndpoint = horizontalLines
    .map(line => line.p1.x)
    .sort((a, b) => a - b)
    .find((x, i, arr) => i === Math.floor(arr.length / 2))
  const meanMaxXEndpoint = horizontalLines
    .map(line => line.p2.x)
    .sort((a, b) => a - b)
    .find((x, i, arr) => i === Math.floor(arr.length / 2))
  const meanMinYEndpoint = verticalLines
    .map(line => line.p1.y)
    .sort((a, b) => a - b)
    .find((y, i, arr) => i === Math.floor(arr.length / 2))
  const meanMaxYEndpoint = verticalLines
    .map(line => line.p2.y)
    .sort((a, b) => a - b)
    .find((y, i, arr) => i === Math.floor(arr.length / 2))

  const verticalTolerance = averageYDistance * 0.1

  const filteredHorizontalLines = horizontalLines.filter(
    line =>
      line.p1.y >= meanMinYEndpoint - verticalTolerance &&
      line.p1.y <= meanMaxYEndpoint + verticalTolerance
  )

  const boundingBox = {
    p1: {
      x: meanMinXEndpoint,
      y: meanMinYEndpoint,
    },
    p2: {
      x: meanMaxXEndpoint,
      y: meanMaxYEndpoint,
    },
  }

  // check if the leftmost vertical line is less than the meanMinXEndpoint
  // if it is, add another line at the beginning at max of 0 or vertical line minX - averageXDistance
  const firstVerticalLine: Line = verticalLines[0]
  if (firstVerticalLine.p1.x > meanMinXEndpoint + averageXDistance * 0.1) {
    const minX = Math.max(0, firstVerticalLine.p1.x - averageXDistance)

    boundingBox.p1.x = Math.min(minX, meanMinXEndpoint)

    verticalLines.unshift({
      p1: {
        x: minX,
        y: firstVerticalLine.p1.y,
      },
      p2: {
        x: minX,
        y: firstVerticalLine.p2.y,
      },
    })
  }

  // check if rightmost vertical line is more than meanMaxXEndpoint
  // if it is, add another line at the end of the array at min of target dims or maxX + averageXDistance
  const lastVerticalLine: Line = verticalLines[verticalLines.length - 1]
  if (lastVerticalLine.p1.x < meanMaxXEndpoint - averageXDistance * 0.1) {
    const maxX = Math.min(img.width, lastVerticalLine.p1.x + averageXDistance)

    boundingBox.p2.x = Math.max(maxX, meanMaxXEndpoint)

    verticalLines.push({
      p1: {
        x: maxX,
        y: lastVerticalLine.p1.y,
      },
      p2: {
        x: maxX,
        y: lastVerticalLine.p2.y,
      },
    })
  }

  const firstHorizontalLine: Line = filteredHorizontalLines[0]
  if (firstHorizontalLine.p1.y > meanMinYEndpoint + averageYDistance * 0.1) {
    const minY = Math.max(0, firstHorizontalLine.p1.y - averageYDistance)

    boundingBox.p1.y = Math.min(minY, meanMinYEndpoint)

    filteredHorizontalLines.unshift({
      p1: {
        x: firstHorizontalLine.p1.x,
        y: minY,
      },
      p2: {
        x: firstHorizontalLine.p2.x,
        y: minY,
      },
    })
  }

  const lastHorizontalLine: Line =
    filteredHorizontalLines[filteredHorizontalLines.length - 1]
  if (lastHorizontalLine.p1.y < meanMaxYEndpoint - averageYDistance * 0.1) {
    const maxY = Math.min(
      img.height,
      lastHorizontalLine.p1.y + averageYDistance
    )

    boundingBox.p2.y = Math.max(maxY, meanMaxYEndpoint)

    filteredHorizontalLines.push({
      p1: {
        x: lastHorizontalLine.p1.x,
        y: maxY,
      },
      p2: {
        x: lastHorizontalLine.p2.x,
        y: maxY,
      },
    })
  }

  const rowPositions: RowPositions = filteredHorizontalLines.map(
    line => line.p1.y
  )

  // adjust bounding box one last time to match first and last chart lines
  boundingBox.p1.y = Math.min(boundingBox.p1.y, rowPositions[0])
  boundingBox.p2.y = Math.max(
    boundingBox.p2.y,
    rowPositions[rowPositions.length - 1]
  )

  return resizeChartLines(
    { boundingBox, rowPositions },
    sourceDimensions,
    targetDimensions
  )
}

const resizeChartLines = (
  chartData: ChartData,
  sourceDimensions: ImageDimensions,
  targetDimensions: ImageDimensions
): ChartData => {
  const { boundingBox, rowPositions } = chartData
  if (!boundingBox || !rowPositions) return

  const ratio = targetDimensions.width / sourceDimensions.width

  const resizedBoundingBox: BoundingBox = {
    p1: {
      x: Math.ceil(boundingBox.p1.x * ratio),
      y: Math.ceil(boundingBox.p1.y * ratio),
    },
    p2: {
      x: Math.ceil(boundingBox.p2.x * ratio),
      y: Math.ceil(boundingBox.p2.y * ratio),
    },
  }

  const resizedRowPositions: RowPositions = rowPositions.map(row =>
    Math.ceil(row * ratio)
  )

  return { boundingBox: resizedBoundingBox, rowPositions: resizedRowPositions }
}

const drawLines = (
  sourcePath: string,
  baseDir: string,
  chartData: ChartData
) => {
  const img = new dv.Image('png', fs.readFileSync(sourcePath))
  const withLines = img.toColor()

  const { p1, p2 } = chartData.boundingBox

  chartData.rowPositions.forEach(y => {
    withLines.drawLine({ x: p1.x, y }, { x: p2.x, y }, 2, 206, 28, 85)
  })

  withLines.drawLine({ x: p1.x, y: p1.y }, { x: p2.x, y: p1.y }, 3, 28, 206, 99)
  withLines.drawLine({ x: p2.x, y: p1.y }, { x: p2.x, y: p2.y }, 3, 28, 206, 99)
  withLines.drawLine({ x: p2.x, y: p2.y }, { x: p1.x, y: p2.y }, 3, 28, 206, 99)
  withLines.drawLine({ x: p1.x, y: p2.y }, { x: p1.x, y: p1.y }, 3, 28, 206, 99)

  fs.writeFileSync(`${baseDir}/with-lines.png`, withLines.toBuffer('png'))
}

export default {
  drawLines,
  extractDirectionalLines,
  extractLines,
  resizeChartLines,
}
