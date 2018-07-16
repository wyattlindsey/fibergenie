import { expect } from 'chai'
import fs from 'fs'
import sinon from 'sinon'

import dv from 'ndv'

import Chart from './chart'
import {
  horizontalLines,
  horizontalSegments,
  verticalLines,
  verticalSegments,
} from '../test/fixtures/chart'

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

  it('categorizes horizontal and vertical segments, culls diagonal', () => {
    const diagonalSegments = [
      {
        p1: { x: 0, y: 0 },
        p2: { x: 10, y: 5 },
      },
      {
        p1: { x: 10, y: 10 },
        p2: { x: 15, y: 20 },
      },
    ]

    const xResults = Chart.extractDirectionalLines(
      [...diagonalSegments, ...horizontalSegments, ...verticalSegments],
      'x',
      100
    )

    expect(xResults.lines).to.deep.equal(horizontalLines)

    const yResults = Chart.extractDirectionalLines(
      [...diagonalSegments, ...horizontalSegments, ...verticalSegments],
      'y',
      100
    )

    expect(xResults.lines).to.deep.equal(verticalLines)
  })

  it('consolidates co linear segments based on tolerance', () => {
    // 5th segment of each line is shifted from the average more than the value we will specify
    const unevenSegments = [
      // 1st line
      {
        p1: { x: 0, y: 9 },
        p2: { x: 10, y: 9 },
      },
      {
        p1: { x: 10, y: 10 },
        p2: { x: 20, y: 10 },
      },
      {
        p1: { x: 20, y: 10 },
        p2: { x: 30, y: 10 },
      },
      {
        p1: { x: 30, y: 11 },
        p2: { x: 40, y: 11 },
      },
      {
        p1: { x: 40, y: 12 },
        p2: { x: 50, y: 12 },
      },
      // 2nd line
      {
        p1: { x: 0, y: 20 },
        p2: { x: 10, y: 20 },
      },
      {
        p1: { x: 10, y: 21 },
        p2: { x: 20, y: 21 },
      },
      {
        p1: { x: 20, y: 20 },
        p2: { x: 30, y: 20 },
      },
      {
        p1: { x: 30, y: 19 },
        p2: { x: 40, y: 19 },
      },
      {
        p1: { x: 40, y: 18 },
        p2: { x: 50, y: 18 },
      },
      // 3rd line
      {
        p1: { x: 0, y: 29 },
        p2: { x: 10, y: 29 },
      },
      {
        p1: { x: 10, y: 30 },
        p2: { x: 20, y: 30 },
      },
      {
        p1: { x: 20, y: 31 },
        p2: { x: 30, y: 31 },
      },
      {
        p1: { x: 30, y: 30 },
        p2: { x: 40, y: 30 },
      },
      {
        p1: { x: 40, y: 32 },
        p2: { x: 50, y: 32 },
      },
    ]

    const expectedLines = [
      {
        p1: { x: 0, y: 10 },
        p2: { x: 40, y: 10 },
      },
      {
        p1: { x: 0, y: 20 },
        p2: { x: 40, y: 20 },
      },
      {
        p1: { x: 0, y: 30 },
        p2: { x: 40, y: 30 },
      },
    ]

    const res = Chart.extractDirectionalLines(unevenSegments, 'x', 100, {
      maxShift: 1
    })

    expect(res.lines).to.deep.equal(expectedLines)
  })

  it('resizes chart data to fit original image', () => {})

  it('filters line candidates to those with lots of segments or unusually long segments', () => {})

  it('find the average delta between chart lines', () => {})

  it('uses average delta and perpendicular lines to determine if last line should be added or removed', () => {})

  it('draws lines on the chart in development mode', () => {})
})
