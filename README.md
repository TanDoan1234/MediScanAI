# MediScan AI - Ứng dụng quét và nhận diện thuốc

Ứng dụng web sử dụng AI để quét và nhận diện thông tin thuốc từ camera, tra cứu từ Dược thư Quốc gia và tổng hợp thông tin dễ hiểu.

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

### 2. Cấu hình Gemini API (Tùy chọn - để đơn giản hóa thông tin)

1. Lấy API key từ: https://makersuite.google.com/app/apikey
2. Tạo file `.env` trong thư mục `Backend/`:
   ```
   GEMINI_API_KEY=your-api-key-here
   ```

**Lưu ý:** Nếu không cấu hình Gemini API, hệ thống vẫn hoạt động nhưng sẽ hiển thị text gốc từ PDF (không được đơn giản hóa).

### 3. Chạy Backend Server

```bash
cd Backend
python app.py
```

Backend sẽ chạy tại: **http://localhost:5000**

Bạn sẽ thấy:

```
✅ Đã load 8610 thuốc từ database
✅ Đã load PDF với XXXX trang
🚀 Starting MediScan AI Backend Server...
📡 API available at http://localhost:5000
📱 Mobile access: http://192.168.x.x:5000
```

### 4. Cài đặt Frontend

Mở terminal mới:

```bash
cd Web
npm install
```

### 5. Chạy Frontend

```bash
cd Web
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

Vite sẽ hiển thị:

```
➜  Local:   http://localhost:3000/
➜  Network: http://192.168.x.x:3000/
```

## 📱 Sử dụng

1. Mở trình duyệt và truy cập `http://localhost:3000`
2. Nhấn nút **SCAN** ở giữa thanh điều hướng
3. Cho phép trình duyệt truy cập camera
4. Đặt thuốc trong khung quét
5. Nhấn nút chụp để quét
6. Xem và chỉnh sửa text đã nhận diện (nếu cần)
7. Xem kết quả: Tên thuốc, Phân loại, Cách dùng, Lưu ý, Khuyến nghị
8. Nghe text-to-speech tự động đọc thông tin

## 📱 Truy cập từ Mobile

### Cách 1: Tự động (Khuyến nghị)

1. **Lấy IP của PC:**

   ```powershell
   ipconfig
   ```

   Hoặc:

   ```powershell
   cd Backend
   python get_local_ip.py
   ```

2. **Chạy Backend và Frontend** (như hướng dẫn trên)

3. **Mở Firewall** (PowerShell Admin):

   ```powershell
   New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Flask Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
   ```

4. **Truy cập từ mobile:**
   - Đảm bảo mobile và PC cùng WiFi
   - Mở browser trên mobile: `http://192.168.x.x:3000`
   - Nếu browser yêu cầu HTTPS, click "Advanced" → "Proceed to [IP] (unsafe)"

### Cách 2: Dùng Port Forwarding của IDE (Cursor/VS Code)

**Lưu ý:** Cần forward cả 2 ports!

1. **Forward port 3000 (Frontend):**

   - Trong Cursor, mở tab "Ports"
   - Click "Forward a Port"
   - Nhập: `3000`
   - Chọn "Public"

2. **Forward port 5000 (Backend):**

   - Click "Forward a Port" lần nữa
   - Nhập: `5000`
   - Chọn "Public"

3. **Cấu hình API URL:**

   - Copy URL của port 5000 (ví dụ: `https://xxx.cursor.sh:5000`)
   - Tạo file `Web/.env`:
     ```env
     VITE_API_URL=https://xxx.cursor.sh:5000/api
     ```
   - Restart dev server

4. **Truy cập từ mobile:**
   - Dùng URL của port 3000 từ IDE
   - Ví dụ: `https://xxx.cursor.sh:3000`

**⚠️ Lưu ý:** Port forwarding của IDE cần internet và IDE phải mở. Khuyến nghị dùng Cách 1 (truy cập trực tiếp qua IP).

### Cách 3: Cấu hình cố định (Tùy chọn)

Tạo file `Web/.env`:

```env
VITE_API_URL=http://192.168.x.x:5000/api
```

Sau đó restart dev server.

### Fix HTTPS-Only trên Mobile

**Chrome Android:**

- Settings → Privacy and security → Tắt "HTTPS-Only mode"

**Hoặc:** Khi thấy cảnh báo, click "Advanced" → "Proceed to [IP] (unsafe)"

## 🏗️ Cấu trúc dự án

