import os
import base64
import cv2
import numpy as np
from PIL import Image
import io
import pandas as pd
import re

# Fix cho Pillow 10.0+ không còn Image.ANTIALIAS
# EasyOCR và một số thư viện vẫn cần ANTIALIAS
if not hasattr(Image, 'ANTIALIAS'):
    Image.ANTIALIAS = Image.LANCZOS

# Load drug database và PDF (cached)
_drug_db = None
_drug_db_path = None
_pdf_reader = None
_pdf_path = None
_ocr_reader = None  # EasyOCR reader (cache để không load lại mỗi lần)

def get_drug_database():
    """Load và cache drug database"""
    global _drug_db, _drug_db_path
    
    # Get path relative to project root
    if _drug_db_path is None:
        # Try different possible paths - sử dụng drug_database_refined.csv
        possible_paths = [
            os.path.join(os.path.dirname(__file__), '..', 'Crawldata', 'drug_database_refined.csv'),
            os.path.join(os.getcwd(), 'Crawldata', 'drug_database_refined.csv'),
            '/var/task/Crawldata/drug_database_refined.csv',  # Vercel lambda path
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                _drug_db_path = path
                break
    
    if _drug_db is None and _drug_db_path and os.path.exists(_drug_db_path):
        try:
            _drug_db = pd.read_csv(_drug_db_path)
            print(f"✅ Loaded {len(_drug_db)} drugs from database")
        except Exception as e:
            print(f"⚠️ Error loading database: {e}")
            _drug_db = pd.DataFrame()
    elif _drug_db is None:
        _drug_db = pd.DataFrame()
    
    return _drug_db

def get_pdf_reader():
    """Load và cache PDF reader"""
    global _pdf_reader, _pdf_path
    
    if _pdf_path is None:
        # Try different possible paths
        possible_paths = [
            os.path.join(os.path.dirname(__file__), '..', 'Crawldata', 'duoc-thu-quoc-gia-viet-nam-2018.pdf'),
            os.path.join(os.getcwd(), 'Crawldata', 'duoc-thu-quoc-gia-viet-nam-2018.pdf'),
            '/var/task/Crawldata/duoc-thu-quoc-gia-viet-nam-2018.pdf',  # Vercel lambda path
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                _pdf_path = path
                break
    
    if _pdf_reader is None and _pdf_path and os.path.exists(_pdf_path):
        try:
            from pypdf import PdfReader
            _pdf_reader = PdfReader(_pdf_path)
            print(f"✅ Loaded PDF with {len(_pdf_reader.pages)} pages")
        except Exception as e:
            print(f"⚠️ Error loading PDF: {e}")
            _pdf_reader = None
    elif _pdf_reader is None:
        _pdf_reader = None
    
    return _pdf_reader

def decode_base64_image(base64_string):
    """Decode base64 string thành image"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        return np.array(image)
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

def preprocess_image(image_array):
    """Tiền xử lý ảnh để cải thiện OCR"""
    try:
        # Convert to grayscale
        if len(image_array.shape) == 3:
            gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = image_array
        
        # Apply denoising
        denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        
        # Apply threshold
        _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Resize nếu ảnh quá nhỏ (tối thiểu 300px width để OCR tốt hơn)
        height, width = thresh.shape
        if width < 300:
            scale = 300 / width
            new_width = int(width * scale)
            new_height = int(height * scale)
            thresh = cv2.resize(thresh, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
        
        return thresh
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return image_array

def get_ocr_reader():
    """Lấy hoặc khởi tạo EasyOCR reader (cache để không load lại mỗi lần)"""
    global _ocr_reader
    if _ocr_reader is None:
        try:
            import easyocr
            print("🔄 Đang khởi tạo EasyOCR (lần đầu có thể mất vài phút để tải model)...")
            # Hỗ trợ tiếng Việt và tiếng Anh
            _ocr_reader = easyocr.Reader(['vi', 'en'], gpu=False)
            print("✅ EasyOCR đã sẵn sàng!")
        except ImportError:
            print("⚠️ EasyOCR chưa được cài đặt. Chạy: pip install easyocr")
            return None
        except Exception as e:
            print(f"⚠️ Lỗi khởi tạo EasyOCR: {e}")
            return None
    return _ocr_reader

def extract_text_from_image(image_array):
    """Trích xuất text từ ảnh sử dụng EasyOCR"""
    try:
        reader = get_ocr_reader()
        if reader is None:
            # Fallback nếu OCR không khả dụng
            return None
        
        # EasyOCR cần ảnh ở dạng numpy array (BGR hoặc RGB)
        # Chuyển đổi từ grayscale sang RGB nếu cần
        if len(image_array.shape) == 2:
            # Grayscale -> RGB
            image_rgb = cv2.cvtColor(image_array, cv2.COLOR_GRAY2RGB)
        else:
            image_rgb = image_array
        
        # Chuyển từ RGB sang BGR (OpenCV format)
        image_bgr = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
        
        # OCR với EasyOCR
        results = reader.readtext(image_bgr)
        
        if not results:
            return None
        
        # Lấy tất cả text đã nhận diện, ưu tiên text có confidence cao
        texts = []
        for (bbox, text, confidence) in results:
            if confidence > 0.3:  # Chỉ lấy text có độ tin cậy > 30%
                texts.append(text)
        
        if not texts:
            return None
        
        # Kết hợp tất cả text thành một chuỗi
        # Ưu tiên text dài nhất (thường là tên thuốc)
        combined_text = ' '.join(texts)
        
        # Tìm text dài nhất (có thể là tên thuốc)
        longest_text = max(texts, key=len) if texts else combined_text
        
        # Trả về text dài nhất hoặc kết hợp tất cả
        return longest_text if len(longest_text) > 10 else combined_text
        
    except Exception as e:
        print(f"⚠️ Lỗi OCR: {e}")
        return None

def search_drug_in_database(drug_name):
    """Tìm kiếm thuốc trong database"""
    drug_db = get_drug_database()
    
    if drug_db is None or drug_db.empty:
        return None
    
    # Tìm kiếm không phân biệt hoa thường
    drug_name_lower = drug_name.lower().strip()
    
    # Tìm exact match
    exact_match = drug_db[drug_db['DrugName'].str.lower() == drug_name_lower]
    if not exact_match.empty:
        return exact_match.iloc[0].to_dict()
    
    # Tìm partial match
    partial_match = drug_db[drug_db['DrugName'].str.lower().str.contains(drug_name_lower, na=False)]
    if not partial_match.empty:
        return partial_match.iloc[0].to_dict()
    
    # Tìm theo từ khóa
    keywords = drug_name_lower.split()
    for keyword in keywords:
        if len(keyword) > 3:  # Chỉ tìm từ có > 3 ký tự
            keyword_match = drug_db[drug_db['DrugName'].str.lower().str.contains(keyword, na=False)]
            if not keyword_match.empty:
                return keyword_match.iloc[0].to_dict()
    
    return None

def extract_drug_details_from_pdf(page_number, offset=-1):
    """
    Trích xuất thông tin chi tiết từ PDF dựa trên số trang
    Tìm thành phần, công dụng, chỉ định, chống chỉ định...
    """
    pdf_reader = get_pdf_reader()
    
    if pdf_reader is None:
        return {}
    
    try:
        # Chuyển đổi số trang sách thành index PDF (pypdf đánh số từ 0)
        pdf_page_index = int(page_number) + offset - 1
        
        # Đảm bảo index hợp lệ
        if pdf_page_index < 0 or pdf_page_index >= len(pdf_reader.pages):
            # Thử không có offset
            pdf_page_index = int(page_number) - 1
            if pdf_page_index < 0 or pdf_page_index >= len(pdf_reader.pages):
                return {}
        
        # Đọc trang PDF
        page = pdf_reader.pages[pdf_page_index]
        text = page.extract_text()
        
        if not text:
            return {}
        
        details = {
            'composition': '',
            'indications': '',
            'contraindications': '',
            'dosage': '',
            'full_text': text[:2000]  # Giới hạn để tránh quá dài
        }
        
        # Regex patterns để tìm các thông tin
        patterns = {
            'composition': re.compile(r'(Thành phần|Thành phần chính|Hoạt chất)[:\.]\s*(.+?)(?:\n|$)', re.IGNORECASE),
            'indications': re.compile(r'(Chỉ định|Công dụng|Tác dụng)[:\.]\s*(.+?)(?:\n|Chống chỉ định|Liều dùng|$)', re.IGNORECASE | re.DOTALL),
            'contraindications': re.compile(r'(Chống chỉ định|Không dùng)[:\.]\s*(.+?)(?:\n|Liều dùng|Cách dùng|$)', re.IGNORECASE | re.DOTALL),
            'dosage': re.compile(r'(Liều dùng|Cách dùng|Liều lượng)[:\.]\s*(.+?)(?:\n|Tác dụng phụ|$)', re.IGNORECASE | re.DOTALL)
        }
        
        # Tìm từng loại thông tin
        for key, pattern in patterns.items():
            match = pattern.search(text)
            if match:
                details[key] = match.group(2).strip()[:500]  # Giới hạn độ dài
        
        return details
        
    except Exception as e:
        print(f"⚠️ Lỗi đọc PDF trang {page_number}: {e}")
        return {}

