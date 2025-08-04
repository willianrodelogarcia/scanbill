const { file } = require('googleapis/build/src/apis/file');
const { User } = require('../models');

const createUser = async data => {
  const newUser = new User(data);
  return newUser.save();
};

const findUser = async () => {
  return await User.find();
};

const findOneUser = async email => {
  return await User.findOne({ email });
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

const findOneGoogle = async ({ email }) => {
  return await User.findOne({ email });
};

const findAndUpdateByEmail = async ({
  email,
  spreadsheetId,
  comercio,
  newSheet,
}) => {
  return await User.findOneAndUpdate(
    { email },
    {
      $push: {
        'google.sheets': {
          title: comercio,
          filename: newSheet,
          spreadsheetId,
        },
      },
    },
    { new: true, runValidators: true },
  );
};

const updateGoogleUser = async (id, data) => {
  return await User.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        googleId: data.googleId,
        userName: data.userName,
        email: data.email,
        'google.access_token': data.google.access_token,
        'google.refresh_token': data.google.refresh_token,
        'google.scope': data.google.scope,
        'google.token_type': data.google.token_type,
        'google.expiry_date': data.google.expiry_date,
      },
      $setOnInsert: {
        'google.sheets': data.google.sheets || [],
      },
    },
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
  findById,
  findOneGoogle,
  findAndUpdateByEmail,
  updateGoogleUser,
};
