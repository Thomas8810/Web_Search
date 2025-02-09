const express = require('express');
const xlsx = require('xlsx');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;  // Dùng process.env.PORT để chạy trên Railway

// Thiết lập thư mục tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Đọc file Excel (đổi đường dẫn cho phù hợp với Railway)
const workbook = xlsx.readFile(path.join(__dirname, 'book1.xlsx'));  // Nếu lỗi, cần lưu file này trong thư mục `public`
const sheetNames = workbook.SheetNames;
let data = [];

// Gộp dữ liệu từ tất cả các sheet, thêm thuộc tính "Sheet" cho mỗi dòng
sheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  let jsonData = xlsx.utils.sheet_to_json(sheet);
  jsonData = jsonData.map(row => {
    row.Sheet = sheetName;
    return row;
  });
  data = data.concat(jsonData);
});

// Endpoint /filters
app.get('/filters', (req, res) => {
  const getDistinct = (col) => {
    let values = data.map(row => row[col]).filter(v => v != null);
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

// Endpoint /search
app.get('/search', (req, res) => {
  let filtered = data;
  for (let key in req.query) {
    if (req.query[key]) {
      const values = req.query[key].split(',').map(val => val.trim().toLowerCase());
      filtered = filtered.filter(row => {
        if (row[key]) {
          const cellValue = row[key].toString().toLowerCase();
          return values.some(val => cellValue.includes(val));
        }
        return false;
      });
    }
  }
  res.json(filtered);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
