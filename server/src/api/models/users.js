// @flow

import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

const Schema = mongoose.Schema

const UserSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    required: true,
  },
  lastName: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    index: { unique: true },
    trim: true,
    required: true,
  },
  password: {
    type: String,
    trim: true,
    required: true,
  },
})

/* eslint-disable no-invalid-this */
UserSchema.pre('save', function(next) {
  // $FlowIgnore
  this.password = bcrypt.hashSync(this.password, SALT_ROUNDS)
  next()
})
/* eslint-enable no-invalid-this */

const model = mongoose.model('User', UserSchema)

export default model
