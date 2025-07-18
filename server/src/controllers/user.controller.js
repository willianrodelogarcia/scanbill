const { userService } = require('../services');

const createOneUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await userService.findOneUser(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    const newUser = await userService.createUser({
      username,
      password,
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { createOneUser };
