const fs = require("fs");
const path = require("path");

let cachedData = [];
let usersData = [];
let headerOrder = [];

/**
 * 🧹 Hàm loại bỏ ký tự BOM (Byte Order Mark) nếu có
 */
function removeBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    return content.slice(1);
  }
  return content;
}

/**
 * 📂 Load dữ liệu từ data.json
 */
function loadDataFromFile() {
  try {
    const filePath = path.resolve(__dirname, "../data/data.json"); // ✅ đường dẫn mới
    let raw = fs.readFileSync(filePath, "utf8");
    raw = removeBOM(raw);

    cachedData = JSON.parse(raw);
    if (cachedData.length > 0) {
      const headerSet = new Set();
      cachedData.forEach(row => Object.keys(row).forEach(k => headerSet.add(k)));
      headerOrder = Array.from(headerSet);
    }

    console.log(`✅ Loaded ${cachedData.length} records from data.json`);
  } catch (err) {
    console.error("❌ Error loading data.json:", err.message);
  }
}

/**
 * 👤 Load danh sách người dùng từ users.json
 */
function loadUsersData() {
  try {
    const filePath = path.resolve(__dirname, "../data/users.json"); // ✅ đường dẫn mới
    let raw = fs.readFileSync(filePath, "utf8");
    raw = removeBOM(raw);

    usersData = JSON.parse(raw);
    console.log(`✅ Loaded ${usersData.length} users from users.json`);
  } catch (err) {
    console.error("❌ Error loading users.json:", err.message);
  }
}

module.exports = { loadDataFromFile, loadUsersData, cachedData, usersData, headerOrder };
