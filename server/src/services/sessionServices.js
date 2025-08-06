const { Session } = require('../models');

const findSessionById = async id => {
  return await Session.findById(id);
};

const deleteSessionById = async id => {
  return await Session.deleteMany({ 'session.userId': id });
};

module.exports = {
  findSessionById,
  deleteSessionById,
};
