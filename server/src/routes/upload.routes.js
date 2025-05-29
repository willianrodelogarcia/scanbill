const express = require('express');
const { uploadController } = require('../controllers');
const multer = require('multer');
const upload = multer({ dest: './src/imgs/' });

const router = express.Router();

router.post('/', upload.single('imagen'), uploadController.uploadImage);

module.exports = router;
