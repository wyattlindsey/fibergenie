// import cannyEdgeDetector from 'canny-edge-detector'
import Image from 'image-js'

import dotProp from 'dot-prop'
import dv from 'ndv'
import gm from 'gm'
import fs from 'fs'

const MIN_IMAGE_WIDTH = 2048
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

    // save upscaled image to base directory
    const upscaledImagePath = await upscaleImage(
      originalImagePath,
      baseDirectoryPath
    )

    // prepare for edge detection
    const processedImagePath = await processImage(
      upscaledImagePath,
      baseDirectoryPath
    )
  } catch (e) {
    console.error(e)
    status = 500
  }

  // await img.save(`${baseDirectoryPath}/original.jpg`)

  // const upscaledImage = await upscaleImage(img)
  // await upscaledImage.save(`${baseDirectoryPath}/upscaled-3x.jpg`)
  //
  // const processedImage = processImage(baseDirectoryPath, 'upscaled-3x.jpg')
  // const { horizontalLines, verticalLines } = extractChartLines(processedImage)
  // const withLines = processedImage.toColor()
  //
  // horizontalLines.forEach(line => {
  //   withLines.drawLine(line.p1, line.p2, 2, 255, 0, 0)
  // })
  //
  // verticalLines.forEach(line => {
  //   withLines.drawLine(line.p1, line.p2, 2, 255, 0, 0)
  // })
  //
  // fs.writeFileSync(
  //   `${baseDirectoryPath}/with-lines.jpg`,
  //   withLines.toBuffer('jpg')
  // )
  //

  // delete temp file
  fs.unlinkSync(tmpFilePath)

  res.sendStatus(status)
}

const saveOriginal = (sourcePath, baseDir) => {
  return new Promise(resolve => {
    gm(sourcePath).write(`${baseDir}/original.jpg`, err => {
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

const upscaleImage = (sourcePath, baseDir) => {
  console.log(sourcePath, baseDir)
  return new Promise(resolve => {
    gm(sourcePath)
      .magnify(3)
      .write(`${baseDir}/upscaled-3x.jpg`, err => {
        if (!err) {
          resolve(`${baseDir}/upscaled-3x.jpg`)
        } else {
          throw 'Error upscaling image'
        }
      })
  }).catch(err => {
    console.error(err)
  })
}

const processImage = (sourcePath, basePath) => {
  try {
    // use some filters from GraphicsMagick
    gm(sourcePath)
      .despeckle()
      .write(`${basePath}/processed.jpg`, err => {
        if (err) {
          throw 'Error saving intermediate file'
        } else {
          // use some filters from DocumentVision
          const img = new dv.Image('jpg', fs.readFileSync(sourcePath))
          const gray = img.toGray('max')
          const monochrome = gray
            .threshold(210)
            .invert()
            .thin('bg', 8, 0)

          // todo img.findSkew()
          fs.writeFileSync(
            `${basePath}/processed-new.jpg`,
            monochrome.toBuffer('jpg')
          )
          return `${basePath}/processed.jpg`
        }
      })
  } catch (e) {
    console.error('Error processing image: ', e)
  }
}

const extractChartLines = img => {
  const lineSegments = img.toGray().lineSegments(6, 0, false)

  const mappedHorizontalSegments = {}
  const mappedVerticalSegments = {}
  const horizontalSegments = []
  const verticalSegments = []
  const maxDeviation = 2
  const minLength = 10

  // sort into horizontal and vertical segments
  lineSegments.forEach(seg => {
    const xDist = Math.abs(seg.p1.x - seg.p2.x)
    const yDist = Math.abs(seg.p1.y - seg.p2.y)

    if (xDist >= minLength && yDist <= maxDeviation) {
      horizontalSegments.push(seg)
    } else if (yDist >= minLength && xDist <= maxDeviation) {
      verticalSegments.push(seg)
    }
  })

  // group all co-linear segments by common coord
  horizontalSegments.forEach(seg => {
    const xCoord = seg.p1.x
    const yCoord = seg.p1.y

    const colinearSegmentsForYCoord = dotProp.get(
      mappedHorizontalSegments,
      `${yCoord}`,
      {
        minX: xCoord,
        maxX: xCoord,
        segments: [],
      }
    )

    const minX = Math.min(xCoord, colinearSegmentsForYCoord.minX)
    const maxX = Math.max(xCoord, colinearSegmentsForYCoord.maxX)

    mappedHorizontalSegments[yCoord] = {
      minX,
      maxX,
      segments: [...colinearSegmentsForYCoord.segments, seg],
    }
  })

  verticalSegments.forEach(seg => {
    const xCoord = seg.p1.x
    const yCoord = seg.p2.y

    const colinearSegmentsForXCoord = dotProp.get(
      mappedVerticalSegments,
      `${xCoord}`,
      {
        minY: yCoord,
        maxY: yCoord,
        segments: [],
      }
    )

    const minY = Math.min(yCoord, colinearSegmentsForXCoord.minY)

    const maxY = Math.max(yCoord, colinearSegmentsForXCoord.maxY)

    mappedVerticalSegments[xCoord] = {
      minY,
      maxY,
      segments: [...colinearSegmentsForXCoord.segments, seg],
    }
  })

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

  return {
    horizontalLines: horizontalSegments,
    verticalLines: verticalSegments,
  }
}

export default {
  upload,
}
