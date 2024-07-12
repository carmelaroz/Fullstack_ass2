const Note = require('../models/note')
// const {generateNotes, addNotes}= require('../models/generateNotes')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

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

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

const createNote = async(request, response, next) => {
    const body = request.body
    if (body.content === undefined) {
      return response.status(400).json({ error: 'missing content' })
    }
    const token = getTokenFrom(request);
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.SECRET);
    } catch (error) {
      return response.status(401).json({ error: 'token missing or invalid' });
    }
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }

    const user = await User.findById(decodedToken.id)
  
    const note = new Note({
        id: body.id,
        title: body.title,
        author: {
          name: user.name,
          email: user.email,
        },
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

const deleteNote = async(request, response, next) => {
    const token = getTokenFrom(request);
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.SECRET);
    } catch (error) {
      return response.status(401).json({ error: 'token missing or invalid' });
    }
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)
    const index = request.params.id
    Note.findOne({id: index})
    .then(note => {
      if (!note) {
        return response.status(404).json({ error: 'cannot find note' })
      }
      if(user.name != note.author.name) {
        return response.status(403).json({ error: 'permission denied' });
      }
      Note.deleteOne({ id: note.id })
        .then(() => {
          response.status(204).end()
          console.log("succesfuly deleted note " + request.params.id)
        }).catch(error => next(error));
    }).catch(error => next(error));
  }

const updateNote = async(request, response, next) => {
    const token = getTokenFrom(request);
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.SECRET);
    } catch (error) {
      return response.status(401).json({ error: 'token missing or invalid' });
    }
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }

    const user = await User.findById(decodedToken.id)
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
      if(user.name != note.author.name) {
        return response.status(403).json({ error: 'permission denied' });
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