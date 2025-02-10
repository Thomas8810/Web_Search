const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const app = express();
const port = process.env.PORT || 3000;

// Cho phép CORS nếu cần thiết (đặc biệt khi gọi API từ frontend)
app.use(cors());

// Thiết lập thư mục tĩnh cho các file frontend (ví dụ: index.html, home.html, background.jpg,...)
app.use(express.static(path.join(__dirname, 'public')));

// Link tải file Excel từ Google Sheets (đã chuyển sang dạng tải trực tiếp)
// Hãy đảm bảo rằng file Google Sheets của bạn được chia sẻ công khai
const googleSheetUrl = 'https://docs.google.com/spreadsheets/d/1mMiVqnAE_y5uEH8MS7zk5BAF6w1P50Br/export?format=xlsx';
// Đường dẫn tạm thời để lưu file trong môi trường serverless (Vercel cho phép ghi vào /tmp)
const tempFilePath = path.join('/tmp', 'book1.xlsx');

/**
 * Hàm tải file Excel từ Google Sheets và đọc dữ liệu.
 * @param {Function} callback - callback(error, data)
 */
function downloadAndReadExcel(callback) {
  console.log("Bắt đầu tải file Excel từ Google Sheets...");
  const fileStream = fs.createWriteStream(tempFilePath);
  
  https.get(googleSheetUrl, (response) => {
    if (response.statusCode !== 200) {
      console.error("Lỗi tải file. Status code:", response.statusCode);
      return callback(new Error("Không tải được file Excel"), null);
    }
    response.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close(() => {
        console.log("Tải file xong, bắt đầu đọc file Excel...");
        try {
          // Đọc file Excel vừa tải về
          const workbook = xlsx.readFile(tempFilePath);
          const sheetNames = workbook.SheetNames;
          let data = [];
          sheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            let jsonData = xlsx.utils.sheet_to_json(sheet);
            // Thêm thuộc tính Sheet để biết dữ liệu đến từ sheet nào
            jsonData = jsonData.map(row => {
              row.Sheet = sheetName;
              return row;
            });
            data = data.concat(jsonData);
          });
          console.log("Đã đọc được", data.length, "dòng dữ liệu.");
          callback(null, data);
        } catch (error) {
          console.error("Lỗi khi đọc file Excel:", error);
          callback(error, null);
        }
      });
    });
  }).on('error', (err) => {
    console.error("Lỗi khi tải file Excel:", err);
    callback(err, null);
  });
}

// Endpoint /filters: Lấy các giá trị khác nhau của các cột từ file Excel
app.get('/filters', (req, res) => {
  downloadAndReadExcel((err, data) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi xử lý file Excel" });
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

// Endpoint /search: Lọc dữ liệu dựa trên query parameters
app.get('/search', (req, res) => {
  downloadAndReadExcel((err, data) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi xử lý file Excel" });
    }
    let filtered = data;
    // Duyệt qua các tham số query, nếu có giá trị, lọc dữ liệu tương ứng
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
