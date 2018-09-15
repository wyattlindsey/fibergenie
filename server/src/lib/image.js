// @flow

import dv from 'ndv'
import fs from 'fs'
import gm from 'gm'
import PDFConverter from 'pdf2pic'

import { ImageDimensions } from 'types/image'

const convertPDF = (
  sourcePath: string,
  baseDir: string,
  targetSize: number
): Promise<any> => {
  const converter = new PDFConverter({
    density: 300,
    format: 'png',
    savedir: baseDir,
    savename: `original`,
    size: targetSize,
  })

  return converter.convertBulk(sourcePath, -1)
}

const getDimensions = (sourcePath: string): Promise<?ImageDimensions> => {
  return new Promise(resolve => {
    gm(sourcePath).size((err, dims) => {
      if (err || !dims) {
        throw new Error('Error getting image dimensions')
      } else {
        resolve(dims)
      }
    })
  }).catch(e => {
    console.error('Error getting image dimensions: ', e)
  })
}

const prepare = (sourcePath: string, basePath: string): Promise<?string> => {
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

const resize = (
  sourcePath: string,
  baseDir: string,
  targetSize: number
): Promise<?string> => {
  return new Promise(resolve => {
    gm(sourcePath)
      .resize(null, targetSize)
      .write(`${baseDir}/resized-${targetSize}.png`, err => {
        if (!err) {
          resolve(`${baseDir}/resized-${targetSize}.png`)
        } else {
          throw new Error('Error resizing image')
        }
      })
  }).catch(err => {
    console.error(err)
  })
}

const saveCopy = (sourcePath: string, baseDir: string): Promise<?string> => {
  return new Promise(resolve => {
    gm(sourcePath)
      .setFormat('png')
      .write(`${baseDir}/original.png`, err => {
        if (!err) {
          resolve(`${baseDir}/original.png`)
        } else {
          throw new Error('Error saving original image')
        }
      })
  }).catch(err => {
    console.error(err)
  })
}

export default {
  convertPDF,
  getDimensions,
  prepare,
  resize,
  saveCopy,
}

export { convertPDF, getDimensions, prepare, resize, saveCopy }
