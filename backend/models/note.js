require('dotenv').config()
const mongoose = require('mongoose')

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

const noteSchema = new mongoose.Schema({
    id: Number,
    title: String,
    author: {
    name: String,
    email: String,
    } || null,
    content: String,
})

module.exports = mongoose.model('Note', noteSchema)