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
const convertPDFStub = sinon.stub(Image, 'convertPDF').resolves([{}, {}])
const getDimensionsStub = sinon.stub(Image, 'getDimensions').resolves(100, 100)
const prepareStub = sinon.stub(Image, 'prepare').resolves(UPLOADS_FOLDER)
const resizeStub = sinon.stub(Image, 'resize').resolves(UPLOADS_FOLDER)
const saveCopyStub = sinon.stub(Image, 'saveCopy').resolves(UPLOADS_FOLDER)

// lib/chart.js stubs
const extractLinesStub = sinon.stub(Chart, 'extractLines').returns({})

// Express stubs
const response = {
  send: noop,
  status: noop,
}
const responseStatusStub = sinon.stub(response, 'status').returns(response)
const responseSendStub = sinon.stub(response, 'send').returns(response)

describe('image upload', () => {
  before(() => {})

  after(() => {
    mkdirSyncStub.restore()
    readSync.restore()
    renameSyncStub.restore()
    unlinkSyncStub.restore()
    writeFileSyncStub.restore()

    convertPDFStub.restore()
    extractLinesStub.restore()
  })

  beforeEach(() => {})

  afterEach(() => {
    mkdirSyncStub.reset()
    readSync.reset()
    renameSyncStub.reset()
    unlinkSyncStub.reset()
    writeFileSyncStub.reset()

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

  it('creates multiple pages if multi-page document')

  it('responds with chart data on success', () => {})
})
