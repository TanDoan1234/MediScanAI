# 🔍 KIỂM TRA FLOW - MediScan AI Backend

## 📊 So sánh 2 Files Database

### 1. **drug_index.csv** (File cũ - 3 cột)
```csv
DrugName,ActiveIngredient,PageNumber
Kukjekemocin,Cefaclor,329
```

**Columns:**
- ✅ DrugName (Tên thuốc)
- ✅ ActiveIngredient (Hoạt chất)
- ✅ PageNumber (Số trang PDF)
- ❌ Category (THIẾU)
- ❌ Is_Prescription (THIẾU)

**Số lượng:** 8,610 records

---

### 2. **drug_database_refined.csv** (File mới - 5 cột) ✅ RECOMMENDED
```csv
DrugName,ActiveIngredient,PageNumber,Category,Is_Prescription
Kukjekemocin,Cefaclor,329,"Kháng sinh uống, nhóm cephalosporin thế hệ 2",True
```

**Columns:**
- ✅ DrugName (Tên thuốc)
- ✅ ActiveIngredient (Hoạt chất)
- ✅ PageNumber (Số trang PDF)
- ✅ **Category** (Danh mục thuốc) - QUAN TRỌNG
- ✅ **Is_Prescription** (Có cần đơn không) - QUAN TRỌNG

**Số lượng:** 8,610 records

---

## 🔄 FLOW HỆ THỐNG

```
┌─────────────────────────────────────────────────────────────┐
│  1. NGƯỜI DÙNG CHỤP ẢNH THUỐC                                │
│     (Frontend - Camera/Upload)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. GỬI ẢNH LÊN BACKEND                                      │
│     POST /api/scan (multipart/form-data)                    │
│     - image: File                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  3. OCR - NHẬN DIỆN TEXT TỪ ẢNH                              │
│     (ocr_service.py)                                        │
│     - Tiền xử lý ảnh (grayscale, threshold, denoise)       │
│     - EasyOCR extract text                                  │
│     - Output: "Paracetamol" hoặc "Vitamin C 500mg"          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  4. TRA CỨU DATABASE                                         │
│     (drug_lookup_service.py)                                │
│     - Load: drug_database_refined.csv                       │
│     - Fuzzy matching với text từ OCR                        │
│     - Tìm trong DrugName + ActiveIngredient                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  5. LẤY THÔNG TIN TỪ CSV                                     │
│     - DrugName: "Paracetamol"                               │
│     - ActiveIngredient: "Paracetamol"                       │
│     - PageNumber: 1118                                      │
│     - Category: "Giảm đau; hạ sốt"        ← MỚI             │
│     - Is_Prescription: False              ← MỚI             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  6. TRÍCH XUẤT THÔNG TIN CHI TIẾT TỪ PDF                     │
│     (pdf_extractor_service.py)                              │
│     - Mở PDF: duoc-thu-quoc-gia-viet-nam-2018.pdf           │
│     - Đọc trang: PageNumber (1118)                          │
│     - Parse thông tin:                                      │
│       • Chỉ định                                            │
│       • Liều dùng                                           │
│       • Tác dụng phụ                                        │
│       • Chống chỉ định                                      │
│       • Cách bảo quản                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  7. TRẢ KẾT QUẢ VỀ FRONTEND                                  │
│     JSON Response:                                          │
│     {                                                       │
│       "success": true,                                      │
│       "data": {                                             │
│         "extracted_text": "Paracetamol",                    │
│         "drug_info": {                                      │
│           "name": "Paracetamol",                            │
│           "active_ingredient": "Paracetamol",               │
│           "category": "Giảm đau; hạ sốt",     ← HIỂN THỊ    │
│           "is_prescription": false,           ← HIỂN THỊ    │
│           "page_number": 1118                               │
│         },                                                  │
│         "detailed_info": {                                  │
│           "indication": "...",                              │
│           "dosage": "...",                                  │
│           "side_effects": "..."                             │
│         }                                                   │
│       }                                                     │
│     }                                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ KẾT LUẬN & KHUYẾN NGHỊ

### ❌ Vấn đề hiện tại:
1. Backend `app.py` đang load file **cũ**: `drug_index.csv` (thiếu 2 cột)
2. Người dùng không thấy được:
   - **Category** (danh mục thuốc: kháng sinh, giảm đau, vitamin...)
   - **Is_Prescription** (cần đơn hay không)

### ✅ Đã sửa:
```python
# BEFORE (SAI):
DRUG_DB_PATH = os.path.join(BASE_DIR, '..', 'Crawldata', 'drug_index.csv')

# AFTER (ĐÚNG):
DRUG_DB_PATH = os.path.join(BASE_DIR, '..', 'Crawldata', 'drug_database_refined.csv')
```

### 🎯 Lợi ích khi dùng drug_database_refined.csv:

1. **Category** cho phép:
   - Phân loại thuốc rõ ràng
   - Filter theo nhóm (kháng sinh, giảm đau, vitamin...)
   - Hiển thị icon phù hợp trên UI

2. **Is_Prescription** cho phép:
   - Cảnh báo thuốc kê đơn (màu đỏ/cam)
   - Gợi ý đi khám bác sĩ
   - Compliance với quy định y tế

---

## 🧪 CÁCH TEST FLOW

### Test 1: Kiểm tra Backend đã load đúng file
```bash
cd Backend
python -c "
import pandas as pd
df = pd.read_csv('../Crawldata/drug_database_refined.csv')
print(f'Columns: {list(df.columns)}')
print(f'Total drugs: {len(df)}')
print(df.head(3))
"
```

**Expected output:**
```
Columns: ['DrugName', 'ActiveIngredient', 'PageNumber', 'Category', 'Is_Prescription']
Total drugs: 8610
```

### Test 2: Test API Search
```bash
# Start backend
python app.py

# In another terminal:
curl "http://localhost:5000/api/search?q=paracetamol"
```

**Expected response:**
```json
{
  "success": true,
  "data": [
    {
      "DrugName": "Paracetamol",
      "ActiveIngredient": "Paracetamol",
      "PageNumber": 1118,
      "Category": "Giảm đau; hạ sốt",
      "Is_Prescription": false
    }
  ]
}
```

### Test 3: Test OCR + Full Flow
```bash
curl -X POST -F "image=@test_drug_image.jpg" http://localhost:5000/api/scan
```

---

## 📋 CHECKLIST

- [x] So sánh 2 files database
- [x] Xác định drug_database_refined.csv là file đúng
- [x] Cập nhật Backend app.py để load file đúng
- [x] Cập nhật .env config
- [ ] Test backend với file mới
- [ ] Test full flow OCR → Database → PDF
- [ ] Cập nhật Frontend để hiển thị Category và Is_Prescription

---

## 🚀 NEXT STEPS

1. **Khởi động Backend:**
   ```bash
   cd Backend
   python app.py
   ```

2. **Test với curl hoặc test_api.py**

3. **Cập nhật Frontend** để hiển thị:
   - Badge "Thuốc kê đơn" nếu `Is_Prescription = true`
   - Icon/tag theo Category
   - Warning message cho thuốc kê đơn

4. **Tối ưu OCR** để nhận diện chính xác hơn
