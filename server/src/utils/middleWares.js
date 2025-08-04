function isAuthenticated(req, res, next) {
  if (req.isAuthenticated?.() || req.session?.user) {
    return next();
  }
  return res.status(401).json({ message: 'No autorizado' });
}

module.exports = {
  isAuthenticated,
};
