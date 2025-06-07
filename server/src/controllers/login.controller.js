const jwt = require('jsonwebtoken');
const { userService } = require('../services');
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
    secure: SECURE_HTTPS, // Set to true if using HTTPS
    sameSite: 'lax',
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

module.exports = {
  login,
  validateLogin,
};
