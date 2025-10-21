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

  console.log("📩 Yêu cầu đăng nhập:", { identifier, password });
  console.log("📦 Danh sách người dùng:", usersData.length);

  if (!identifier || !password)
    return res.json({ success: false, message: "Thiếu tên hoặc mật khẩu" });

  const cleanIdentifier = identifier.trim().toLowerCase();
  const cleanPassword = password.trim();

  const user = usersData.find((u) => {
    const email = u.email?.trim().toLowerCase();
    const name = u.name?.trim().toLowerCase();
    return email === cleanIdentifier || name === cleanIdentifier;
  });

  if (!user)
    return res.json({ success: false, message: "Không tìm thấy người dùng" });
  if (user.password !== cleanPassword)
    return res.json({ success: false, message: "Sai mật khẩu" });

  req.session.user = { name: user.name, email: user.email, role: user.role };
  console.log("✅ Đăng nhập thành công:", req.session.user);

  res.json({ success: true, message: "Đăng nhập thành công", user: req.session.user });
});

// API: Đăng xuất
router.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login.html");
});

module.exports = router;
