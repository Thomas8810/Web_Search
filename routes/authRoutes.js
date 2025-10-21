const express = require("express");
const path = require("path");
const router = express.Router();
const fileUtils = require("../utils/fileUtils");

router.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});

router.get("/api/me", (req, res) => {
  if (!req.session.user) return res.json({ success: false });
  res.json({ success: true, user: req.session.user });
});

router.post("/login", (req, res) => {
  const identifier =
    req.body.identifier || req.body.username || req.body.email || "";
  const password = req.body.password || "";

  console.log("📩 Yêu cầu đăng nhập:", { identifier, password });
  console.log("📦 Danh sách người dùng:", fileUtils.usersData.length);

  if (!identifier || !password)
    return res.json({ success: false, message: "Thiếu tên hoặc mật khẩu" });

  // 🔍 Làm sạch kỹ để loại bỏ BOM hoặc ký tự ẩn
  const cleanIdentifier = identifier
    .normalize("NFKC")
    .replace(/[^\x20-\x7EÀ-ỹ]/g, "")
    .trim()
    .toLowerCase();
  const cleanPassword = password.trim();

  const user = fileUtils.usersData.find((u) => {
    const email = u.email
      ?.normalize("NFKC")
      .replace(/[^\x20-\x7EÀ-ỹ]/g, "")
      .trim()
      .toLowerCase();
    const name = u.name
      ?.normalize("NFKC")
      .replace(/[^\x20-\x7EÀ-ỹ]/g, "")
      .trim()
      .toLowerCase();
    return email === cleanIdentifier || name === cleanIdentifier;
  });

  if (!user) {
    console.warn("❌ Không tìm thấy người dùng:", cleanIdentifier);
    return res.json({ success: false, message: "Không tìm thấy người dùng" });
  }

  if (user.password !== cleanPassword) {
    console.warn("❌ Sai mật khẩu cho:", cleanIdentifier);
    return res.json({ success: false, message: "Sai mật khẩu" });
  }

  req.session.user = { name: user.name, email: user.email, role: user.role };
  console.log("✅ Đăng nhập thành công:", req.session.user);

  res.json({
    success: true,
    message: "Đăng nhập thành công",
    user: req.session.user,
  });
});

router.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login.html");
});

module.exports = router;
