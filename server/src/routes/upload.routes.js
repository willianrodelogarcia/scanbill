const express = require('express');
const { uploadController } = require('../controllers');
const multer = require('multer');
const upload = multer({ dest: './src/imgs/' });
const { isAuthenticated } = require('../utils/middleWares');

const router = express.Router();

router.post('/', upload.single('imagen'), uploadController.uploadImage);

router.get('/sheets', uploadController.listOfSheets);

module.exports = router;
