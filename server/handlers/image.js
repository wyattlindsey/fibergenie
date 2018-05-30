import dotProp from 'dot-prop'
import dv from 'ndv'
import gm from 'gm'
import fs from 'fs'

const TARGET_IMAGE_DIMS = 2048
const UPLOADS_FOLDER = 'public/uploads'

const upload = async (req, res) => {
  let status = 201
  const tmpFilePath = dotProp.get(req, 'file.path')
  const tmpFileName = dotProp.get(req, 'file.filename')
  const baseDirectoryPath = `${UPLOADS_FOLDER}/${tmpFileName}`

  try {
    // initialize folder and save original
    fs.mkdirSync(baseDirectoryPath)
    const originalImagePath = await saveOriginal(tmpFilePath, baseDirectoryPath)

    // save resized image to base directory
    const resizedImagePath = await resizeImage(
      originalImagePath,
      baseDirectoryPath
    )

    // prepare for edge detection
    const processedImagePath = await processImage(
      resizedImagePath,
      baseDirectoryPath
    )

    const horizontalLines = extractChartLines(processedImagePath)
    drawLines(processedImagePath, baseDirectoryPath, horizontalLines)
  } catch (e) {
    console.error(e)
    status = 500
  }

  // delete temp file
  fs.unlinkSync(tmpFilePath)

  res.sendStatus(status)
}

const saveOriginal = (sourcePath, baseDir) => {
  return new Promise(resolve => {
    gm(sourcePath)
      .setFormat('jpg')
      .write(`${baseDir}/original.jpg`, err => {
        if (!err) {
          resolve(`${baseDir}/original.jpg`)
        } else {
          throw 'Error saving original image'
        }
      })
  }).catch(err => {
    console.error(err)
  })
}

const resizeImage = (sourcePath, baseDir) => {
  return new Promise(resolve => {
    gm(sourcePath)
      .resize(TARGET_IMAGE_DIMS, TARGET_IMAGE_DIMS)
      .write(`${baseDir}/resized-${TARGET_IMAGE_DIMS}.jpg`, err => {
        if (!err) {
          resolve(`${baseDir}/resized-${TARGET_IMAGE_DIMS}.jpg`)
        } else {
          throw 'Error resizing image'
        }
      })
  }).catch(err => {
    console.error(err)
  })
}

const processImage = async (sourcePath, basePath) => {
  return new Promise(resolve => {
    // use some filters from GraphicsMagick
    gm(sourcePath)
      .despeckle()
      .write(`${basePath}/processed.jpg`, err => {
        if (err) {
          throw 'Error saving intermediate file'
        } else {
          // use some filters from DocumentVision
          const img = new dv.Image(
            'jpg',
            fs.readFileSync(`${basePath}/processed.jpg`)
          )
          const gray = img.toGray('max')
          const monochrome = gray
            .threshold(210)
            .invert()
            .thin('bg', 8, 0)

          // todo img.findSkew()
          fs.writeFileSync(
            `${basePath}/processed.jpg`,
            monochrome.toBuffer('jpg')
          )
          resolve(`${basePath}/processed.jpg`)
        }
      })
  }).catch(e => {
    console.error('Error processing image: ', e)
  })
}

