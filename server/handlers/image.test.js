import { expect } from 'chai'
import fs from 'fs'
import noop from 'lodash/noop'
import sinon from 'sinon'

import imageHandler from './image'

const mkdirSyncStub = sinon.stub(fs, 'mkdirSync')
const renameSyncStub = sinon.stub(fs, 'renameSync')
const unlinkSyncStub = sinon.stub(fs, 'unlinkSync')

const request = {}
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
  })

  beforeEach(() => {})

  afterEach(() => {
    responseStatusStub.reset()
    responseSendStub.reset()
  })

  it('responds with 500 status code when no image is included in request', async () => {
    await imageHandler.upload(request, response)
    expect(response.status.calledWith(500))
  })
})
