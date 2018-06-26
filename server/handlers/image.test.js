import { expect } from 'chai'
import fs from 'fs'
import noop from 'lodash/noop'
import sinon from 'sinon'

import imageHandler, { UPLOADS_FOLDER } from './image'
import Chart from '../lib/chart'
import Image from '../lib/image'

const fileToUpload = {
  filename: 'file-id',
  path: `${UPLOADS_FOLDER}/tmp`,
}

const pdfMimeType = { mimetype: 'application/pdf' }

// fs stubs
const mkdirSyncStub = sinon.stub(fs, 'mkdirSync')
const readSync = sinon.stub(fs, 'readSync')
const renameSyncStub = sinon.stub(fs, 'renameSync')
const unlinkSyncStub = sinon.stub(fs, 'unlinkSync')
const writeFileSyncStub = sinon.stub(fs, 'writeFileSync')

// lib/images.js stubs
const convertPDFStub = sinon.stub(Image, 'convertPDF')
const getDimensionsStub = sinon.stub(Image, 'getDimensions')
const prepareStub = sinon.stub(Image, 'prepare')
const resizeStub = sinon.stub(Image, 'resize')
const saveCopyStub = sinon.stub(Image, 'saveCopy')

// lib/chart.js stubs
const extractLinesStub = sinon.stub(Chart, 'extractLines')

// Express stubs
const response = {
  send: noop,
  status: noop,
}
const responseStatusStub = sinon.stub(response, 'status')
const responseSendStub = sinon.stub(response, 'send')

const chartData = {
  boundingBox: {
    p1: {
      x: 1,
      y: 1,
    },
    p2: {
      x: 100,
      y: 100,
    },
  },
  rowPositions: [1, 10, 19, 28, 37, 46],
}

describe('image upload', () => {
  before(() => {})

  after(() => {
    mkdirSyncStub.restore()
    readSync.restore()
    renameSyncStub.restore()
    unlinkSyncStub.restore()
    writeFileSyncStub.restore()

    convertPDFStub.restore()
    getDimensionsStub.restore()
    prepareStub.restore()
    resizeStub.restore()
    saveCopyStub.restore()
    extractLinesStub.restore()
  })

  beforeEach(() => {
    convertPDFStub.resolves([{}, {}, {}]) // creates three separate pages
    getDimensionsStub.resolves(100, 100)
    prepareStub.resolves(UPLOADS_FOLDER)
    resizeStub.resolves(UPLOADS_FOLDER)
    saveCopyStub.resolves(UPLOADS_FOLDER)
    extractLinesStub.returns(chartData)

    responseStatusStub.returns(response)
    responseSendStub.returns(response)
  })

  afterEach(() => {
    mkdirSyncStub.reset()
    readSync.reset()
    renameSyncStub.reset()
    unlinkSyncStub.reset()
    writeFileSyncStub.reset()

    convertPDFStub.reset()
    getDimensionsStub.reset()
    prepareStub.reset()
    resizeStub.reset()
    saveCopyStub.reset()
    extractLinesStub.reset()

    responseStatusStub.reset()
    responseSendStub.reset()
  })

  it('responds with 500 status code when no image file is included in request', async () => {
    const request = {} // no `file` property
    await imageHandler.upload(request, response)
    expect(responseStatusStub.calledWith(500)).to.equal(true)
  })

  it('creates a new directory in the uploads folder using the provided id', () => {
    const res = imageHandler.prepareDirectories(fileToUpload.filename)
    expect(mkdirSyncStub.calledWith(fileToUpload.filename))
    expect(res).to.deep.equal({
      baseDirectory: `${UPLOADS_FOLDER}/${fileToUpload.filename}`,
      err: null,
    })
  })

  it('creates a page_1 subdirectory by default', () => {
    const res = imageHandler.prepareDirectories(fileToUpload.filename)
    expect(mkdirSyncStub.calledWith(`${res.baseDirectory}/page_1`)).to.equal(
      true
    )
  })

  it('responds with a 500 status code if directories cannot be created', () => {
    mkdirSyncStub.throws()
    const res = imageHandler.prepareDirectories(fileToUpload.filename)
    expect(res.err).to.not.be.null
  })

  it('renames PDF files in the temp directory to include the .pdf extension', async () => {
    await imageHandler.processUpload(
      { ...fileToUpload, ...pdfMimeType },
      UPLOADS_FOLDER
    )
    expect(
      renameSyncStub.calledWith(fileToUpload.path, `${fileToUpload.path}.pdf`)
    ).to.equal(true)
  })

  it('calls PDF conversion method for the correct file type', async () => {
    const pdf = { ...fileToUpload, ...pdfMimeType }
    const nonPDF = fileToUpload

    await imageHandler.processUpload(pdf, UPLOADS_FOLDER)
    expect(convertPDFStub.called).to.equal(true)
    convertPDFStub.reset()

    await imageHandler.processUpload(nonPDF, UPLOADS_FOLDER)
    expect(convertPDFStub.called).to.equal(false)
  })

  it('creates folders for each PDF page processed and creates a file in that directory', async () => {
    const pdf = { ...fileToUpload, ...pdfMimeType }

    await imageHandler.processUpload(pdf, UPLOADS_FOLDER) // convertPDF stub resolves 3 pages
    expect(mkdirSyncStub.callCount).to.equal(2) // page_1 folder already exists so 2 more should be created
    expect(saveCopyStub.callCount).to.equal(3) // total of 3 png copies created
  })

  it('responds with chart data and 201 status code on success', async () => {
    const request = { file: fileToUpload }
    await imageHandler.upload(request, response)
    expect(responseStatusStub.calledWith(201)).to.equal(true)
    expect(responseSendStub.calledWith([chartData])).to.equal(true)
  })
})
