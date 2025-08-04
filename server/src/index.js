const express = require('express');
const {
  uploadRouter,
  loginRouter,
  userRouter,
  loginGoogleRouter,
} = require('./routes');
const {
  config: { urls },
} = require('./config');
const cookieParser = require('cookie-parser');
const session = require('cookie-session');
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

  app.use(
    session({
      name: 'session',
      keys: [process.env.SESSION_SECRET],
      maxAge: 24 * 60 * 60 * 1000,
    }),
  );

  await connect();

  app.use('/api/upload', uploadRouter);
  app.use('/api/login', loginRouter);
  app.use('/api/user', userRouter);

  // new route for Google login
  app.use('/auth', loginGoogleRouter);

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

module.exports = start;
