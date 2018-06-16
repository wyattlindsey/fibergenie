import { expect } from 'chai'
import fs from 'fs'
import noop from 'lodash/noop'
import sinon from 'sinon'

import imageHandler, { prepareDirectories, UPLOADS_FOLDER } from './image'

const fileToUpload = {
  filename: 'file-id',
  path: `${UPLOADS_FOLDER}/tmp`,
}

const mkdirSyncStub = sinon.stub(fs, 'mkdirSync')
const renameSyncStub = sinon.stub(fs, 'renameSync')
const unlinkSyncStub = sinon.stub(fs, 'unlinkSync')
const writeFileSyncStub = sinon.stub(fs, 'writeFileSync')

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
    renameSyncStub.restore()
    unlinkSyncStub.restore()
    writeFileSyncStub.restore()
  })

  beforeEach(() => {})

  afterEach(() => {
    responseStatusStub.reset()
    responseSendStub.reset()
  })

  it('responds with 500 status code when no image is included in request', async () => {
    const request = {}
    await imageHandler.upload(request, response)
    expect(response.status.calledWith(500))
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
    expect(mkdirSyncStub.calledWith(`${res.baseDirectory}/page_1`))
  })

  it('responds with a 500 status code if directories cannot be created', () => {
    mkdirSyncStub.throws()
    const res = prepareDirectories((fileToUpload.filename))
    expect(res.err).to.not.be.null
  })

  it('renames PDF files in the temp directory to include the .pdf extension', () => {

  })

  it('calls PDF conversion method for the correct file type', () => {

  })

  it('responds with chart data on success', () => {
    
  })
})
