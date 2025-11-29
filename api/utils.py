import os
import base64
import cv2
import numpy as np
from PIL import Image
import io
import pandas as pd

# Load drug database (cached)
_drug_db = None
_drug_db_path = None

def get_drug_database():
    """Load và cache drug database"""
    global _drug_db, _drug_db_path
    
    # Get path relative to project root
    if _drug_db_path is None:
        # Try different possible paths
        possible_paths = [
            os.path.join(os.path.dirname(__file__), '..', 'Crawldata', 'drug_index.csv'),
            os.path.join(os.getcwd(), 'Crawldata', 'drug_index.csv'),
            '/var/task/Crawldata/drug_index.csv',  # Vercel lambda path
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
        
        return thresh
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return image_array

def extract_text_from_image(image_array):
    """Trích xuất text từ ảnh (placeholder - có thể tích hợp OCR thật như Tesseract)"""
    # TODO: Tích hợp Tesseract OCR hoặc Google Vision API
    # Hiện tại return placeholder
    return "Panadol Extra"  # Placeholder

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

