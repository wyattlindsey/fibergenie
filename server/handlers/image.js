import CannyEdgeDetector from 'canny-edge-detector'
import Image from 'image'

import dotProp from 'dot-prop'

const upload = async (req, res) => {
  let status = 201
  const imagePath = dotProp.get(req, 'file.path')
  const fileName = dotProp.get(req, 'file.filename')

  if (!imagePath) {
    status = 500
  } else {
    try {
      const loadedImage = await Jimp.read(imagePath)
      const grey = loadedImage.greyscale()// write(`public/uploads/${fileName}-greyscale.jpg`)
      const edge = CannyEdgeDetector(loadedImage)
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
