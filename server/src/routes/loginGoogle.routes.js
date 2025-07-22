const express = require('express');
const { loginController } = require('../controllers');

const router = express.Router();
router.get('/google', loginController.loginWithGoogle);
router.get('/google/callback', loginController.handleGoogleCallback);
router.get('/google/token', loginController.getTokenFromSession);
router.post('/login', loginController.loginUser);
router.post('/me', loginController.validateLoginUser);
router.post('/logout', loginController.logoutUser);

module.exports = router;
