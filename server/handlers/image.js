import dotProp from 'dot-prop'
import dv from 'ndv'
import gm from 'gm'
import fs from 'fs'
import noop from 'lodash/noop'
import PDFConverter from 'pdf2pic'
import rimraf from 'rimraf'

const TARGET_IMAGE_DIMS = 2048
const UPLOADS_FOLDER = 'public/uploads'
const PAGE_PREFIX = 'page_'

// input is an image
// output is an array of objects, one per chart, each containing grid information like line coords

// pdf result in multiple images
// output is still array of objects, one obj per chart, but results are per-page

// upload() mainly kicks off the process and returns the results
// processPage() runs a directory of images through the process of getting chart lines
// convertPDF() creates any additional directories needed to support more pages

const upload = async (req, res) => {
  // todo handle no file uploaded

  let status = 201
  const fileId = dotProp.get(req, 'file.filename')
  const tmpFilePath = dotProp.get(req, 'file.path')

  const { baseDirectory, err } = prepareDirectories(fileId)

  if (err) {
    status = 500
  } else {
    await processUpload(req.file, baseDirectory)
    // delete temp file
    fs.unlinkSync(tmpFilePath)
  }

  res.sendStatus(status)
}

const prepareDirectories = id => {
  const res = { baseDirectory: '', err: null }

  try {
    const baseDirectoryPath = `${UPLOADS_FOLDER}/${id}`
    fs.mkdirSync(baseDirectoryPath)
    fs.mkdirSync(`${baseDirectoryPath}/page_1`)
    res.baseDirectory = baseDirectoryPath
  } catch (e) {
    console.error(e)
    res.err = e
  }

  return res
}

