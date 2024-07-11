require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors')
const app = express()

const fs = require('fs')
const path = require('path')
const noteRouter = require('./routers/noteRouter')
const userRouter = require('./routers/userRouter')

const logger = (req, res, next) => {
  const data = `${new Date().toLocaleString()} ${req.method} ${req.path} ${JSON.stringify(req.body)}\n`
  fs.appendFile(path.join(__dirname, 'log.txt'), data, err => { err? next(err): next()})
};

app.use(cors())
app.use(express.json())
app.use(logger)

mongoose.set('strictQuery', true)
const url = process.env.MONGODB_CONNECTION_URL
console.log('connecting to', url)
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })


require('./models/note')
require('./models/user')
app.use('/api/notes', noteRouter)
app.use('/api/users', userRouter)

app.get('/ping', (req, res) => {
  res.send('pong');
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})