import handlers from './handlers'

const multer = require('multer')
const upload = multer({ dest: '/public/uploads' })

const routes = app => {
  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  app.post('/image', upload.single('chart'), handlers.image.upload)
}

export default routes
