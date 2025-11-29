# 🚀 Hướng Dẫn Chạy Backend - Windows

## Cách 1: Chạy trực tiếp (Khuyến nghị)

### 1. Mở PowerShell/Terminal và di chuyển vào thư mục Backend:

```powershell
cd D:\DEV\Project\MediScanAI\Backend
```

### 2. Tạo virtual environment (nếu chưa có):

```powershell
python -m venv venv
```

### 3. Kích hoạt virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

Nếu gặp lỗi về execution policy, chạy lệnh này trước:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 4. Cài đặt dependencies:

```powershell
pip install -r requirements.txt
```

### 5. Chạy server:

```powershell
python app.py
```

Server sẽ chạy tại: **http://localhost:5000**

---

## Cách 2: Sử dụng script tự động

Tạo file `start_backend.bat` trong thư mục Backend:

```batch
@echo off
echo Starting MediScan Backend...

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo Starting Flask server...
python app.py

pause
```

Sau đó double-click vào file `start_backend.bat` để chạy.

---

## ✅ Kiểm tra Backend đã chạy

Mở trình duyệt và truy cập:

- Health check: http://localhost:5000/api/health

Bạn sẽ thấy response:

```json
{
  "status": "ok",
  "message": "Backend API is running",
  "drugs_loaded": 8610
}
```

---

## 🔧 Troubleshooting

### Lỗi: "ModuleNotFoundError"

- Đảm bảo đã kích hoạt virtual environment
- Chạy lại: `pip install -r requirements.txt`

### Lỗi: "Port 5000 already in use"

- Đóng ứng dụng khác đang dùng port 5000
- Hoặc đổi port trong `app.py` (dòng 314): `app.run(debug=True, host='0.0.0.0', port=5001)`

### Lỗi: "FileNotFoundError" khi load CSV/PDF

- Đảm bảo file `drug_database_refined.csv` và `duoc-thu-quoc-gia-viet-nam-2018.pdf`
  nằm trong thư mục `Crawldata/`

---

## 📝 Lưu ý

- Backend cần chạy **song song** với Frontend
- Frontend đã được cấu hình để gọi API tại `http://localhost:5000/api`
- Khi chạy, bạn sẽ thấy log:
  ```
  ✅ Đã load 8610 thuốc từ database
  ✅ Đã load PDF với XXXX trang
  🚀 Starting MediScan AI Backend Server...
  📡 API available at http://localhost:5000
  ```
