require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieSession = require("cookie-session");
const multer = require("multer");

const sessionMiddleware = require("../../middleware/session"); // ⚠️ cũng cần lùi 2 cấp
const { loadDataFromFile, loadUsersData } = require("../../utils/fileUtils"); // ✅ sửa đường dẫn

// ✅ Gọi trước khi require routes
loadDataFromFile();
loadUsersData();
console.log("🔍 Users after load:", require("../../utils/fileUtils").usersData.length);

// Sau đó mới import routes
const authRoutes = require("../../routes/authRoutes");
const taskRoutes = require("../../routes/taskRoutes");
const commentRoutes = require("../../routes/commentRoutes");
const attachmentRoutes = require("../../routes/attachmentRoutes");
const dataRoutes = require("../../routes/dataRoutes");
const activeUsersRoutes = require("../../routes/activeUsersRoutes");

const app = express();
const port = process.env.PORT || 3000;

// Middleware chung
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession(sessionMiddleware));

// ⚠️ Lùi 2 cấp để trỏ đúng thư mục public
app.use(express.static(path.join(__dirname, "../../public")));

// Routes chính
app.use("/api", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/active-users", activeUsersRoutes);

// ⚠️ Trang mặc định (login)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public", "login.html"));
});

// ⚙️ Chỉ listen khi chạy local
if (require.main === module) {
  app.listen(port, () => {
    console.log(`✅ Server running locally on port ${port}`);
  });
}

// ⚠️ BẮT BUỘC: export app để Vercel chạy được
module.exports = app;
