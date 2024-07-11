const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController');

router.post('/users', userController.registerUser) 
router.get('/', userController.getUsers)
router.post('/login', userController.login) 

module.exports = router;