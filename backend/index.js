require('dotenv').config()
const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const noteRouter = require('./routers/noteRouter')
const cors = require('cors')

const logger = (req, res, next) => {
  const data = `${new Date().toLocaleString()} ${req.method} ${req.path} ${JSON.stringify(req.body)}\n`
  fs.appendFile(path.join(__dirname, 'log.txt'), data, err => { err? next(err): next()})
};

app.use(cors())
app.use(express.json())
app.use(logger)
require('./models/note')
app.use('/api/notes', noteRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})