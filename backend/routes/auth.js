const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');

// Login
router.post('/login', validate.login, validate.checkValidation, authController.login);

// Get profile
router.get('/profile', auth.verifyToken, authController.getProfile);

module.exports = router;