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

  processImage(baseDirectoryPath, 'upscaled-3x.jpg')

  // const img = new dv.Image('jpg', fs.readFileSync(`${imagePath}-prepped.jpg`))
  // const gray = img.toGray()
  // const lines = gray.lineSegments(3, 0, true)
  // const correctLines = lines.filter(line => line.error === 0)
  //
  // lines.forEach(line => {
  //   img.drawLine(line.p1, line.p2, 2, 25, 50, 240)
  // })
  //
  // fs.writeFileSync(`public/uploads/${fileName}-lines.jpg`, img.toBuffer('jpg'))

  // if (!filePath) {
  //   status = 500
  // } else {
  // try {
  //   const img = await Image.load(imagePath)
  //   const grey = img.grey()
  //   const edge = cannyEdgeDetector(grey, {
  //     gaussianBlur: 0.4,
  //     highThreshold: 80,
  //     lowThreshold: 10,
  //   })
  //   edge.save(`public/uploads/${fileName}-edge.jpg`)
  // } catch (e) {
  //   console.error('Image processing failed', e)
  //   status = 500
  // }
  // }

  fs.unlinkSync(tmpFilePath)

  res.sendStatus(status)
}

const upscaleImage = async img => {
  return img.width >= MIN_IMAGE_WIDTH ? img : img.resize({ factor: 3 })
}

const processImage = (dir, fileName) => {
  const img = new dv.Image('jpg', fs.readFileSync(`${dir}/${fileName}`))
  // todo img.findSkew() -- needs a monochrome image
  const gray = img.toGray('max')
  const monochrome = gray.threshold(210)
  fs.writeFileSync(`${dir}/processed.jpg`, monochrome.toBuffer('jpg'))
}

export default {
  upload,
}
