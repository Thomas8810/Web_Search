require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieSession = require("cookie-session");
const multer = require("multer");

// ⚠️ Đường dẫn phải lùi 1 cấp (vì file này nằm trong /api/)
const { loadDataFromFile, loadUsersData, cachedData, headerOrder } = require("../utils/fileUtils");

const authRoutes = require("../routes/authRoutes");
const taskRoutes = require("../routes/taskRoutes");
const commentRoutes = require("../routes/commentRoutes");
const attachmentRoutes = require("../routes/attachmentRoutes");
const dataRoutes = require("../routes/dataRoutes");
const activeUsersRoutes = require("../routes/activeUsersRoutes");
const sessionMiddleware = require("../middleware/session");

const app = express();
const port = process.env.PORT || 3000;

// Middleware chung
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession(sessionMiddleware));

// ⚠️ Lùi 1 cấp để trỏ đúng thư mục “public”
app.use(express.static(path.join(__dirname, "../public")));

// Tải dữ liệu khi khởi động server
loadDataFromFile();
loadUsersData();

// Routes chính
app.use("/api", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/active-users", activeUsersRoutes);

// ⚠️ Trang mặc định (login)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "login.html"));
});

// ⚙️ Khởi động server (local test)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`✅ Server running locally on port ${port}`);
  });
}

// ⚠️ BẮT BUỘC: export app để Vercel chạy được
module.exports = app;
