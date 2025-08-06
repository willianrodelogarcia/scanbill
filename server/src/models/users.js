const mongoose = require('mongoose');

const SheetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  spreadsheetId: { type: String, required: true },
  filename: { type: String, required: true },
  createAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleId: { type: String, default: null },
  password: { type: String, default: null },
  dt_created: { type: Date, default: Date.now },
  rol: { type: String, default: 'user' },
  google: {
    access_token: { type: String, default: null },
    refresh_token: { type: String, default: null },
    sheets: { type: [SheetSchema], default: [] },
    scope: { type: String, default: null },
    token_type: { type: String, default: null },
    expiry_date: { type: Number, default: null },
  },
});

module.exports = mongoose.model('User', userSchema);
