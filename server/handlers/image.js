import dotProp from 'dot-prop'
import dv from 'ndv'
import gm from 'gm'
import fs from 'fs'
import PDFConverter from 'pdf2pic'

const TARGET_IMAGE_DIMS = 2048
const UPLOADS_FOLDER = 'public/uploads'

const upload = async (req, res) => {
  // todo handle no file uploaded

  let status = 201
  let tmpFilePath = dotProp.get(req, 'file.path')
  const tmpFileName = dotProp.get(req, 'file.filename')
  const baseDirectoryPath = `${UPLOADS_FOLDER}/${tmpFileName}`
  const isPDF = dotProp.get(req, 'file.mimetype') === 'application/pdf'

  try {
    // initialize folder and save original
    fs.mkdirSync(baseDirectoryPath)
    let originalImagePath

    if (isPDF) {
      const pdfPath = `${tmpFilePath}.pdf`
      fs.renameSync(tmpFilePath, pdfPath)
      tmpFilePath = pdfPath
      originalImagePath = await convertPDF(pdfPath, baseDirectoryPath)
    } else {
      originalImagePath = await saveOriginal(
        tmpFilePath,
        baseDirectoryPath
      )
    }

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

    const { horizontalLines, segments } = extractChartLines(processedImagePath)
    drawLines(processedImagePath, baseDirectoryPath, horizontalLines)
    drawSegments(processedImagePath, baseDirectoryPath, segments)
  } catch (e) {
    console.error(e)
    status = 500
  }

  // delete temp file
  fs.unlinkSync(tmpFilePath)

  res.sendStatus(status)
}

const convertPDF = (sourcePath, baseDir) => {
  return new Promise(resolve => {
    const converter = new PDFConverter({
      density: 72,
      format: 'png',
      savedir: baseDir,
      savename: `original`,
      size: TARGET_IMAGE_DIMS,
    })

    converter.convert(sourcePath).then(res => {
      const convertedPath = dotProp.get(res, 'path')
      resolve(convertedPath)
    })
  }).catch(err => {
    console.error(err)
  })
}

