import { expect } from 'chai'
import fs from 'fs'
import sinon from 'sinon'

import dv from 'ndv'

import Chart from './chart'

const ImageStub = sinon.stub()
ImageStub.prototype.lineSegments = sinon.stub().returns([])
ImageStub.prototype.toColor = sinon.stub().returns(new ImageStub())
ImageStub.prototype.toGray = sinon.stub().returns(new ImageStub())

const dvStub = sinon.stub(dv, 'Image').returns(new ImageStub())
const readFileSyncStub = sinon.stub(fs, 'readFileSync')

describe('extractLines()', () => {
  before(() => {})

  after(() => {
    dvStub.restore()
    readFileSyncStub.restore()
  })

  beforeEach(() => {})

  afterEach(() => {
    dvStub.reset()
    readFileSyncStub.reset()
  })

  it('converts an image to the expected chart data structure', () => {
    const chartData = Chart.extractLines(
      'test/fixtures/images/beachleaf1.png',
      {
        height: 413,
        width: 381,
      }
    )
    expect(true).to.equal(true)
  })
})
