const express = require('express');
const { userConroller } = require('../controllers');

const router = express.Router();

router.post('/', userConroller.createOneUser);
router.post('/register', userConroller.registerUser);

module.exports = router;
