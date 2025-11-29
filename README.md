# MediScan AI - Ứng dụng quét và nhận diện thuốc

Ứng dụng web sử dụng AI để quét và nhận diện thông tin thuốc từ camera.

## 📋 Yêu cầu hệ thống

- **Node.js** >= 16.x (cho Frontend)
- **Python** >= 3.8 (cho Backend)
- **Camera** (webcam hoặc camera điện thoại)
- **npm** hoặc **yarn** hoặc **pnpm**

## 🚀 Cài đặt và chạy

### 1. Cài đặt Backend

```bash
cd Backend
pip install -r requirements.txt
```

### 2. Chạy Backend Server

```bash
cd Backend
python app.py
```

Backend sẽ chạy tại: **http://localhost:5000**

### 3. Cài đặt Frontend

Mở terminal mới:

```bash
cd Web
npm install
```

### 4. Chạy Frontend

```bash
cd Web
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

## 📱 Sử dụng

1. Mở trình duyệt và truy cập `http://localhost:3000`
2. Nhấn nút **SCAN** ở giữa thanh điều hướng
3. Cho phép trình duyệt truy cập camera
4. Đặt thuốc trong khung quét
5. Nhấn nút chụp để quét
6. Xem kết quả nhận diện

## 🏗️ Cấu trúc dự án

```
MediScanAI/
├── Backend/           # Flask API server
│   ├── app.py        # Main API server
│   ├── requirements.txt
│   └── README.md
├── Web/              # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ScanOverlay.jsx    # Camera scan component
│   │   │   └── modals/
│   │   │       └── ScanResultModal.jsx
│   │   └── App.jsx
│   └── package.json
└── Crawldata/        # Drug database
    └── drug_index.csv
```

## 🔧 API Endpoints

### Health Check
```
GET http://localhost:5000/api/health
```

### Scan thuốc
```
POST http://localhost:5000/api/scan
Content-Type: application/json

{
  "image": "base64_encoded_image"
}
```

### Tìm kiếm thuốc
```
GET http://localhost:5000/api/drugs/search?q=panadol
```

## 📝 Ghi chú

- **OCR**: Hiện tại OCR đang dùng placeholder. Để tích hợp OCR thật:
  - Cài đặt Tesseract: `pip install pytesseract`
  - Hoặc sử dụng Google Cloud Vision API
  - Hoặc các AI model khác

- **Camera**: Ứng dụng yêu cầu quyền truy cập camera. Trên mobile, sẽ tự động sử dụng camera sau.

- **CORS**: Backend đã được cấu hình CORS để cho phép frontend gọi API.

## 🐛 Xử lý lỗi

### Lỗi không truy cập được camera
- Kiểm tra quyền truy cập camera trong trình duyệt
- Đảm bảo đang sử dụng HTTPS hoặc localhost

### Lỗi kết nối API
- Kiểm tra backend đã chạy tại port 5000
- Kiểm tra CORS settings
- Kiểm tra firewall/antivirus

### Lỗi không tìm thấy database
- Đảm bảo file `Crawldata/drug_index.csv` tồn tại
- Kiểm tra đường dẫn trong `Backend/app.py`

## 🔐 Bảo mật

- Backend chỉ chấp nhận ảnh dưới 16MB
- Chỉ chấp nhận các định dạng: PNG, JPG, JPEG, GIF, WEBP
- Upload folder được tạo tự động và có thể xóa sau khi xử lý

## 📄 License

MIT