const processUpload = async (file, destDir) => {
  try {
    if (!file) return null
    const { mimetype, path: sourcePath } = file
    const isPDF = mimetype === 'application/pdf'

    if (isPDF) {
      const convertedPath = `${destDir}/converted_pdf_pages`
      // add pdf extension to filename to help with conversion
      const pdfPath = `${sourcePath}.pdf`
      fs.renameSync(sourcePath, pdfPath)

      const PDFs = await convertPDF(pdfPath, convertedPath)

      // remove '.pdf' extension so upload() handler can delete it with the original filename
      fs.renameSync(pdfPath, sourcePath)

      // process each page from the source PDF
      const processedPages = PDFs.map(async (pdf, i) => {
        // create new subdirectory for page if this is a multi-page PDF
        // note that `../page_1/` was already created
        const directoryForPage = `${destDir}/${PAGE_PREFIX}${i + 1}`

        if (i > 0) {
          fs.mkdirSync(directoryForPage)
        }

        return await processPage(pdf.path, directoryForPage)
      })

      const pages = await Promise.all(processedPages)

      // remove temporary directory used for pdf conversion
      rimraf(convertedPath, noop)

      return pages
    } else {
      const processedPage = await processPage(
        sourcePath,
        `${destDir}/${PAGE_PREFIX}${1}`
      )
      return [processedPage]
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}

const processPage = async (sourcePath, baseDir) => {
  // save original
  const originalPath = await saveOriginal(sourcePath, baseDir)

  // resize
  const resizedImagePath = await resizeImage(originalPath, baseDir)

  // prepare for chart scanning
  const preparedImagePath = await prepareImage(resizedImagePath, baseDir)

  // process chart
  const results = extractChartLines(preparedImagePath)

  if (process.env.NODE_ENV === 'development') {
    // create images with lines and segments drawn directly on the image at preparedImagePath
    // for research and troubleshooting
    const { lines, segments } = results
    drawLines(preparedImagePath, baseDir, lines)
    drawSegments(preparedImagePath, baseDir, segments)
  }

  return results
}

const convertPDF = (sourcePath, baseDir) => {
  const converter = new PDFConverter({
    density: 300,
    format: 'png',
    savedir: baseDir,
    savename: `original`,
    size: TARGET_IMAGE_DIMS,
  })

  return converter.convertBulk(sourcePath, -1)
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

const prepareImage = async (sourcePath, basePath) => {
  return new Promise(resolve => {
    // use some filters from GraphicsMagick
    gm(sourcePath)
      .despeckle()
      .write(`${basePath}/prepared.png`, err => {
        if (err) {
          throw 'Error saving intermediate file'
        } else {
          // use some filters from DocumentVision
          const img = new dv.Image(
            'png',
            fs.readFileSync(`${basePath}/prepared.png`)
          )
          const gray = img.toGray('max')
          const monochrome = gray.threshold(210).invert()
          const { angle } = monochrome.findSkew()

          const deskewed = monochrome.rotate(angle)
          const final = deskewed.thin('bg', 8, 0)

          fs.writeFileSync(`${basePath}/prepared.png`, final.toBuffer('png'))
          resolve(`${basePath}/prepared.png`)
        }
      })
  }).catch(e => {
    console.error('Error processing image: ', e)
  })
}

const extractLines = (lineSegments, axis = 'x', options = {}) => {
  const isVertical = axis === 'y'
  const perpAxis = isVertical ? 'x' : 'y'

  /* options */
  // max perpendicular travel allowed for a segment to be considered horizontal or vertical (pixels)
  const maxSkew = dotProp.get(options, 'maxSkew', 2)

  // max perpendicular difference allowed for segments to be grouped together (+- pixels)
  const maxShift = dotProp.get(options, 'maxShift', 2)

  // min length of segment in pixels to be saved as part of a potential line
  const minLength = dotProp.get(options, 'minLength', 10)

  // min segments required for a group of co-linear segments to be considered a line
  const minSegments = dotProp.get(options, 'minSegments', 5)

  // how far a line can fall outside of the mean distance between lines (% of mean distance)
  const gridTolerance = dotProp.get(options, 'gridTolerance', 10)

  // go through all the line segments and filter out short and non co-linear segments
  const directionalSegments = lineSegments.filter(seg => {
    const colinearDistance = Math.abs(seg.p1[axis] - seg.p2[axis])
    const perpendicularDistance = Math.abs(seg.p1[perpAxis] - seg.p2[perpAxis])

    return colinearDistance >= minLength && perpendicularDistance <= maxSkew
  })

  // group them based on position along perpendicular of `axis`
  const mappedSegments = directionalSegments.reduce((segments, seg) => {
    const key = seg.p1[perpAxis]
    const length = Math.abs(seg.p2[axis] - seg.p1[axis])

    // group this segment with other segments within +- `maxShift` pixels
    for (let i = 0; i <= maxShift * 2 + 1; i++) {
      const nearbyCoord = key - maxShift + i
      const candidate = segments[nearbyCoord]

      if (candidate) {
        segments[nearbyCoord] = {
          [`max${perpAxis}`]: Math.max(key, candidate[`max${perpAxis}`]),
          [`min${perpAxis}`]: Math.min(key, candidate[`min${perpAxis}`]),
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
          segments: [seg],
          totalLength: length,
        }
      }
    }

    return segments
  }, {})

  // make a collection of lines by filtering out just those with a lot of co-linear segments or those segments
  // that are unusually large
  const directionalLines = Object.keys(mappedSegments).reduce((lines, key) => {
    const { segments, totalLength } = mappedSegments[key]

    if (
      segments.length >= minSegments ||
      totalLength > TARGET_IMAGE_DIMS / 10
    ) {
      dotProp.set(lines, key, mappedSegments[key])
    }

    return lines
  }, {})

  // move lines to the midpoint between the min and max segments found
  const averagedLines = Object.keys(directionalLines).reduce((lines, key) => {
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
  const sortedKeys = Object.keys(averagedLines)
    .sort((a, b) => Number.parseInt(a) - Number.parseInt(b))
    .map(v => Number.parseInt(v))

  const meanDelta = sortedKeys.reduce((agg, v, i, arr) => {
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
  const keysA = sortedKeys
    .slice(0, midPointIndex + 1)
    .reverse()
    .filter((v, i, arr) => {
      const dist = i === 0 ? v - arr[i + 1] : arr[i - 1] - v
      return dist >= meanDelta - tolerance && dist < meanDelta + tolerance
    })
    .reverse()

  // move from midpoint to end of yValuesSorted comparing always to the previous line for tolerance
  const keysB = sortedKeys.slice(midPointIndex).filter((v, i, arr) => {
    const dist = v - arr[i - 1]
    return dist >= meanDelta - tolerance && dist < meanDelta + tolerance
  })

  const joinedKeys = [...keysA, ...keysB]

  let groupIndex = 0

  const groups = joinedKeys.reduce(
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
  const biggestGroup = groups.reduce(
    (biggest, group) =>
      Math.max(biggest.length, group.length) === group.length ? group : biggest
  )

  return biggestGroup
}

const extractChartLines = sourcePath => {
  const img = new dv.Image('png', fs.readFileSync(sourcePath))
  const lineSegments = img.toGray().lineSegments(6, 0, false)

  const horizontalLines = extractLines(lineSegments, 'x')
  // const verticalLines = extractLines(lineSegments, 'y')

  // now that we have a list of coords in either axis for lines, use that information to determine where the chart
  // edges are

  return { lines: horizontalLines, segments: lineSegments }
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

  lines.forEach(line => {
    withLines.drawLine(
      { x: 0, y: line },
      { x: TARGET_IMAGE_DIMS, y: line },
      2,
      255,
      0,
      0
    )
  })

  fs.writeFileSync(`${baseDir}/with-lines.png`, withLines.toBuffer('png'))
}

export default {
  upload,
}
