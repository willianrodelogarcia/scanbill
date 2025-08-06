const express = require('express');
const {
  uploadRouter,
  loginRouter,
  userRouter,
  loginGoogleRouter,
} = require('./routes');
const {
  config: { urls, isProduction },
} = require('./config');
const { credentials } = require('./config/credentials');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const connect = require('./connections/db');
const MongoStore = require('connect-mongo');
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
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: `mongodb+srv://${credentials.mongo_user}:${credentials.mongo_pass}@${credentials.mongo_host}/${credentials.mongo_db}`,
        collectionName: 'sessions',
        autoRemove: 'interval',
        autoRemoveInterval: 10,
        stringify: false,
      }),
      cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24,
      },
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
