// import cannyEdgeDetector from 'canny-edge-detector'
import Image from 'image-js'

import dotProp from 'dot-prop'
import dv from 'ndv'
import fs from 'fs'

const MIN_IMAGE_WIDTH = 2048
const UPLOADS_FOLDER = 'public/uploads'

const upload = async (req, res) => {
  let status = 201
  const tmpFilePath = dotProp.get(req, 'file.path')
  const tmpFileName = dotProp.get(req, 'file.filename')
  const baseDirectoryPath = `${UPLOADS_FOLDER}/${tmpFileName}`

  const img = await Image.load(tmpFilePath)

  fs.mkdirSync(baseDirectoryPath)

  await img.save(`${baseDirectoryPath}/original.jpg`)

  const upscaledImage = await upscaleImage(img)
  await upscaledImage.save(`${baseDirectoryPath}/upscaled-3x.jpg`)

  const processedImage = processImage(baseDirectoryPath, 'upscaled-3x.jpg')
  const chartLines = extractChartLines(processedImage)
  const withLines = processedImage.toColor()

  chartLines.forEach(line => {
    withLines.drawLine(line.p1, line.p2, 2, 255, 0, 0)
  })

  fs.writeFileSync(
    `${baseDirectoryPath}/with-lines.jpg`,
    withLines.toBuffer('jpg')
  )

  fs.unlinkSync(tmpFilePath)

  res.sendStatus(status)
}

const upscaleImage = async img => {
  return img.width >= MIN_IMAGE_WIDTH ? img : img.resize({ factor: 3 })
}

const processImage = (dir, fileName) => {
  const img = new dv.Image('jpg', fs.readFileSync(`${dir}/${fileName}`))
  const gray = img.toGray('max')
  const monochrome = gray.threshold(210).invert().thin('bg', 8, 0)
  // todo img.findSkew()
  fs.writeFileSync(`${dir}/processed.jpg`, monochrome.toBuffer('jpg'))
  return monochrome
}

const extractChartLines = img => {
  const lines = img.toGray().lineSegments(6, 0, false)
  const correctLines = lines.filter(line => line.error === 0)

  console.log(lines.length)

  return lines
}

export default {
  upload,
}
