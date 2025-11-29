from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
import cv2
import numpy as np
from PIL import Image
import io
import pandas as pd
import re
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Cho phép frontend gọi API

# Cấu hình
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Load drug database
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DRUG_DB_PATH = os.path.join(BASE_DIR, '..', 'Crawldata', 'drug_database_refined.csv')
drug_db = None

def load_drug_database():
    """Load drug database từ CSV file"""
    global drug_db
    try:
        if os.path.exists(DRUG_DB_PATH):
            drug_db = pd.read_csv(DRUG_DB_PATH)
            print(f"✅ Đã load {len(drug_db)} thuốc từ database")
        else:
            print(f"⚠️ Không tìm thấy file database tại: {DRUG_DB_PATH}")
            drug_db = pd.DataFrame()
    except Exception as e:
        print(f"⚠️ Không thể load database: {e}")
        drug_db = pd.DataFrame()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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

def extract_text_from_image(image_array):
    """Trích xuất text từ ảnh (placeholder - có thể tích hợp OCR thật như Tesseract)"""
    # TODO: Tích hợp Tesseract OCR hoặc Google Vision API
    # Hiện tại return placeholder
    return "Panadol Extra"  # Placeholder

def search_drug_in_database(drug_name):
    """Tìm kiếm thuốc trong database"""
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

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Backend API is running',
        'drugs_loaded': len(drug_db) if drug_db is not None else 0
    })

@app.route('/api/scan', methods=['POST'])
def scan_drug():
    """API endpoint để scan thuốc từ ảnh"""
    try:
        # Kiểm tra xem có file hoặc base64 image không
        if 'image' in request.files:
            # Nhận file upload
            file = request.files['image']
            if file and allowed_file(file.filename):
                # Đọc ảnh từ file
                image_bytes = file.read()
                image = Image.open(io.BytesIO(image_bytes))
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                image_array = np.array(image)
        elif 'image' in request.json:
            # Nhận base64 image
            base64_image = request.json['image']
            image_array = decode_base64_image(base64_image)
            if image_array is None:
                return jsonify({'error': 'Invalid image data'}), 400
        else:
            return jsonify({'error': 'No image provided'}), 400
        
        # Tiền xử lý ảnh
        processed_image = preprocess_image(image_array)
        
        # Trích xuất text từ ảnh (OCR)
        extracted_text = extract_text_from_image(processed_image)
        
        # Tìm kiếm trong database
        drug_info = search_drug_in_database(extracted_text)
        
        if drug_info:
            # Trả về thông tin thuốc
            return jsonify({
                'success': True,
                'drug_name': drug_info.get('DrugName', ''),
                'active_ingredient': drug_info.get('ActiveIngredient', ''),
                'page_number': drug_info.get('PageNumber', ''),
                'extracted_text': extracted_text,
                'rx_status': 'OTC'  # Có thể thêm logic để xác định
            })
        else:
            # Không tìm thấy trong database
            return jsonify({
                'success': False,
                'message': 'Không tìm thấy thông tin thuốc trong database',
                'extracted_text': extracted_text
            }), 404
            
    except Exception as e:
        print(f"Error processing scan: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/drugs/search', methods=['GET'])
def search_drugs():
    """API endpoint để tìm kiếm thuốc theo tên"""
    query = request.args.get('q', '')
    if not query:
        return jsonify({'error': 'Query parameter required'}), 400
    
    if drug_db is None or drug_db.empty:
        return jsonify({'drugs': []})
    
    # Tìm kiếm
    query_lower = query.lower()
    results = drug_db[drug_db['DrugName'].str.lower().str.contains(query_lower, na=False)]
    
    # Giới hạn kết quả
    results = results.head(20)
    
    return jsonify({
        'drugs': results.to_dict('records')
    })

if __name__ == '__main__':
    load_drug_database()
    print("🚀 Starting MediScan AI Backend Server...")
    print("📡 API available at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)

