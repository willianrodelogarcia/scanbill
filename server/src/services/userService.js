const { User } = require('../models');

const createUser = async data => {
  const newUser = new User(data);
  return newUser.save();
};

const findUser = async () => {
  return await User.find();
};

const findOneUser = async username => {
  return await User.findOne({ username });
};

const findOneAndUpdate = async ({ id, data }) => {
  return await User.findByIdAndUpdate(
    { _id: id },
    { $set: data },
    {
      new: true,
      runValidators: true,
    },
  );
};

const findById = async id => {
  return await User.findById(id);
};

module.exports = {
  createUser,
  findUser,
  findOneAndUpdate,
  findOneUser,
  findById,
};
