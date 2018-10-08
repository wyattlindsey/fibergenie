// @flow

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const CoordSchema = new Schema({
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
})

const ChartDataSchema = new Schema({
  boundingBox: {
    type: Map,
    of: CoordSchema,
    required: true,
  },
  rowPositions: {
    type: [Number],
    required: true,
  },
})

const MultiPageSchema = new Schema({
  pageNumber: {
    type: Number,
    required: true,
  },
  parent: {
    type: String,
    required: true,
  },
})

const ImageSchema = new Schema({
  chartData: {
    type: [ChartDataSchema],
    required: false,
  },
  multiPage: {
    type: MultiPageSchema,
    required: false,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  owner: {
    type: String,
    index: { unique: true },
    trim: true,
    required: true,
  },
  path: {
    type: String,
    trim: true,
    required: true,
  },
})

const model = mongoose.model('Image', ImageSchema)

export default model