```
MediScanAI/
├── Backend/              # Flask API server
│   ├── app.py           # Main API server
│   ├── requirements.txt
│   ├── .env             # Gemini API key (tạo file này)
│   └── get_local_ip.py  # Script lấy IP local
├── Web/                 # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ScanOverlay.jsx      # Camera scan component
│   │   │   ├── OCRTextEditor.jsx    # Chỉnh sửa text OCR
│   │   │   └── modals/
│   │   │       └── ScanResultModal.jsx
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── Crawldata/           # Drug database
│   ├── drug_database_refined.csv
│   └── duoc-thu-quoc-gia-viet-nam-2018.pdf
└── api/                 # Vercel serverless functions
    ├── scan.py
    └── utils.py
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

Hoặc gửi text trực tiếp:

```
POST http://localhost:5000/api/scan
Content-Type: application/json

{
  "text": "Tên thuốc"
}
```

### Tìm kiếm thuốc

```
GET http://localhost:5000/api/drugs/search?q=panadol
```

## 🎯 Tính năng

- ✅ **OCR**: Nhận diện text từ ảnh bằng EasyOCR (hỗ trợ tiếng Việt và tiếng Anh)
- ✅ **Drug Lookup**: Tra cứu thông tin thuốc từ database CSV
- ✅ **PDF Extraction**: Trích xuất thông tin từ Dược thư Quốc gia 2018
- ✅ **AI Summarization**: Sử dụng Gemini AI để tổng hợp thông tin dễ hiểu:
  - **Cách dùng**: Liều lượng, thời điểm uống, cách uống
  - **Lưu ý**: Chống chỉ định, tương tác thuốc, tác dụng phụ
- ✅ **Prescription Check**: Tự động phát hiện và chặn thuốc kê đơn
- ✅ **Text-to-Speech**: Tự động đọc thông tin thuốc
- ✅ **Mobile Support**: Truy cập từ mobile trên cùng WiFi
- ✅ **OCR Editing**: Cho phép chỉnh sửa text đã nhận diện

## 🔧 Troubleshooting

### Lỗi không truy cập được camera

- Kiểm tra quyền truy cập camera trong trình duyệt
- Đảm bảo đang sử dụng HTTPS hoặc localhost

### Lỗi kết nối API

- Kiểm tra backend đã chạy tại port 5000
- Kiểm tra CORS settings
- Kiểm tra firewall/antivirus

### Lỗi không tìm thấy database

- Đảm bảo file `Crawldata/drug_database_refined.csv` tồn tại
- Đảm bảo file `Crawldata/duoc-thu-quoc-gia-viet-nam-2018.pdf` tồn tại

### Lỗi ModuleNotFoundError

- Đảm bảo đã kích hoạt virtual environment
- Chạy lại: `pip install -r requirements.txt`

### Lỗi Port 5000 already in use

- Đóng ứng dụng khác đang dùng port 5000
- Hoặc đổi port trong `app.py`

### Mobile không truy cập được

1. Kiểm tra Firewall: Mở port 3000 và 5000
2. Kiểm tra cùng WiFi: Mobile và PC phải cùng mạng
3. Kiểm tra IP: Chạy `ipconfig` để xác nhận IP đúng
4. Fix HTTPS-Only: Tắt HTTPS-Only mode hoặc cho phép exception

### Lỗi Gemini API

- Kiểm tra `GEMINI_API_KEY` trong file `.env`
- Kiểm tra API key còn hiệu lực
- Nếu không có API key, hệ thống vẫn hoạt động nhưng không đơn giản hóa text

## 🔐 Bảo mật

- Backend chỉ chấp nhận ảnh dưới 16MB
- Chỉ chấp nhận các định dạng: PNG, JPG, JPEG, GIF, WEBP
- Upload folder được tạo tự động và có thể xóa sau khi xử lý
- File `.env` đã được thêm vào `.gitignore`

## 🚀 Deploy lên Vercel

### Deploy Frontend

1. **Cài đặt Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Deploy:**

   ```bash
   cd Web
   vercel
   ```

3. **Hoặc deploy qua Dashboard:**
   - Truy cập [vercel.com](https://vercel.com)
   - Import project từ Git
   - Vercel sẽ tự động detect Vite
   - Build Command: `cd Web && npm install && npm run build`
   - Output Directory: `Web/dist`

### Deploy Backend (Serverless)

Backend đã được cấu hình sẵn trong thư mục `api/` để deploy lên Vercel serverless functions.

**Lưu ý:**

- Vercel serverless có giới hạn thời gian chạy (10s free tier)
- OCR có thể mất nhiều thời gian, nên cân nhắc dùng backend riêng cho production

## 📄 License

MIT
