# MediScan AI - Backend API

Backend API server để xử lý ảnh từ camera và tìm kiếm thông tin thuốc.

## 📋 Yêu cầu

- Python >= 3.8
- pip

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
cd Backend
pip install -r requirements.txt
```

### 2. Chạy server

```bash
python app.py
```

Server sẽ chạy tại: **http://localhost:5000**

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Scan thuốc từ ảnh
```
POST /api/scan
Content-Type: application/json

Body:
{
  "image": "base64_encoded_image_string"
}
```

Hoặc upload file:
```
POST /api/scan
Content-Type: multipart/form-data

Form data:
- image: (file)
```

### Tìm kiếm thuốc
```
GET /api/drugs/search?q=panadol
```

## 🔧 Cấu hình

- Port mặc định: 5000
- Max file size: 16MB
- Upload folder: `uploads/`

## 📝 Ghi chú

- Hiện tại OCR đang dùng placeholder. Để tích hợp OCR thật, có thể:
  - Cài đặt Tesseract OCR: `pip install pytesseract`
  - Hoặc sử dụng Google Cloud Vision API
  - Hoặc sử dụng các AI model khác

## 🔐 CORS

Backend đã được cấu hình CORS để cho phép frontend gọi API từ localhost:3000.

