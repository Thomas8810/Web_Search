const fs = require("fs");
let cachedData = [];
let usersData = [];
let headerOrder = [];

function loadDataFromFile() {
  try {
    cachedData = require("../data.json");
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
    usersData = require("../users.json");
    console.log(`✅ Loaded ${usersData.length} users from users.json`);
  } catch (err) {
    console.error("❌ Error loading users.json:", err.message);
  }
}

module.exports = { loadDataFromFile, loadUsersData, cachedData, usersData, headerOrder };
