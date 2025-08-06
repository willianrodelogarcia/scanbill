const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  expires: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 },
  session: { type: Object, required: true },
});
module.exports = mongoose.model('Session', sessionSchema);
