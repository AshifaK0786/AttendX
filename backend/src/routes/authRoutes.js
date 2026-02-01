const express = require('express');
const { login, register } = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.post('/register', register); // Normally restricted, but keeping for setup

module.exports = router;
