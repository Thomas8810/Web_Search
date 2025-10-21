const express = require("express");
const path = require("path");
const cookieSession = require("cookie-session");
const multer = require("multer");
const { loadDataFromFile, loadUsersData, cachedData, headerOrder } = require("./utils/fileUtils");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const commentRoutes = require("./routes/commentRoutes");
const attachmentRoutes = require("./routes/attachmentRoutes");
const dataRoutes = require("./routes/dataRoutes");
const activeUsersRoutes = require("./routes/activeUsersRoutes");
const sessionMiddleware = require("./middleware/session");

const app = express();
const port = process.env.PORT || 3000;

// Middleware chung
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession(sessionMiddleware));
app.use(express.static(path.join(__dirname, "public")));

// Tải dữ liệu
loadDataFromFile();
loadUsersData();

// Routes
app.use("/", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/active-users", activeUsersRoutes);

// Trang chính sau khi login
app.get("/", (req, res) => res.redirect("/home.html"));

// Khởi động server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

module.exports = app;
