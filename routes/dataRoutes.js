const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const { isAuthenticated } = require("../middleware/auth");
const { cachedData, headerOrder } = require("../utils/fileUtils");
const { convertYYYYMMDDToExcelSerial } = require("../utils/dateUtils");

// API trả dữ liệu
router.get("/", isAuthenticated, (req, res) => {
  res.json(cachedData);
});

// API lọc dữ liệu (theo thời gian hoặc từ khóa)
router.get("/search", isAuthenticated, (req, res) => {
  let results = [...cachedData];
  const params = req.query;
  const dateColumns = ["PO received date", "Customer need date", "Submit date"];

  for (const key in params) {
    if (params[key]) {
      const isStart = key.endsWith("_start");
      const isEnd = key.endsWith("_end");
      const baseKey = isStart ? key.slice(0, -6) : isEnd ? key.slice(0, -4) : key;

      if (dateColumns.includes(baseKey)) {
        results = results.filter((item) => {
          if (!item[baseKey]) return false;
          const itemDate =
            typeof item[baseKey] === "number"
              ? item[baseKey]
              : convertYYYYMMDDToExcelSerial(item[baseKey].toString());
          const start = params[`${baseKey}_start`]
            ? convertYYYYMMDDToExcelSerial(params[`${baseKey}_start`])
            : null;
          const end = params[`${baseKey}_end`]
            ? convertYYYYMMDDToExcelSerial(params[`${baseKey}_end`])
            : null;

          return (
            (!start || itemDate >= start) && (!end || itemDate <= end)
          );
        });
      } else if (!isStart && !isEnd) {
        let values = params[key].split(",");
        results = results.filter(
          (item) =>
            item[key] &&
            values.some((v) =>
              item[key].toString().toLowerCase().includes(v.toLowerCase())
            )
        );
      }
    }
  }

  const total = results.length;
  const limit = parseInt(params.limit) || 50;
  const offset = parseInt(params.offset) || 0;
  res.json({ data: results.slice(offset, offset + limit), total });
});

// API export Excel
router.get("/export", isAuthenticated, (req, res) => {
  const ws = XLSX.utils.json_to_sheet(cachedData, { header: headerOrder });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Disposition", 'attachment; filename="data.xlsx"');
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.send(buffer);
});

module.exports = router;
