const express = require('express');
const xlsx = require('xlsx');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Thiết lập thư mục tĩnh cho frontend
app.use(express.static(path.join(__dirname, 'public')));

// **LINK GOOGLE SHEETS XUẤT RA EXCEL (Thay YOUR_FILE_ID bằng ID thật)**
const fileUrl = 'https://docs.google.com/spreadsheets/d/1mMiVqnAE_y5uEH8MS7zk5BAF6w1P50Br/export?format=xlsx';
const tempFilePath = '/tmp/book1.xlsx';

// **Tải file từ Google Drive và đọc dữ liệu**
function downloadAndReadExcel(callback) {
    const fileStream = fs.createWriteStream(tempFilePath);
    https.get(fileUrl, (response) => {
        response.pipe(fileStream);
        fileStream.on('finish', () => {
            fileStream.close();
            try {
                // Đọc file Excel vừa tải về
                const workbook = xlsx.readFile(tempFilePath);
                const sheetNames = workbook.SheetNames;
                let data = [];

                // Gộp dữ liệu từ tất cả các sheet
                sheetNames.forEach(sheetName => {
                    const sheet = workbook.Sheets[sheetName];
                    let jsonData = xlsx.utils.sheet_to_json(sheet);
                    jsonData = jsonData.map(row => {
                        row.Sheet = sheetName;
                        return row;
                    });
                    data = data.concat(jsonData);
                });

                callback(null, data);
            } catch (error) {
                callback(error, null);
            }
        });
    }).on('error', (err) => {
        callback(err, null);
    });
}

// **API Lấy danh sách bộ lọc**
app.get('/filters', (req, res) => {
    downloadAndReadExcel((err, data) => {
        if (err) return res.status(500).json({ error: 'Lỗi tải hoặc đọc file Excel' });

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
});

// **API Tìm kiếm dữ liệu**
app.get('/search', (req, res) => {
    downloadAndReadExcel((err, data) => {
        if (err) return res.status(500).json({ error: 'Lỗi tải hoặc đọc file Excel' });

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
});

// **Khởi động server**
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
