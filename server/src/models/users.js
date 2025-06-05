const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  dt_created: { type: Date, default: Date.now },
  rol: { type: String, default: 'user' },
});

module.exports = mongoose.model('User', userSchema);
