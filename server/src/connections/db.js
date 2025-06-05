const mongoose = require('mongoose');
const { credentials } = require('../config/credentials');
const connect = async () => {
  try {
    const conn = await mongoose.connect(
      `mongodb+srv://${credentials.mongo_user}:${credentials.mongo_pass}@${credentials.mongo_host}/${credentials.mongo_db}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
  }
};

module.exports = connect;
