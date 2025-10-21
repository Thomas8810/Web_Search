const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/auth");

const activeUsers = new Map(); // username => lastSeen

// Theo dõi hoạt động user
router.use((req, res, next) => {
  if (req.session && req.session.user) {
    activeUsers.set(req.session.user.name, Date.now());
  }
  next();
});

// API: Lấy danh sách online
router.get("/", isAdmin, (req, res) => {
  const now = Date.now();
  const threshold = 2 * 60 * 1000; // 2 phút
  const online = [];

  activeUsers.forEach((lastSeen, name) => {
    if (now - lastSeen < threshold) online.push(name);
  });

  res.json({ success: true, users: online });
});

module.exports = router;
