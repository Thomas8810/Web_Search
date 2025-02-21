const express = require('express');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

// Cấu hình session (chỉ dùng cho nội bộ, không cần quá bảo mật)
app.use(session({
  secret: 'your-secret-key', // Thay thế bằng chuỗi khó đoán
  resave: false,
  saveUninitialized: false
}));

// Cho phép parse dữ liệu từ form (để xử lý đăng nhập)
app.use(express.urlencoded({ extended: false }));

// Thiết lập thư mục tĩnh cho các file tĩnh (HTML, CSS, JS) – đặt trong thư mục public
app.use(express.static(path.join(__dirname, 'public')));

const dataFilePath = path.join(__dirname, 'data.json');
let cachedData = [];

// Đọc dữ liệu từ file data.json khi server khởi động và lưu vào cache
function loadDataFromFile() {
  try {
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    cachedData = JSON.parse(fileData);
    console.log("Dữ liệu được tải và cache thành công.");
  } catch (err) {
    console.error("Lỗi khi đọc file data.json:", err);
  }
}
loadDataFromFile();

// --- Phần đăng nhập cơ bản ---
// Danh sách người dùng mẫu (trong thực tế nên lưu vào CSDL và mật khẩu được hash)
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' }
];

// Middleware kiểm tra đăng nhập
function checkAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login.html');
}

// Các API và route cần bảo vệ phải được đặt sau middleware bảo vệ
app.use('/home.html', checkAuth);
app.use('/filters', checkAuth);
app.use('/search', checkAuth);
app.use('/export', checkAuth);

// --- Các API hiện có ---

// API lấy danh sách giá trị lọc (distinct)
app.get('/filters', (req, res) => {
  const getDistinct = (col) => {
    const values = cachedData.map(row => row[col]).filter(v => v != null);
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

// API tìm kiếm dữ liệu với phân trang
app.get('/search', (req, res) => {
  let filtered = cachedData;
  const { limit, offset, ...filters } = req.query;

  for (let key in filters) {
    if (filters[key]) {
      const filterValues = filters[key].split(',').map(val => val.trim().toLowerCase());
      filtered = filtered.filter(row => {
        if (row[key]) {
          const cellValue = row[key].toString().toLowerCase();
          return filterValues.some(val => cellValue.includes(val));
        }
        return false;
      });
    }
  }

  const total = filtered.length;
  const pageLimit = parseInt(limit, 10) || 50;
  const pageOffset = parseInt(offset, 10) || 0;
  const paginatedData = filtered.slice(pageOffset, pageOffset + pageLimit);

  res.json({ total, data: paginatedData });
});

// API xuất toàn bộ dữ liệu đã lọc dưới dạng file Excel
app.get('/export', (req, res) => {
  let filtered = cachedData;
  const { limit, offset, ...filters } = req.query;

  for (let key in filters) {
    if (filters[key]) {
      const filterValues = filters[key].split(',').map(val => val.trim().toLowerCase());
      filtered = filtered.filter(row => {
        if (row[key]) {
          const cellValue = row[key].toString().toLowerCase();
          return filterValues.some(val => cellValue.includes(val));
        }
        return false;
      });
    }
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(filtered);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename=export.xlsx');
  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(buf);
});

// --- Route đăng nhập & đăng xuất ---
// Trang login (login.html được đặt trong thư mục public)
app.get('/login', (req, res) => {
  res.redirect('/login.html');
});

// Xử lý đăng nhập (POST /login)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = user;
    res.redirect('/home.html');
  } else {
    res.redirect('/login.html?error=1');
  }
});

// Route đăng xuất
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login.html');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
