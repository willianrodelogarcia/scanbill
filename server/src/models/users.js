const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleId: { type: String, default: null },
  password: { type: String, default: null },
  dt_created: { type: Date, default: Date.now },
  rol: { type: String, default: 'user' },
});

module.exports = mongoose.model('User', userSchema);
