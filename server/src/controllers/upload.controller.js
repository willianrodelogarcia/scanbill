const { v2: cloudinary } = require('cloudinary');
const { addRow } = require('../utils/googleSheet');
const fs = require('fs');
const path = require('path');

const { readText } = require('../utils/readText');

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
    const {
      file,
      body: { name },
    } = req;

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: 'Bills',
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

    await addRow(text, name);

    res.json({ url: uploadResult.url });
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Image upload failed');
  }
};
module.exports = { uploadImage };
