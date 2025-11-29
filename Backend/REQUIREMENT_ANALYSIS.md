# 📋 PHÂN TÍCH YÊU CẦU VÀ KIỂM TRA FLOW

## 🎯 YÊU CẦU CỦA BẠN

### Flow mong muốn:
```
1. Scan sản phẩm thuốc (camera)
   ↓
2. Nhận diện text (OCR)
   ↓
3. Check trong drug_database_refined.csv (cột DrugName)
   ↓
4. Dựa vào PageNumber & Category
   ↓
5. Tra thông tin trong PDF
   ↓
6. 🆕 Call Gemini API để tóm tắt thông tin
   ↓
7. 🆕 Text-to-Speech đọc cho người dùng (giới hạn 100 từ)
```

---

## ✅ HIỆN TẠI ĐÃ CÓ

### 1. ✅ Scan & OCR (Hoàn thành)
**File:** `Backend/services/ocr_service.py`
- ✅ Camera capture (Frontend)
- ✅ EasyOCR nhận diện text tiếng Việt/Anh
- ✅ Tiền xử lý ảnh (grayscale, threshold, denoise)

### 2. ✅ Database Lookup (Hoàn thành)
**File:** `Backend/services/drug_lookup_service.py`
- ✅ Load `drug_database_refined.csv`
- ✅ Fuzzy matching tìm DrugName
- ✅ Trả về: DrugName, ActiveIngredient, PageNumber, Category, Is_Prescription

### 3. ✅ PDF Extraction (Hoàn thành)
**File:** `Backend/services/pdf_extractor_service.py`
- ✅ Mở PDF: `duoc-thu-quoc-gia-viet-nam-2018.pdf`
- ✅ Trích xuất text theo PageNumber
- ✅ Parse thông tin có cấu trúc (chỉ định, liều dùng, tác dụng phụ...)

### 4. ✅ API Endpoint (Hoàn thành)
**File:** `Backend/app.py`
- ✅ `POST /api/scan` - Nhận ảnh, OCR, lookup, extract PDF

---

## ❌ THIẾU CÁC TÍNH NĂNG

### 1. ❌ Gemini API Integration (CHƯA CÓ)
**Mục đích:** Tóm tắt thông tin thuốc từ PDF thành văn bản ngắn gọn

**Cần tạo:**
- ✅ Service: `Backend/services/gemini_summarizer_service.py`
- ✅ Input: Raw text từ PDF
- ✅ Output: Summary (100 từ)
- ✅ API Key: GEMINI_API_KEY trong .env

### 2. ❌ Text-to-Speech (CHƯA CÓ)
**Mục đích:** Đọc tóm tắt thông tin cho người dùng

**Cần tạo:**
- ✅ Service: `Backend/services/tts_service.py`
- ✅ Sử dụng: Google Text-to-Speech (gTTS) hoặc Google Cloud TTS
- ✅ Input: Summary text (100 từ)
- ✅ Output: Audio file (MP3/WAV)

### 3. ❌ API Endpoint Mới (CHƯA CÓ)
**Cần tạo:**
- ✅ `POST /api/scan-with-audio` - Full flow có Gemini + TTS
- ✅ Trả về: Drug info + Summary + Audio URL

---

## 📊 SO SÁNH FLOW

### Flow Hiện Tại ✅
```
Camera → OCR → Database → PDF → Response JSON
```

### Flow Yêu Cầu 🎯
```
Camera → OCR → Database → PDF → 🆕 Gemini Summary → 🆕 TTS Audio → Response
```

---

## 🔧 NHIỆM VỤ CẦN BỔ SUNG

### Task 1: Tích hợp Gemini API ⭐⭐⭐
**Priority:** HIGH
**Files cần tạo:**
- `Backend/services/gemini_summarizer_service.py`
- `Backend/.env` (thêm GEMINI_API_KEY)
- `Backend/requirements.txt` (thêm google-generativeai)

**Chức năng:**
```python
def summarize_drug_info(drug_name, pdf_text, category):
    """
    Tóm tắt thông tin thuốc bằng Gemini API
    
    Args:
        drug_name: Tên thuốc
        pdf_text: Text từ PDF
        category: Danh mục thuốc
    
    Returns:
        str: Summary (100 từ)
    """
```

**Prompt mẫu cho Gemini:**
```
Bạn là dược sĩ chuyên nghiệp. Hãy tóm tắt thông tin thuốc sau 
đây trong 100 từ, tập trung vào: chỉ định, liều dùng, tác dụng 
phụ, lưu ý quan trọng.

Tên thuốc: {drug_name}
Danh mục: {category}
Thông tin chi tiết: {pdf_text}

Tóm tắt (100 từ):
```

---

### Task 2: Tích hợp Text-to-Speech ⭐⭐⭐
**Priority:** HIGH
**Files cần tạo:**
- `Backend/services/tts_service.py`
- `Backend/static/audio/` (thư mục lưu audio files)

**Options:**
1. **gTTS (Google Text-to-Speech)** - Free, đơn giản
   ```python
   from gtts import gTTS
   tts = gTTS(text=summary, lang='vi')
   tts.save('output.mp3')
   ```

