const express = require('express');
const { uploadRouter, loginRouter, userRouter } = require('./routes');
const {
  config: { urls },
} = require('./config');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connect = require('./connections/db');
const app = express();
const port = 3000;

const start = async () => {
  app.use(cookieParser());
  app.use(express.json());
  app.use(
    cors({
      origin: urls.frontend_url,
      credentials: true,
    }),
  );

  await connect();

  app.use('/api/upload', uploadRouter);
  app.use('/api/login', loginRouter);
  app.use('/api/user', userRouter);

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

module.exports = start;
