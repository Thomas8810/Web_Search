const express = require("express");
const path = require("path");
const router = express.Router();
const { usersData } = require("../utils/fileUtils");

// Trang login
router.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});

// API: Kiểm tra trạng thái đăng nhập
router.get("/api/me", (req, res) => {
  if (!req.session.user) return res.json({ success: false });
  res.json({ success: true, user: req.session.user });
});

// API: Đăng nhập
router.post("/login", (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password)
    return res.json({ success: false, message: "Thiếu tên hoặc mật khẩu" });

  const user = usersData.find(
    (u) =>
      (u.email && u.email.toLowerCase() === identifier.toLowerCase()) ||
      (u.name && u.name.toLowerCase() === identifier.toLowerCase())
  );

  if (!user)
    return res.json({ success: false, message: "Không tìm thấy người dùng" });
  if (user.password !== password)
    return res.json({ success: false, message: "Sai mật khẩu" });

  req.session.user = { name: user.name, email: user.email, role: user.role };
  res.json({ success: true, message: "Đăng nhập thành công", user: req.session.user });
});

// API: Đăng xuất
router.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login.html");
});

module.exports = router;
