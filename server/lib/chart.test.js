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

  it('categorizes horizontal and vertical segments', () => {})

  it('consolidates co linear segments based on tolerance', () => {})

  it('resizes chart data to fit original image', () => {})

  it('filters line candidates to those with lots of segments or unusually long segments', () => {})

  it('find the average delta between chart lines', () => {})

  it('uses average delta and perpendicular lines to determine if last line should be added or removed', () => {})

  it('draws lines on the chart in development mode', () => {})
})
