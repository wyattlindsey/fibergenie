import { expect } from 'chai'
import fs from 'fs'
import noop from 'lodash/noop'
import sinon from 'sinon'

import imageHandler, {
  prepareDirectories,
  processUpload,
  UPLOADS_FOLDER,
} from './image'
import Image from '../lib/image'

const fileToUpload = {
  filename: 'file-id',
  path: `${UPLOADS_FOLDER}/tmp`,
}

const pdfMimeType = { mimetype: 'application/pdf' }

const mkdirSyncStub = sinon.stub(fs, 'mkdirSync')
const readSync = sinon.stub(fs, 'readSync')
const renameSyncStub = sinon.stub(fs, 'renameSync')
const unlinkSyncStub = sinon.stub(fs, 'unlinkSync')
const writeFileSyncStub = sinon.stub(fs, 'writeFileSync')

const convertPDFStub = sinon.stub(Image, 'convertPDF').returns([{}, {}])
const getDimensionsStub = sinon.stub(Image, 'getDimensions').returns(100, 100)
const prepareStub = sinon.stub(Image, 'prepare').returns(UPLOADS_FOLDER)
const resizeStub = sinon.stub(Image, 'resize').returns(UPLOADS_FOLDER)
const saveCopyStub = sinon.stub(Image, 'saveCopy').returns(UPLOADS_FOLDER)

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
  })

  beforeEach(() => {})

  afterEach(() => {
    mkdirSyncStub.reset()
    readSync.reset()
    renameSyncStub.reset()
    unlinkSyncStub.reset()
    writeFileSyncStub.reset()

    responseStatusStub.reset()
    responseSendStub.reset()
  })

  it('responds with 500 status code when no image file is included in request', async () => {
    const request = {} // no `file` property
    const handler = require('./image').default
    await handler.upload(request, response)
    expect(responseStatusStub.calledWith(500)).to.equal(true)
  })

  it('creates a new directory in the uploads folder using the provided id', () => {
    const res = prepareDirectories(fileToUpload.filename)
    expect(mkdirSyncStub.calledWith(fileToUpload.filename))
    expect(res).to.deep.equal({
      baseDirectory: `${UPLOADS_FOLDER}/${fileToUpload.filename}`,
      err: null,
    })
  })

  it('creates a page_1 subdirectory by default', () => {
    const res = prepareDirectories(fileToUpload.filename)
    expect(mkdirSyncStub.calledWith(`${res.baseDirectory}/page_2`))
  })

  it('responds with a 500 status code if directories cannot be created', () => {
    mkdirSyncStub.throws()
    const res = prepareDirectories(fileToUpload.filename)
    expect(res.err).to.not.be.null
  })

  it('renames PDF files in the temp directory to include the .pdf extension', () => {
    processUpload({ ...fileToUpload, ...pdfMimeType }, UPLOADS_FOLDER)
    expect(
      renameSyncStub.calledWith(
        fileToUpload.path,
        `${fileToUpload.filename}.pdf`
      )
    )
  })

  it('calls PDF conversion method for the correct file type', () => {})

  it('creates multiple pages if multi-page document')

  it('responds with chart data on success', () => {})
})
