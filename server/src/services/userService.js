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
  console.log(data);
  return await User.findByIdAndUpdate(
    { _id: id },
    { $set: data },
    {
      new: true,
      runValidators: true,
    },
  );
};

module.exports = {
  createUser,
  findUser,
  findOneAndUpdate,
  findOneUser,
};
