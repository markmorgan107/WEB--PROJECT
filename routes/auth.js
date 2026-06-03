const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.postLogin);
router.post('/signup', authController.postSignup);
router.post('/forgot-password', authController.postForgotPassword);
router.get('/logout', authController.logout);

module.exports = router;
