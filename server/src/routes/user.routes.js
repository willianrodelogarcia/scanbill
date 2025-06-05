const express = require('express');
const { userConroller } = require('../controllers');

const router = express.Router();

router.post('/', userConroller.createOneUser);

module.exports = router;
