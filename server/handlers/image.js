import cannyEdgeDetector from 'canny-edge-detector'
import Image from 'image-js'

import dotProp from 'dot-prop'

const upload = async (req, res) => {
  let status = 201
  const imagePath = dotProp.get(req, 'file.path')
  const fileName = dotProp.get(req, 'file.filename')

  if (!imagePath) {
    status = 500
  } else {
    try {
      const img = await Image.load(imagePath)
      const grey = img.grey()
      const edge = cannyEdgeDetector(grey, {
        gaussianBlur: 0.4,
        highThreshold: 80,
        lowThreshold: 10,
      })
      edge.save(`public/uploads/${fileName}-edge.jpg`)
    } catch (e) {
      console.error('Image processing failed', e)
      status = 500
    }
  }

  res.sendStatus(status)
}

export default {
  upload,
}