const extractChartLines = sourcePath => {
  const img = new dv.Image('jpg', fs.readFileSync(sourcePath))
  const lineSegments = img.toGray().lineSegments(6, 0, false)

  // remove duplicate lines for similar y positions

  const mappedHorizontalSegments = {}
  const horizontalSegments = []
  const maxDeviation = 2
  const minLength = 10
  const minSegments = 5
  const toleranceFactor = 6

  // go through all the line segments and filter out short and non-horizontal segments
  lineSegments.forEach(seg => {
    const xDist = Math.abs(seg.p1.x - seg.p2.x)
    const yDist = Math.abs(seg.p1.y - seg.p2.y)

    if (xDist >= minLength && yDist <= maxDeviation) {
      horizontalSegments.push(seg)
    }
  })

  // group them based on y position
  horizontalSegments.forEach(seg => {
    const yCoord = seg.p1.y

    const colinearSegmentsForYCoord = dotProp.get(
      mappedHorizontalSegments,
      `${yCoord}`,
      []
    )

    // todo check around base for others before starting a new segment coord

    mappedHorizontalSegments[yCoord] = [...colinearSegmentsForYCoord, yCoord]
  })

  // make a collection of horizontal lines by filtering out just those with a lot of co-linear segments
  const horizontalLines = Object.keys(
    mappedHorizontalSegments
  ).reduce((lines, yCoord) => {
    const segments = mappedHorizontalSegments[yCoord]

    if (segments.length >= minSegments) {
      dotProp.set(lines, yCoord, true)
    }
    return lines
  }, {})

  // filter out any lines that don't fall within the average delta-y of the line collection
  // sort key values just in case
  const yValuesSorted = Object.keys(horizontalLines)
    .sort((a, b) => Number.parseInt(a) - Number.parseInt(b))
    .map(v => Number.parseInt(v))

  const averageDeltaY = yValuesSorted.reduce((agg, v, i, arr) => {
    if (i === arr.length - 1) {
      return (agg + (v - arr[i - 1])) / arr.length
    } else if (i > 0) {
      return agg + (v - arr[i - 1])
    } else {
      return agg
    }
  }, 0)

  const tolerance = averageDeltaY / toleranceFactor

  const finalYValues = yValuesSorted.filter((v, i, arr) => {
    if (i !== arr.length - 1) {
      const yDist = arr[i + 1] - v
      if (
        yDist >= averageDeltaY - tolerance &&
        yDist < averageDeltaY + tolerance
      ) {
        return true
      }
    } else {
      const yDist = v - arr[i - 1]
      if (
        yDist >= averageDeltaY - tolerance &&
        yDist < averageDeltaY + tolerance
      ) {
        return true
      }
    }
  })

  console.log('finalYValues', finalYValues)

  // get the mean stretch in horizontal and vertical directions
  // todo instead get the most common, with a small tolerance
  // const horizontalSegmentStartMap = {}
  // const horizontalSegmentEndMap = {}
  // // todo reduce to most common min and max X for horizontal and most common min and max Y for vertical
  // Object.keys(mappedHorizontalSegments).forEach(key => {
  //   const xCoord = Number.parseInt(key)
  //   const horizontalSegmentsForX = mappedHorizontalSegments[key]
  //
  //   const startCount = dotProp.get(horizontalSegmentStartMap, key, 0)
  //   dotProp.set(horizontalSegmentStartMap, xCoord, startCount + 1)
  //
  //   const endCount = dotProp.get(horizontalSegmentEndMap, key, 0)
  //   dotProp.set(
  //     horizontalSegmentEndMap,
  //     horizontalSegmentsForX.maxX,
  //     endCount + 1
  //   )
  // })
  //
  // let minY
  // let maxY
  // Object.keys(mappedVerticalSegments).forEach(key => {
  //   const yCoord = Number.parseInt(key)
  //   minY = minY ? Math.min(yCoord, minY) : yCoord
  //   maxY = maxY ? Math.max(yCoord, maxY) : yCoord
  // })
  //
  // // find only the co-linear segments with an appreciable number of segments
  // const groupedHorizontalSegments = []
  // const groupedVerticalSegments = []
  //
  // Object.keys(mappedHorizontalSegments).forEach(key => {
  //   const v = mappedHorizontalSegments[key]
  //
  //   if (v.segments.length > 5) {
  //     groupedHorizontalSegments.push({
  //       p1: { x: minX, y: v.segments[0].p1.y },
  //       p2: { x: maxX, y: v.segments[0].p1.y },
  //     })
  //   }
  // })
  //
  // Object.keys(mappedVerticalSegments).forEach(key => {
  //   const v = mappedVerticalSegments[key]
  //
  //   if (v.segments.length > 5) {
  //     groupedVerticalSegments.push({
  //       p1: { x: v.segments[0].p1.x, y: minY },
  //       p2: { x: v.segments[0].p1.x, y: maxY },
  //     })
  //   }
  // })

  // cull lines that are close to each other

  return finalYValues
}

const drawLines = (sourcePath, baseDir, lines) => {
  const img = new dv.Image('jpg', fs.readFileSync(sourcePath))
  const withLines = img.toColor()

  lines.forEach(y => {
    withLines.drawLine({ x: 0, y }, { x: TARGET_IMAGE_DIMS, y }, 2, 255, 0, 0)
  })

  fs.writeFileSync(`${baseDir}/with-lines.jpg`, withLines.toBuffer('jpg'))
}

export default {
  upload,
}