2. **Google Cloud TTS** - Chất lượng cao hơn, có phí
   ```python
   from google.cloud import texttospeech
   ```

**Chức năng:**
```python
def text_to_speech(text, output_path):
    """
    Convert text thành audio file
    
    Args:
        text: Summary text (100 từ)
        output_path: Đường dẫn lưu file audio
    
    Returns:
        str: URL/path to audio file
    """
```

---

### Task 3: Tạo API Endpoint Mới ⭐⭐
**Priority:** MEDIUM
**File:** `Backend/app.py`

**Endpoint mới:**
```python
@app.route('/api/scan-complete', methods=['POST'])
def scan_with_audio():
    """
    Complete flow:
    1. OCR
    2. Database lookup
    3. PDF extraction
    4. Gemini summarization
    5. Text-to-Speech
    6. Return all data + audio URL
    """
```

**Response format:**
```json
{
  "success": true,
  "data": {
    "extracted_text": "Paracetamol 500mg",
    "drug_info": {
      "name": "Paracetamol",
      "active_ingredient": "Paracetamol",
      "category": "Giảm đau; hạ sốt",
      "is_prescription": false,
      "page_number": 1118
    },
    "summary": {
      "text": "Paracetamol là thuốc giảm đau, hạ sốt...",
      "word_count": 98
    },
    "audio": {
      "url": "/static/audio/paracetamol_1234567.mp3",
      "duration": 45,
      "format": "mp3"
    },
    "detailed_info": { ... }
  }
}
```

---

### Task 4: Cập nhật Frontend ⭐
**Priority:** MEDIUM
**Files:** `Web/src/components/modals/ScanResultModal.jsx`

**Thêm:**
- Audio player để phát summary
- Nút "Đọc lại"
- Hiển thị summary text
- Loading state khi đang tạo audio

---

### Task 5: Cấu hình & Dependencies ⭐
**Priority:** HIGH

**Backend/requirements.txt thêm:**
```
google-generativeai==0.3.1
gTTS==2.4.0
pydub==0.25.1
```

**Backend/.env thêm:**
```
GEMINI_API_KEY=your_gemini_api_key_here
TTS_SERVICE=gtts
AUDIO_FOLDER=./static/audio
MAX_SUMMARY_WORDS=100
```

---

## 📈 TIMELINE ƯỚC TÍNH

| Task | Thời gian | Độ khó |
|------|-----------|--------|
| Gemini Integration | 2-3 giờ | ⭐⭐⭐ |
| TTS Integration | 1-2 giờ | ⭐⭐ |
| New API Endpoint | 1 giờ | ⭐⭐ |
| Frontend Update | 1-2 giờ | ⭐⭐ |
| Testing & Debug | 2-3 giờ | ⭐⭐⭐ |
| **TOTAL** | **7-11 giờ** | |

---

## 🧪 TESTING CHECKLIST

- [ ] Test OCR với ảnh thuốc thật
- [ ] Test database lookup với tên thuốc khác nhau
- [ ] Test Gemini API với các loại thuốc khác nhau
- [ ] Test TTS với text tiếng Việt có dấu
- [ ] Test audio playback trên các browsers
- [ ] Test performance (thời gian xử lý end-to-end)
- [ ] Test error handling (không tìm thấy thuốc, API fail, etc.)

---

## 🚀 NEXT STEPS

1. **Ngay lập tức:**
   - Đăng ký Gemini API key tại: https://ai.google.dev/
   - Cài đặt dependencies mới

2. **Triển khai:**
   - Tạo Gemini summarizer service
   - Tạo TTS service
   - Tạo API endpoint mới
   - Cập nhật frontend

3. **Test & Deploy:**
   - Test từng service riêng lẻ
   - Test full flow
   - Deploy lên server

---

## 💡 GỢI Ý TỐI ƯU

1. **Cache:** Cache Gemini summaries để tránh gọi API nhiều lần cho cùng 1 thuốc
2. **Async:** Xử lý Gemini + TTS async để không block response
3. **Fallback:** Nếu Gemini fail, dùng summary từ PDF extraction
4. **Audio Storage:** Cleanup audio files cũ định kỳ
5. **Rate Limiting:** Giới hạn số request Gemini API/user/day

---

## ❓ QUESTIONS CẦN XÁC NHẬN

1. ✅ Có muốn sử dụng Gemini API (có phí) hay dùng alternative free?
2. ✅ gTTS (free) hay Google Cloud TTS (có phí, chất lượng tốt hơn)?
3. ✅ Audio lưu trên server hay upload lên cloud (S3, GCS)?
4. ✅ Summary 100 từ có phù hợp không? (có thể điều chỉnh)
5. ✅ Giọng đọc TTS: Nam/Nữ? Tốc độ nhanh/chậm?

---

## 📝 KẾT LUẬN

**Flow hiện tại:** ✅✅✅❌❌ (60% hoàn thành)
- ✅ OCR
- ✅ Database Lookup
- ✅ PDF Extraction
- ❌ Gemini Summarization
- ❌ Text-to-Speech

**Cần bổ sung:** 2 services chính (Gemini + TTS) + 1 API endpoint mới

**Ưu tiên:** Gemini Integration > TTS Integration > Frontend Update
