const Note = require('../models/note')
// const {generateNotes, addNotes}= require('../models/generateNotes')

const getAllNotes = (request, response, next) => {
  const page = parseInt(request.query._page);
  const perPage = parseInt(request.query._per_page);

  Note.find({})
    .skip((page - 1) * perPage)
    .limit(perPage)
    .then(notes => {
      Note.countDocuments({})
        .then(totalCount => {
          response.setHeader('x-total-count', totalCount);
          response.setHeader('Access-Control-Expose-Headers', 'x-total-count');
          response.status(200).json(notes);
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));
};
  
const getTheIthNote = (request, response, next) => {
    const index = parseInt(request.params.id) - 1
    if (isNaN(index) || index < 0) {
      return response.status(400).json({ error: 'invalid index' })
    }
    Note.find({})
      .skip(index) 
      .then(notes => {
        if (notes.length > 0) {
          response.status(200).json(notes[0]) 
        } else {
          response.status(404).end()
        }
      }).catch(error => next(error))
  }

const createNote = (request, response, next) => {
    const body = request.body
    if (body.content === undefined) {
      return response.status(400).json({ error: 'missing content' })
    }
    const note = new Note({
        id: body.id,
        title: body.title,
        author: {
        name: body.author.name,
        email: body.author.email,
        } || null,
        content: body.content,
    })
    note.save().then(savedNote => {
      response.status(201).json(savedNote)
    }).catch(error => next(error))
  }


const initDb = async(request, response, next) => {
    try {
        const numberOfNotes = 20
        const notes = generateNotes(numberOfNotes);
        await addNotes(notes)
        response.status(200).json({
          message: "Database initialized successfully",
          notes: notes
        })
      } catch (error) {
        next(error);
      }
    }

const deleteNote = (request, response, next) => {
    const index = request.params.id
    Note.findOne({id: index})
    .then(note => {
      if (!note) {
        return response.status(404).json({ error: 'cannot find note' })
      }
      Note.deleteOne({ id: note.id })
        .then(() => {
          response.status(204).end()
          console.log("succesfuly deleted note " + request.params.id)
        }).catch(error => next(error));
    }).catch(error => next(error));
  }

const updateNote = (request, response, next) => {
    const index = request.params.id
    const updatedContent = request.body.content;

    if (!updatedContent) {
        return response.status(400).json({ error: 'missing content' });
    }
    Note.findOne({id: index})
    .then(note => {
      if (!note) {
        return response.status(404).json({ error: 'cannot find note' });
      }
      note.content = updatedContent;
      note.save()
        .then(updatedNote => {
          response.status(201).json(updatedNote);
        }).catch(error => next(error));
    }).catch(error => next(error))
  }

module.exports = {
    getAllNotes,
    getTheIthNote,
    createNote,
    deleteNote,
    updateNote,
    initDb
  };