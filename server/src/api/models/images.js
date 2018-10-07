// @flow

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const ImageSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  owner: {
    type: String,
    trim: true,
    required: true,
  },
})

const model = mongoose.model('Image', ImageSchema)

export default model
