const { Session } = require('../models');

const findSessionById = async id => {
  return await Session.findById(id);
};

const deleteSessionById = async id => {
  return await Session.deleteMany({ 'session.userId': id });
};

const createSession = async ({ sessionId, session }) => {
  const newSession = new Session({
    _id: sessionId,
    expires: new Date(Date.now() + 60 * 60 * 24 * 1000),
    session,
  });
  return await newSession.save();
};

module.exports = {
  findSessionById,
  deleteSessionById,
  createSession,
};
