import dotProp from 'dot-prop'
import dv from 'ndv'
import gm from 'gm'
import fs from 'fs'
import PDFConverter from 'pdf2pic'

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

  // try {
  //   fs.mkdirSync(baseDirectoryPath)
  //   fs.mkdirSync(`${baseDirectoryPath}/page-1`)
  //   let originalImagePath
  //
  //   if (isPDF) {
  //     // add pdf extension to filename to help with conversion
  //     const pdfPath = `${tmpFilePath}.pdf`
  //     fs.renameSync(tmpFilePath, pdfPath)
  //     tmpFilePath = pdfPath
  //     originalImagePath = await convertPDF(pdfPath, baseDirectoryPath)
  //   } else {
  //     originalImagePath = await saveOriginal(
  //       tmpFilePath,
  //       `${baseDirectoryPath}/page-1`
  //     )
  //   }
  //
  //   // save resized image to base directory
  //   const resizedImagePath = await resizeImage(
  //     originalImagePath,
  //     baseDirectoryPath
  //   )
  //
  //   // prepare for edge detection
  //   const preparedImagePath = await prepareImage(
  //     resizedImagePath,
  //     baseDirectoryPath
  //   )
  //
  //   const { horizontalLines, segments } = extractChartLines(preparedImagePath)
  //   drawLines(preparedImagePath, baseDirectoryPath, horizontalLines)
  //   drawSegments(preparedImagePath, baseDirectoryPath, segments)
  // } catch (e) {
  //   console.error(e)
  //   status = 500
  // }
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
  return new Promise(resolve => {
    if (!file) {
      throw 'No file provided to processUpload'
    } else {
      const { mimetype, path: sourcePath } = file
      const isPDF = mimetype === 'application/pdf'

      if (isPDF) {
      } else {
        const originalImagePath = saveOriginal(
          sourcePath,
          `${destDir}/${PAGE_PREFIX}${1}`
        ).then(() => {
          resolve(originalImagePath)
        })
      }
    }
  }).catch(err => {
    console.error(err)
  })
}

const processPage = (sourcePath, baseDir) => {}

const convertPDF = (sourcePath, baseDir) => {
  return new Promise(resolve => {
    const converter = new PDFConverter({
      density: 72,
      format: 'png',
      savedir: baseDir,
      savename: `original`,
      size: TARGET_IMAGE_DIMS,
    })

    converter.convertBulk(sourcePath, -1).then(res => {
      console.log('res', res)
      resolve(res.reduce((agg, img) => agg))
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

const extractChartLines = sourcePath => {
  const img = new dv.Image('png', fs.readFileSync(sourcePath))
  const lineSegments = img.toGray().lineSegments(6, 0, false)

  const mappedHorizontalSegments = {}
  const horizontalSegments = []
  const maxSkew = 2 // max y travel allowed for a segment to be considered horizontal (pixels)
  const maxShift = 2 // max vertical difference allowed for segments to be grouped together (+- pixels)
  const minLength = 10 // min width of segment to be collected
  const minSegments = 5 // min segments required for a group of co-linear segments to be considered a line
  const gridTolerance = 10 // how far a line can fall outside of the mean distance between lines (% of mean distance)

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
      const candidate = mappedHorizontalSegments[nearbyYCoord]

      if (candidate) {
        mappedHorizontalSegments[nearbyYCoord] = {
          maxY: Math.max(yCoord, candidate.maxY),
          minY: Math.min(yCoord, candidate.minY),
          segments: [...candidate.segments, seg],
          totalLength: candidate.totalLength + length,
        }
        break
      }

      // nothing was found so initialize a new object
      if (i === maxShift * 2 + 1) {
        mappedHorizontalSegments[yCoord] = {
          maxY: yCoord,
          minY: yCoord,
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

    if (
      segments.length >= minSegments ||
      totalLength > TARGET_IMAGE_DIMS / 10
    ) {
      dotProp.set(lines, yCoord, mappedHorizontalSegments[yCoord])
    }

    return lines
  }, {})

  // move horizontal lines to the midpoint between the min and max segments found
  const averagedLines = Object.keys(horizontalLines).reduce((lines, yCoord) => {
    const { maxY, minY } = horizontalLines[yCoord]
    const midPoint = minY + Math.floor((maxY - minY) / 2)

    lines[midPoint] = horizontalLines[yCoord]

    return lines
  }, {})

  // filter out any lines that don't fall within the average delta-y of the line collection
  // sort key values just in case
  const yValuesSorted = Object.keys(averagedLines)
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

  // split y values in half and move from the middle out to determine if other lines are within tolerance
  const midPointIndex = Math.floor(yValuesSorted.length / 2)

  // move in forward direction from midpoint to beginning, which requires 2 reverses to iterate in the correct order
  const topHalf = yValuesSorted
    .slice(0, midPointIndex + 1)
    .reverse()
    .filter((v, i, arr) => {
      const yDist = i === 0 ? v - arr[i + 1] : arr[i - 1] - v
      return yDist >= meanDeltaY - tolerance && yDist < meanDeltaY + tolerance
    })
    .reverse()

  // move from midpoint to end of yValuesSorted comparing always to the previous line for tolerance
  const bottomHalf = yValuesSorted.slice(midPointIndex).filter((v, i, arr) => {
    const yDist = v - arr[i - 1]
    return yDist >= meanDeltaY - tolerance && yDist < meanDeltaY + tolerance
  })

  const joinedYValues = [...topHalf, ...bottomHalf]

  let groupIndex = 0

  const groups = joinedYValues.reduce(
    (all, v, i, arr) => {
      // check if current value and next value are within tolerance
      // otherwise start a new group
      const yDistToNext = arr[i + 1] - v

      all[groupIndex].push(v)

      if (yDistToNext > meanDeltaY + tolerance) {
        // outside of tolerance - increment groupIndex
        groupIndex++
        all.push([])
      }

      return all
    },
    [[]]
  )

  const biggestGroup = groups.reduce(
    (biggest, group) =>
      Math.max(biggest.length, group.length) === group.length ? group : biggest
  )

  return { horizontalLines: biggestGroup, segments: horizontalSegments }
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
