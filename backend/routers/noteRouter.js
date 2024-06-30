const express = require('express')
const Note = require('../models/note');
const router = express.Router()
const noteController = require('../controllers/noteController');

router.get('/', noteController.getAllNotes);
router.get('/:id', noteController.getTheIthNote);
router.post('/', noteController.createNote);
router.delete('/:id', noteController.deleteNote);
router.put('/:id', noteController.updateNote);
router.post('/initDB', noteController.initDb);


module.exports = router;