# MediScan AI - Backend API

Backend service cho ứng dụng nhận diện thuốc qua camera và tra cứu thông tin dược.

## 🎯 Tính năng

- **OCR (Optical Character Recognition)**: Nhận diện chữ từ ảnh sử dụng EasyOCR (hỗ trợ tiếng Việt)
- **Drug Lookup**: Tra cứu thông tin thuốc từ database CSV với fuzzy matching
- **PDF Extraction**: Trích xuất thông tin chi tiết từ Dược thư Quốc gia PDF
- **REST API**: Các endpoint để tích hợp với frontend

## 🏗️ Kiến trúc

```
Backend/
├── app.py                 # Main Flask application
├── services/              # Business logic services
│   ├── ocr_service.py           # OCR text recognition
│   ├── drug_lookup_service.py   # Database lookup
│   └── pdf_extractor_service.py # PDF information extraction
├── uploads/               # Temporary image storage
├── requirements.txt       # Python dependencies
└── .env                   # Environment configuration
```

## 🚀 Cài đặt

### 1. Cài đặt Python dependencies

```bash
cd Backend
pip install -r requirements.txt
```

### 2. Cài đặt Tesseract OCR (optional, nếu dùng pytesseract)

**macOS:**
```bash
brew install tesseract tesseract-lang
```

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr tesseract-ocr-vie
```

### 3. Cấu hình môi trường

Tạo file `.env` từ template:
```bash
cp .env.example .env
```

Chỉnh sửa các biến môi trường trong `.env`:
```
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
CSV_PATH=../Crawldata/drug_database_refined.csv
PDF_PATH=../Crawldata/duoc-thu-quoc-gia-viet-nam-2018.pdf
```

### 4. Chạy server

```bash
python app.py
```

Server sẽ chạy tại: `http://localhost:5000`

## 📡 API Endpoints

### 1. Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "MediScan API is running"
}
```

### 2. Scan Drug (Main API)
```
POST /api/scan
Content-Type: multipart/form-data
```

**Parameters:**
- `image`: File ảnh (JPG, PNG)

**Response:**
```json
{
  "success": true,
  "data": {
    "extracted_text": "Paracetamol 500mg",
    "drug_info": {
      "name": "Paracetamol",
      "active_ingredient": "Paracetamol",
      "category": "Giảm đau, hạ sốt",
      "is_prescription": false,
      "page_number": 1118
    },
    "detailed_info": {
      "page_number": 1118,
      "parsed_info": {
        "indication": "...",
        "dosage": "...",
        "side_effects": "..."
      }
    },
    "alternative_matches": []
  },
  "message": "Tìm thấy thông tin thuốc thành công"
}
```

### 3. Search Drug by Name
```
GET /api/search?q=paracetamol
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "DrugName": "Paracetamol",
      "ActiveIngredient": "Paracetamol",
      "Category": "Giảm đau; hạ sốt",
      "Is_Prescription": false,
      "PageNumber": 1118,
      "similarity_score": 1.0
    }
  ],
  "count": 1
}
```

### 4. Get Drug Details
```
GET /api/drug/{drug_name}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "drug_info": { ... },
    "detailed_info": { ... }
  }
}
```

## 🔧 Services Chi tiết

### OCR Service (`ocr_service.py`)
- Sử dụng **EasyOCR** với hỗ trợ tiếng Việt và tiếng Anh
- Tiền xử lý ảnh: grayscale, adaptive thresholding, denoising
- Confidence threshold: 0.3 (có thể điều chỉnh)

**Methods:**
- `extract_text(image_path)`: Trích xuất text từ ảnh
- `extract_text_with_details(image_path)`: Trả về text kèm bbox và confidence
- `preprocess_image(image_path)`: Tiền xử lý ảnh

### Drug Lookup Service (`drug_lookup_service.py`)
- Load database từ CSV file
- Fuzzy matching với SequenceMatcher
- Tìm kiếm trong cả tên thuốc và hoạt chất

**Methods:**
- `search_drugs(query, threshold=0.6)`: Tìm kiếm với fuzzy matching
- `get_drug_by_name(drug_name)`: Tìm chính xác theo tên
- `get_suggestions(query, limit=5)`: Gợi ý thuốc
- `search_by_category(category)`: Tìm theo danh mục

### PDF Extractor Service (`pdf_extractor_service.py`)
- Sử dụng **pdfplumber** để trích xuất text từ PDF
- Parse thông tin có cấu trúc (chỉ định, liều dùng, tác dụng phụ, v.v.)

**Methods:**
- `extract_page_info(page_number)`: Trích xuất info từ trang cụ thể
- `parse_drug_info(text)`: Parse thông tin có cấu trúc
- `search_in_pdf(query)`: Tìm kiếm trong toàn PDF

## 🧪 Testing

### Test với curl

**Health check:**
```bash
curl http://localhost:5000/health
```

**Search drug:**
```bash
curl "http://localhost:5000/api/search?q=paracetamol"
```

**Scan image:**
```bash
curl -X POST -F "image=@path/to/image.jpg" http://localhost:5000/api/scan
```

### Test với Python

```python
import requests

# Search drug
response = requests.get('http://localhost:5000/api/search', params={'q': 'paracetamol'})
print(response.json())

# Scan image
with open('drug_image.jpg', 'rb') as f:
    files = {'image': f}
    response = requests.post('http://localhost:5000/api/scan', files=files)
    print(response.json())
```

## 📊 Database Schema (CSV)

```
DrugName,ActiveIngredient,PageNumber,Category,Is_Prescription
Paracetamol,Paracetamol,1118,"Giảm đau; hạ sốt",False
```

## 🔒 Security Notes

- Upload folder được tự động dọn dẹp sau khi xử lý
- Max upload size: 16MB (có thể cấu hình trong .env)
- CORS được enable cho development (cần cấu hình lại cho production)

## 📝 TODO / Improvements

- [ ] Add authentication/API keys
- [ ] Implement rate limiting
- [ ] Add caching for frequent queries
- [ ] Optimize OCR performance with GPU
- [ ] Add support for multiple languages
- [ ] Implement batch processing
- [ ] Add image quality validation
- [ ] Create admin panel for database management

## 🐛 Troubleshooting

**EasyOCR initialization error:**
- Kiểm tra internet connection (EasyOCR tải models lần đầu)
- Cài đặt dependencies: `pip install torch torchvision`

**PDF not found:**
- Kiểm tra đường dẫn PDF_PATH trong .env
- Đảm bảo file PDF tồn tại

**OCR không chính xác:**
- Cải thiện chất lượng ảnh (độ phân giải, ánh sáng)
- Điều chỉnh preprocessing parameters
- Thử với confidence threshold thấp hơn

## 📄 License

MIT License
