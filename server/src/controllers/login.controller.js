const jwt = require('jsonwebtoken');
const { userService } = require('../services');
const { getAuthUrl, getAccessToken } = require('../utils/googleAuth');
const {
  config: {
    JWT_SECRETS: { jwtSecret, jwtExpiry },
    SECURE_HTTPS,
  },
} = require('../config');

const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await userService.findOneUser(username);
  if (!user) {
    return res.status(404).json({ message: 'No user found' });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  const token = jwt.sign({ userId: user._id, username }, jwtSecret, {
    expiresIn: jwtExpiry,
  });

  res.cookie('token', token, {
    httpOnly: true,
    path: '/',
    secure: true, // Set to true if using HTTPS
    sameSite: 'none', // Adjust based on your requirements
  });

  res.json({ ok: true });
};

const validateLogin = async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    const user = jwt.verify(token, jwtSecret);
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const loginWithGoogle = async (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
};

const handleGoogleCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code not provided' });
  }

  const { data, tokens } = await getAccessToken(code);

  let user = await User.findOne({ email: data.email });
  if (!user) {
    user = await userService.createUser({
      username: data.name,
      email: data.email,
      googleId: data.id,
      password: null,
    });
  }
  req.session.tokens = tokens;
  req.session.userId = user._id;
  res.redirect('http://localhost:4321/');
};

const getTokenFromSession = (req, res) => {
  if (!req.session || !req.session.tokens) {
    return null;
  }
  res.json(req.session.tokens);
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findOneUser(email);
  if (!user || !user.password) {
    return res.status(404).json({ message: 'No user found' });
  }

  req.session.userId = user._id;
  res.json({
    message: 'Inicio de sesión exitoso',
    user: { name: user.name, email },
  });
};

const validateLoginUser = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ authenticated: false });
  }

  const user = await userService.findById(req.session.userId);
  if (!user) return res.status(401).json({ authenticated: false });

  res.json({
    authenticated: true,
    user: {
      name: user.name,
      email: user.email,
    },
  });
};

const logoutUser = (req, res) => {
  req.session = null;
  res.json({ message: 'Logout successful' });
};

module.exports = {
  login,
  validateLogin,
  loginWithGoogle,
  handleGoogleCallback,
  getTokenFromSession,
  loginUser,
  validateLoginUser,
  logoutUser,
};