const saveOriginal = (sourcePath, baseDir) => {
  return new Promise(resolve => {
    gm(sourcePath)
      .setFormat('png')
      .write(`${baseDir}/original.png`, err => {
        if (!err) {
          resolve(`${baseDir}/original.png`)
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
      .write(`${baseDir}/resized-${TARGET_IMAGE_DIMS}.png`, err => {
        if (!err) {
          resolve(`${baseDir}/resized-${TARGET_IMAGE_DIMS}.png`)
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
      .write(`${basePath}/processed.png`, err => {
        if (err) {
          throw 'Error saving intermediate file'
        } else {
          // use some filters from DocumentVision
          const img = new dv.Image(
            'png',
            fs.readFileSync(`${basePath}/processed.png`)
          )
          const gray = img.toGray('max')
          const monochrome = gray
            .threshold(210)
            .invert()
            .thin('bg', 8, 0)

          // todo img.findSkew()
          fs.writeFileSync(
            `${basePath}/processed.png`,
            monochrome.toBuffer('png')
          )
          resolve(`${basePath}/processed.png`)
        }
      })
  }).catch(e => {
    console.error('Error processing image: ', e)
  })
}

const extractChartLines = sourcePath => {
  const img = new dv.Image('png', fs.readFileSync(sourcePath))
  const lineSegments = img.toGray().lineSegments(6, 0, false)

  // remove duplicate lines for similar y positions

  const mappedHorizontalSegments = {}
  const horizontalSegments = []
  const maxSkew = 2 // max y travel allowed for a segment to be considered horizontal (pixels)
  const maxShift = 2 // max vertical difference allowed for segments to be grouped together (+- pixels)
  const minLength = 10 // min width of segment to be collected
  const minSegments = 5 // min segments required for a group of co-linear segments to be considered a line
  const gridTolerance = 15 // how far a line can fall outside of the mean distance between lines (% of mean distance)

  // go through all the line segments and filter out short and non-horizontal segments
  lineSegments.forEach(seg => {
    const xDist = Math.abs(seg.p1.x - seg.p2.x)
    const yDist = Math.abs(seg.p1.y - seg.p2.y)

    if (xDist >= minLength && yDist <= maxSkew) {
      horizontalSegments.push(seg)
    }
  })

  // group them based on y position
  horizontalSegments.forEach(seg => {
    const yCoord = seg.p1.y
    const length = Math.abs(seg.p2.x - seg.p1.x)

    // group this segment with other segments within +- `maxShift` pixels
    for (let i = 0; i <= maxShift * 2 + 1; i++) {
      const nearbyYCoord = yCoord - maxShift + i
      if (mappedHorizontalSegments[nearbyYCoord]) {
        mappedHorizontalSegments[nearbyYCoord] = {
          segments: [...mappedHorizontalSegments[nearbyYCoord].segments, seg],
          totalLength:
            mappedHorizontalSegments[nearbyYCoord].totalLength + length,
        }
        break
      }

      // nothing was found so initialize a new object
      if (i === maxShift * 2 + 1) {
        mappedHorizontalSegments[yCoord] = {
          segments: [seg],
          totalLength: length,
        }
      }
    }
  })

  // make a collection of horizontal lines by filtering out just those with a lot of co-linear segments
  const horizontalLines = Object.keys(
    mappedHorizontalSegments
  ).reduce((lines, yCoord) => {
    const { segments, totalLength } = mappedHorizontalSegments[yCoord]

    if (segments.length >= minSegments || totalLength > TARGET_IMAGE_DIMS / 2) {
      dotProp.set(lines, yCoord, true)
    }
    return lines
  }, {})

  // filter out any lines that don't fall within the average delta-y of the line collection
  // sort key values just in case
  const yValuesSorted = Object.keys(horizontalLines)
    .sort((a, b) => Number.parseInt(a) - Number.parseInt(b))
    .map(v => Number.parseInt(v))

  const meanDeltaY = yValuesSorted.reduce((agg, v, i, arr) => {
    if (i === arr.length - 1) {
      agg.push(v - arr[i - 1])
      agg.sort()
      return agg[Math.floor(arr.length / 2)]
    } else if (i > 0) {
      agg.push(arr[i + 1] - v)
    }

    return agg
  }, [])

  const tolerance = meanDeltaY * gridTolerance / 100

  const finalYValues = yValuesSorted.filter((v, i, arr) => {
    if (i !== arr.length - 1) {
      const yDist = arr[i + 1] - v
      if (yDist >= meanDeltaY - tolerance && yDist < meanDeltaY + tolerance) {
        return true
      }
    } else {
      const yDist = v - arr[i - 1]
      if (yDist >= meanDeltaY - tolerance && yDist < meanDeltaY + tolerance) {
        return true
      }
    }
  })

  return { horizontalLines: finalYValues, segments: horizontalSegments }
}

const drawSegments = (sourcePath, baseDir, segments) => {
  const img = new dv.Image('png', fs.readFileSync(sourcePath))
  const withSegments = img.toColor()

  segments.forEach(seg => {
    withSegments.drawLine(
      { x: seg.p1.x, y: seg.p1.y },
      { x: seg.p2.x, y: seg.p2.y },
      1,
      0,
      255,
      255
    )
  })

  fs.writeFileSync(`${baseDir}/with-segments.png`, withSegments.toBuffer('png'))
}

const drawLines = (sourcePath, baseDir, lines) => {
  const img = new dv.Image('png', fs.readFileSync(sourcePath))
  const withLines = img.toColor()

  lines.forEach(y => {
    withLines.drawLine({ x: 0, y }, { x: TARGET_IMAGE_DIMS, y }, 2, 255, 0, 0)
  })

  fs.writeFileSync(`${baseDir}/with-lines.png`, withLines.toBuffer('png'))
}

export default {
  upload,
}
