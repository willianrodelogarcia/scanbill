const express = require('express');
const { loginController } = require('../controllers');

const router = express.Router();

router.post('/', loginController.login);
router.get('/validate', loginController.validateLogin);

module.exports = router;
