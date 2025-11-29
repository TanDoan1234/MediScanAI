# 🔍 Kiểm tra kết nối Backend - Frontend

## Tóm tắt cấu hình hiện tại

### Frontend API Configuration
- **Development**: `http://localhost:5000/api` ✅
- **Production (Vercel)**: `/api` (relative path)
- **Production (Firebase)**: Vercel API URL hoặc external API

### Backend Endpoints
- **Health**: `GET /api/health`
- **Scan**: `POST /api/scan`
- **Search**: `GET /api/drugs/search?q=...`

## 🧪 Cách test

### Bước 1: Kiểm tra Backend có đang chạy

```bash
# Chạy script test
./test_api.sh

# Hoặc test thủ công
curl http://localhost:5000/api/health
```

**Kết quả mong đợi:**
```json
{
  "status": "ok",
  "message": "Backend API is running",
  "drugs_loaded": 8610
}
```

### Bước 2: Nếu Backend chưa chạy

```bash
cd Backend
python app.py
```

Backend sẽ chạy tại: `http://localhost:5000`

### Bước 3: Test Frontend

1. **Chạy frontend:**
   ```bash
   cd Web
   npm run dev
   ```

2. **Mở browser:**
   - URL: `http://localhost:3000`
   - Mở DevTools (F12)
   - Tab: Console và Network

3. **Test scan:**
   - Click nút SCAN
   - Cho phép camera
   - Chụp ảnh
   - Xem Network tab: Request đến `/api/scan`

## ✅ Checklist

### Backend
- [ ] Backend đang chạy: `python Backend/app.py`
- [ ] Health endpoint hoạt động: `curl http://localhost:5000/api/health`
- [ ] Search endpoint hoạt động: `curl "http://localhost:5000/api/drugs/search?q=panadol"`
- [ ] Database đã load: `drugs_loaded: 8610`

### Frontend
- [ ] Frontend đang chạy: `npm run dev` trong `Web/`
- [ ] API URL đúng: `http://localhost:5000/api` (development)
- [ ] Không có lỗi CORS trong console
- [ ] Network requests thành công (status 200)

### Kết nối
- [ ] Frontend có thể gọi `/api/health`
- [ ] Frontend có thể gọi `/api/scan` (POST)
- [ ] Frontend có thể gọi `/api/drugs/search` (GET)

## 🐛 Xử lý lỗi

### Lỗi: "Failed to fetch" hoặc "Network error"

**Nguyên nhân**: Backend không chạy

**Giải pháp**:
```bash
cd Backend
python app.py
```

### Lỗi: "CORS policy"

**Nguyên nhân**: CORS chưa được cấu hình đúng

**Kiểm tra**: `Backend/app.py` có:
```python
CORS(app)  # Phải có dòng này
```

### Lỗi: "Connection refused"

**Nguyên nhân**: Port 5000 bị chiếm hoặc backend không chạy

**Giải pháp**:
```bash
# Kiểm tra port
lsof -i :5000

# Nếu có process khác, kill nó hoặc đổi port trong Backend/app.py
```

### Lỗi: "404 Not Found"

**Nguyên nhân**: Endpoint không đúng

**Kiểm tra**:
- Frontend gọi: `getApiEndpoint('scan')` → `http://localhost:5000/api/scan`
- Backend có route: `@app.route('/api/scan', methods=['POST'])`

## 📊 Test Results

Sau khi chạy `./test_api.sh`, bạn sẽ thấy:

**✅ Success:**
```
✅ Health check passed!
Response: {"status": "ok", ...}
✅ Backend is running and accessible!
```

**❌ Failure:**
```
❌ Health check failed (HTTP 000)
⚠️  Backend might not be running
```

## 🔧 Debug Commands

```bash
# Test health
curl http://localhost:5000/api/health

# Test search
curl "http://localhost:5000/api/drugs/search?q=panadol"

# Test scan (POST)
curl -X POST http://localhost:5000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,..."}'

# Check port
lsof -i :5000

# Check backend process
ps aux | grep "python.*app.py"
```

## 📝 Kết luận

**Nếu tất cả test pass:**
- ✅ Backend hoạt động tốt
- ✅ Frontend có thể kết nối
- ✅ API endpoints đều OK

**Nếu có lỗi:**
- Xem phần "Xử lý lỗi" ở trên
- Kiểm tra logs trong terminal (backend)
- Kiểm tra browser console (frontend)

