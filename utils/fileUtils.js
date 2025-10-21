const fs = require("fs");
const path = require("path");

let cachedData = [];
let usersData = [];
let headerOrder = [];

function loadDataFromFile() {
  try {
    const filePath = path.resolve(__dirname, "../../data/data.json"); // ✅ chính xác
    cachedData = JSON.parse(fs.readFileSync(filePath, "utf8"));
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

function loadUsersData() {
  try {
    const filePath = path.resolve(__dirname, "../../data/users.json"); // ✅ chính xác
    usersData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log(`✅ Loaded ${usersData.length} users from users.json`);
  } catch (err) {
    console.error("❌ Error loading users.json:", err.message);
  }
}

module.exports = { loadDataFromFile, loadUsersData, cachedData, usersData, headerOrder };
