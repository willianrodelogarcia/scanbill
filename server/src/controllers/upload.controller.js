const { v2: cloudinary } = require('cloudinary');
const { addRow } = require('../utils/googleSheet');
const fs = require('fs');
const path = require('path');

const { readText } = require('../utils/readText');
const { userService } = require('../services');

const uploadImage = async (req, res) => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error(
      'Cloudinary credentials are not set in environment variables',
    );
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  try {
    const userSession = await userService.findBySessionId(
      req.cookies.sessionId,
    );
    const user = userSession.google;
    const {
      file,
      body: { comercio, username, email, documentId },
    } = req;

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: `Bills/${username}`,
      public_id: path.parse(file.originalname).name,
    });
    fs.unlink(file.path, err => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully');
      }
    });

    const text = await readText(uploadResult.url);

    const { newSheet } = await addRow({
      text,
      comercio,
      user,
      email,
      documentId,
    });

    res.json({ newSheet, comercio });
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Image upload failed');
  }
};

const listOfSheets = async (req, res) => {
  const { _id } = await userService.findBySessionId(req.cookies.sessionId);
  if (!_id) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  try {
    const user = await userService.findById(_id);
    if (!user || !user.google || !user.google.sheets) {
      return res.status(404).json({ error: 'No sheets found for this user' });
    }
    res.json({ sheets: user.google.sheets });
  } catch (error) {
    console.error('Error fetching sheets:', error);
    res.status(500).json({ error: 'Failed to fetch sheets' });
  }
};

module.exports = { uploadImage, listOfSheets };
