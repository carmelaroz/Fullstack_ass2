const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
    id: Number,
    title: String,
    author: {
      name: String,
      email: String,
    },
    content: String,
})

module.exports = mongoose.model('Note', noteSchema)