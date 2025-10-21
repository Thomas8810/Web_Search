function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect("/login.html");
}

function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === "admin")
    return next();
  return res.status(403).json({ success: false, message: "Admin required" });
}

module.exports = { isAuthenticated, isAdmin };
