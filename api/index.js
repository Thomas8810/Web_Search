const express = require("express");
const path = require("path");
const cookieSession = require("cookie-session");
const multer = require("multer");

const sessionMiddleware = require("../middleware/session");
const { loadDataFromFile, loadUsersData } = require("../utils/fileUtils");

const authRoutes = require("../routes/authRoutes");
const taskRoutes = require("../routes/taskRoutes");
const commentRoutes = require("../routes/commentRoutes");
const attachmentRoutes = require("../routes/attachmentRoutes");
const dataRoutes = require("../routes/dataRoutes");
const activeUsersRoutes = require("../routes/activeUsersRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession(sessionMiddleware));
app.use(express.static(path.join(__dirname, "../public")));

loadDataFromFile();
loadUsersData();

app.use("/api", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/active-users", activeUsersRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "login.html"));
});

// ⚠️ Quan trọng: export app, KHÔNG listen
module.exports = app;
