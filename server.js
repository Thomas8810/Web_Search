const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Thiết lập thư mục tĩnh cho frontend
app.use(express.static(path.join(__dirname, 'public')));

// Đường dẫn đến tệp JSON đã được tạo bởi workflow
const dataFilePath = path.join(__dirname, 'data.json');

/**
 * Hàm load dữ liệu từ file data.json
 * @param {Function} callback - callback(error, data)
 */
function loadData(callback) {
  fs.readFile(dataFilePath, 'utf8', (err, fileData) => {
    if (err) {
      console.error("Lỗi khi đọc file data.json:", err);
      return callback(err, null);
    }
    try {
      const jsonData = JSON.parse(fileData);
      callback(null, jsonData);
    } catch (parseErr) {
      console.error("Lỗi khi parse file data.json:", parseErr);
      callback(parseErr, null);
    }
  });
}

// API Lấy danh sách bộ lọc dựa trên dữ liệu trong data.json
app.get('/filters', (req, res) => {
  loadData((err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi đọc file data.json' });
    }

    // Hàm lấy các giá trị khác nhau từ một cột
    const getDistinct = (col) => {
      const values = data.map(row => row[col]).filter(v => v != null);
      return Array.from(new Set(values));
    };

    res.json({
      "Sheet": getDistinct("Sheet"),
      "PO Number": getDistinct("PO Number"),
      "Project": getDistinct("Project"),
      "Part Number": getDistinct("Part Number"),
      "REV": getDistinct("REV"),
      "Discription": getDistinct("Discription"),
      "Note Number": getDistinct("Note Number"),
      "Critical": getDistinct("Critical"),
      "CE": getDistinct("CE"),
      "Material": getDistinct("Material"),
      "Plating": getDistinct("Plating"),
      "Painting": getDistinct("Painting"),
      "Tiêu chuẩn mạ sơn": getDistinct("Tiêu chuẩn mạ sơn"),
      "Ngày Nhận PO": getDistinct("Ngày Nhận PO"),
      "Cover sheet": getDistinct("Cover sheet"),
      "Drawing": getDistinct("Drawing"),
      "Datasheet form": getDistinct("Datasheet form"),
      "Data": getDistinct("Data"),
      "COC": getDistinct("COC"),
      "BOM": getDistinct("BOM"),
      "Mill": getDistinct("Mill"),
      "Part Pictures": getDistinct("Part Pictures"),
      "Packaging Pictures": getDistinct("Packaging Pictures"),
      "Submit date": getDistinct("Submit date"),
      "Đã lên PO LAM": getDistinct("Đã lên PO LAM"),
      "OK": getDistinct("OK"),
      "Remark": getDistinct("Remark"),
      "Remark 2": getDistinct("Remark 2"),
      "Status": getDistinct("Status"),
      "Note": getDistinct("Note")
    });
  });
});

// API Tìm kiếm dữ liệu dựa trên query parameters từ dữ liệu trong data.json
app.get('/search', (req, res) => {
  loadData((err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi đọc file data.json' });
    }

    let filtered = data;
    // Duyệt qua các query parameter để lọc dữ liệu
    for (let key in req.query) {
      if (req.query[key]) {
        const filterValues = req.query[key].split(',').map(val => val.trim().toLowerCase());
        filtered = filtered.filter(row => {
          if (row[key]) {
            const cellValue = row[key].toString().toLowerCase();
            return filterValues.some(val => cellValue.includes(val));
          }
          return false;
        });
      }
    }
    res.json(filtered);
  });
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
