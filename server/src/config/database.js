import mongoose from 'mongoose'

const mongoDB = 'mongodb://localhost/fibergenie'
mongoose.connect(mongoDB, { useCreateIndex: true, useNewUrlParser: true })
mongoose.Promise = global.Promise

export default mongoose
