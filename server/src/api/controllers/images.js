// @flow

import dotProp from 'dot-prop'
import fs from 'fs'
import { Types } from 'mongoose'
import noop from 'lodash/noop'
import rimraf from 'rimraf'

import imageModel from 'api/models/images'

import Image from 'lib/image'
import Chart from 'lib/chart'

import type { $Request, $Response } from 'express'
import type { ChartData } from 'types/chart'
import type { ImageDimensions } from 'types/image'

type Request = $Request & { file: any }

const TARGET_IMAGE_DIMS = 2048
const UPLOADS_FOLDER = 'public/uploads'
const PAGE_PREFIX = 'page_'

// todo make the response values more like the users controller

const upload = async (req: Request, res: $Response): Promise<void> => {
  const errorMsg = 'Error processing file'

  const userId = dotProp.get(req, 'body.userId')
  if (!userId) {
    res.status(403).send('Unauthorized user requested upload')
    return
  }

  const fileId = dotProp.get(req, 'file.filename')
  const tmpFilePath = dotProp.get(req, 'file.path')

  const { baseDirectory, err } = prepareDirectories(fileId)

  if (err) {
    res.status(500).send('Error creating directory')
  } else {
    try {
      const chartData = await processUpload(req.file, baseDirectory, userId)

      if (!chartData) {
        res.status(500).send(errorMsg)
      } else {
        res.status(201).send(chartData)
      }

      // delete temp file
      fs.unlinkSync(tmpFilePath)
    } catch (e) {
      console.error(e)
      res.status(500).send(errorMsg, e)
    }
  }
}

const getById = (req: $Request, res: $Response): void => {
  const imageId = dotProp.get(req, 'params.imageId')
  if (!imageId) {
    res.status(500).send('Invalid image ID')
    return
  }

  imageModel.findOne({ _id: imageId }, (err, image) => {
    if (err) {
      res.status(500).send(`Error finding image: : ${err}`)
    } else {
      res.status(200).send(image)
    }
  })
}

const getByUserId = (req: $Request, res: $Response): void => {
  const userId = dotProp.get(req, 'body.userId')
  if (!userId) {
    res.status(403).send('Unauthorized user requested getByUserId')
    return
  }

  imageModel.find({ owner: userId }, (err, images) => {
    if (err) {
      res.status(500).send(`Error finding images: : ${err}`)
    } else {
      res.status(200).send(images)
    }
  })
}

// todo this isn't working correctly yet
const updateById = (req: $Request, res: $Response): void => {
  const imageId = dotProp.get(req, 'params.imageId')
  if (!imageId) {
    res.status(500).send('Invalid image ID')
    return
  }

  imageModel.replaceOne({ _id: imageId }, ...req.body, (err) => {
    if (err) {
      res.status(500).send(`Error updating image: ${err}`)
    } else {
      res.sendStatus(204)
    }
  })
}

const deleteById = (req: $Request, res: $Response): void => {
  const imageId = dotProp.get(req, 'params.imageId')
  if (!imageId) {
    res.status(500).send('Invalid image ID')
    return
  }

  imageModel.remove({ _id: imageId }, err => {
    if (err) {
      res.status(500).send(`Error removing image: ${err}`)
    } else {
      res.sendStatus(204)
    }
  })
}

const prepareDirectories = (
  id: string
): { baseDirectory: string, err: string | null } => {
  const res = { baseDirectory: '', err: null }

  // todo prevent collisions

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

const processUpload = async (
  file: any,
  destDir: string,
  userId: string
): Promise<?(ChartData[])> => {
  try {
    if (!file) return null
    const { mimetype, path: sourcePath } = file
    const isPDF = mimetype === 'application/pdf'

    if (isPDF) {
      const convertedPath = `${destDir}/converted_pdf_pages`
      // add pdf extension to filename to help with conversion
      const pdfPath = `${sourcePath}.pdf`
      fs.renameSync(sourcePath, pdfPath)

      const PDFs = await Image.convertPDF(
        pdfPath,
        convertedPath,
        TARGET_IMAGE_DIMS
      )

      const isMultiPage = PDFs.length > 1

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

        const processedPage = await processPage(pdf.path, directoryForPage)

        imageModel.create({
          chartData: processedPage,
          multiPage: isMultiPage
            ? {
                pageNumber: i,
                parent: `${destDir}/${PAGE_PREFIX}${1}`,
              }
            : null,
          name: dotProp.get(file, 'originalname', 'original'),
          owner: userId,
          path: directoryForPage,
        })

        return processedPage
      })

      const pages = await Promise.all(processedPages)

      // remove temporary directory used for pdf conversion
      rimraf(convertedPath, noop)

      return pages
    } else {
      const destPath = `${destDir}/${PAGE_PREFIX}${1}`

      const processedPage = await processPage(sourcePath, destPath)

      imageModel.create({
        chartData: [processedPage],
        name: dotProp.get(file, 'originalname', 'original'),
        owner: userId,
        path: destPath,
      })

      return [processedPage]
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}

const processPage = async (
  sourcePath: string,
  baseDir: string
): Promise<?(ChartData[])> => {
  // save original
  const originalPath = await Image.saveCopy(sourcePath, baseDir)
  if (!originalPath) return null

  // resize
  const resizedImagePath = await Image.resize(
    originalPath,
    baseDir,
    TARGET_IMAGE_DIMS
  )
  if (!resizedImagePath) return null

  // prepare for chart scanning
  const preparedImagePath = await Image.prepare(resizedImagePath, baseDir)
  if (!preparedImagePath) return null

  // process chart
  const originalDimensions: ImageDimensions = await Image.getDimensions(
    originalPath
  )
  if (!originalDimensions) return null

  const results = Chart.extractLines(preparedImagePath, originalDimensions)

  if (process.env.NODE_ENV === 'development' && results) {
    // create images with lines and segments drawn directly on the image at preparedImagePath
    // for research and troubleshooting
    Chart.drawLines(originalPath, baseDir, results)
  }

  return results
}

export default {
  prepareDirectories,
  processUpload,
  processPage,
  upload,
  getById,
  getByUserId,
  updateById,
  deleteById,
}

export { UPLOADS_FOLDER }
