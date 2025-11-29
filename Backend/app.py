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
from pypdf import PdfReader

# Fix cho Pillow 10.0+ không còn Image.ANTIALIAS
# EasyOCR và một số thư viện vẫn cần ANTIALIAS
if not hasattr(Image, 'ANTIALIAS'):
    Image.ANTIALIAS = Image.LANCZOS

app = Flask(__name__)
CORS(app)  # Cho phép frontend gọi API

# Cấu hình
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Load drug database và PDF
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DRUG_DB_PATH = os.path.join(BASE_DIR, '..', 'Crawldata', 'drug_database_refined.csv')
PDF_PATH = os.path.join(BASE_DIR, '..', 'Crawldata', 'duoc-thu-quoc-gia-viet-nam-2018.pdf')
drug_db = None
pdf_reader = None
ocr_reader = None  # EasyOCR reader (cache để không load lại mỗi lần)

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

def load_pdf():
    """Load PDF dược thư quốc gia"""
    global pdf_reader
    try:
        if os.path.exists(PDF_PATH):
            pdf_reader = PdfReader(PDF_PATH)
            print(f"✅ Đã load PDF với {len(pdf_reader.pages)} trang")
        else:
            print(f"⚠️ Không tìm thấy file PDF tại: {PDF_PATH}")
            pdf_reader = None
    except Exception as e:
        print(f"⚠️ Không thể load PDF: {e}")
        pdf_reader = None

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
    
    # Resize nếu ảnh quá nhỏ (tối thiểu 300px width để OCR tốt hơn)
    height, width = thresh.shape
    if width < 300:
        scale = 300 / width
        new_width = int(width * scale)
        new_height = int(height * scale)
        thresh = cv2.resize(thresh, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
    
    return thresh

def get_ocr_reader():
    """Lấy hoặc khởi tạo EasyOCR reader (cache để không load lại mỗi lần)"""
    global ocr_reader
    if ocr_reader is None:
        try:
            import easyocr
            print("🔄 Đang khởi tạo EasyOCR (lần đầu có thể mất vài phút để tải model)...")
            # Hỗ trợ tiếng Việt và tiếng Anh
            ocr_reader = easyocr.Reader(['vi', 'en'], gpu=False)
            print("✅ EasyOCR đã sẵn sàng!")
        except ImportError:
            print("⚠️ EasyOCR chưa được cài đặt. Chạy: pip install easyocr")
            return None
        except Exception as e:
            print(f"⚠️ Lỗi khởi tạo EasyOCR: {e}")
            return None
    return ocr_reader

def extract_text_from_image(image_array):
    """Trích xuất text từ ảnh sử dụng EasyOCR, trả về tất cả text và text được chọn"""
    try:
        reader = get_ocr_reader()
        if reader is None:
            return None, []
        
        # EasyOCR cần ảnh ở dạng numpy array (BGR hoặc RGB)
        if len(image_array.shape) == 2:
            image_rgb = cv2.cvtColor(image_array, cv2.COLOR_GRAY2RGB)
        else:
            image_rgb = image_array
        
        # Chuyển từ RGB sang BGR (OpenCV format)
        image_bgr = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
        height, width = image_bgr.shape[:2]
        
        # OCR với EasyOCR
        results = reader.readtext(image_bgr)
        
        if not results:
            return None, []
        
        # Danh sách từ thông thường cần loại bỏ (không phải tên thuốc)
        common_words = {
            'arthritis', 'pain', 'relief', 'fever', 'reducer', 'temporary', 'minor',
            'tablets', 'caplets', 'mg', 'each', 'extended', 'release', 'acetaminophen',
            'ibuprofen', 'aspirin', 'do', 'not', 'use', 'with', 'other', 'medicines',
            'containing', 'to', 'open', 'push', 'turn', 'cap', 'warnings', 'directions',
            'store', 'at', 'room', 'temperature', 'keep', 'out', 'of', 'reach', 'children',
            'active', 'ingredient', 'inactive', 'ingredients', 'see', 'package', 'insert'
        }
        
        # Lấy tất cả text với thông tin chi tiết
        all_texts = []
        candidate_texts = []
        
        for (bbox, text, confidence) in results:
            if confidence > 0.3:  # Chỉ lấy text có độ tin cậy > 30%
                # Làm sạch text: loại bỏ ký tự đặc biệt ở đầu/cuối
                text_cleaned = text.strip()
                # Loại bỏ các ký tự đặc biệt thường gặp trong OCR
                text_cleaned = text_cleaned.strip('[](){}.,;:!?-_=+')
                text_clean = text_cleaned.upper()
                
                # Bỏ qua nếu text quá ngắn sau khi làm sạch
                if len(text_cleaned) < 2:
                    continue
                
                # Tính toán vị trí trung tâm của text
                x_coords = [point[0] for point in bbox]
                y_coords = [point[1] for point in bbox]
                center_x = sum(x_coords) / len(x_coords)
                center_y = sum(y_coords) / len(y_coords)
                
                # Tính khoảng cách từ trung tâm ảnh (ưu tiên text ở giữa)
                distance_from_center = ((center_x - width/2)**2 + (center_y - height/2)**2)**0.5
                normalized_distance = distance_from_center / ((width/2)**2 + (height/2)**2)**0.5
                
                # Tính kích thước text (ưu tiên text lớn)
                text_width = max(x_coords) - min(x_coords)
                text_height = max(y_coords) - min(y_coords)
                text_area = text_width * text_height
                normalized_area = text_area / (width * height)
                
                # Loại bỏ từ thông thường
                words = text_clean.split()
                is_common = all(word in common_words for word in words if len(word) > 2)
                
                all_texts.append({
                    'text': text_cleaned,  # Dùng text đã làm sạch
                    'confidence': confidence,
                    'center_x': center_x,
                    'center_y': center_y,
                    'distance_from_center': normalized_distance,
                    'area': normalized_area
                })
                
                # Chỉ thêm vào candidate nếu không phải từ thông thường
                if not is_common and len(text_clean) >= 3:
                    # Tính điểm ưu tiên: confidence cao, ở giữa, kích thước lớn, không phải số thuần túy
                    is_number_only = text_clean.replace(' ', '').replace('.', '').isdigit()
                    if not is_number_only:
                        score = (
                            confidence * 0.4 +  # 40% từ confidence
                            (1 - normalized_distance) * 0.3 +  # 30% từ vị trí (gần trung tâm hơn = tốt hơn)
                            normalized_area * 0.2 +  # 20% từ kích thước
                            min(len(text_clean) / 20, 1) * 0.1  # 10% từ độ dài (ưu tiên text vừa phải)
                        )
                        candidate_texts.append({
                            'text': text,
                            'score': score,
                            'confidence': confidence
                        })
        
        if not all_texts:
            return None, []
        
        # Sắp xếp candidate theo điểm số
        candidate_texts.sort(key=lambda x: x['score'], reverse=True)
        
        # Cải thiện: Kết hợp các text gần nhau thành tên thuốc đầy đủ
        # Tìm các text có thể là một phần của tên thuốc (có số %, chữ hoa, v.v.)
        combined_candidates = []
        
        # Ưu tiên text có chứa số phần trăm (%)
        percent_texts = [t for t in all_texts if '%' in t['text'] or '10' in t['text'] or '20' in t['text']]
        
        # Tìm text có vẻ là tên thuốc (chữ hoa, không phải từ thông thường)
        drug_name_candidates = []
        for t in all_texts:
            text_upper = t['text'].upper()
            # Loại bỏ text chỉ là số hoặc quá ngắn
            if len(text_upper) >= 3 and not text_upper.replace(' ', '').replace('.', '').replace('%', '').isdigit():
                # Kiểm tra xem có phải từ thông thường không
                words = text_upper.split()
                is_common = any(word in common_words for word in words if len(word) > 2)
                if not is_common:
                    drug_name_candidates.append(t)
        
        # Kết hợp text: Ưu tiên text có %, sau đó kết hợp với text khác gần nhau
        if percent_texts and drug_name_candidates:
            # Tìm text gần với text có %
            for percent_text in percent_texts:
                percent_center = (percent_text['center_x'], percent_text['center_y'])
                # Tìm text gần nhất (trong vòng 200px)
                nearby_texts = []
                for candidate in drug_name_candidates:
                    distance = ((candidate['center_x'] - percent_center[0])**2 + 
                               (candidate['center_y'] - percent_center[1])**2)**0.5
                    if distance < 200:  # Text trong vòng 200px
                        nearby_texts.append((candidate, distance))
                
                # Sắp xếp theo khoảng cách
                nearby_texts.sort(key=lambda x: x[1])
                
                # Kết hợp text gần nhau
                if nearby_texts:
                    combined = [percent_text['text']]
                    for candidate, _ in nearby_texts[:2]:  # Lấy tối đa 2 text gần nhất
                        if candidate['text'] not in combined:
                            combined.append(candidate['text'])
                    combined_text = ' '.join(combined)
                    combined_candidates.append({
                        'text': combined_text,
                        'score': 0.9,  # Điểm cao cho text kết hợp
                        'confidence': min(percent_text['confidence'], nearby_texts[0][0]['confidence'])
                    })
        
        # Nếu có text kết hợp, ưu tiên nó
        if combined_candidates:
            combined_candidates.sort(key=lambda x: x['score'], reverse=True)
            selected_text = combined_candidates[0]['text']
        elif candidate_texts:
            selected_text = candidate_texts[0]['text']
        else:
            # Nếu không có candidate, chọn text dài nhất không phải từ thông thường
            filtered = [t for t in all_texts if not any(w in common_words for w in t['text'].upper().split())]
            if filtered:
                selected_text = max(filtered, key=lambda x: len(x['text']))['text']
            else:
                selected_text = max(all_texts, key=lambda x: len(x['text']))['text']
        
        # Trả về text đã chọn và danh sách tất cả text
        all_texts_list = [t['text'] for t in all_texts]
        return selected_text, all_texts_list
        
    except Exception as e:
        print(f"⚠️ Lỗi OCR: {e}")
        return None, []

def search_drug_in_database(drug_name):
    """Tìm kiếm thuốc trong database"""
    if drug_db is None or drug_db.empty:
        return None
    
    # Làm sạch text: loại bỏ ký tự đặc biệt có thể gây lỗi regex
    drug_name_clean = drug_name.strip()
    # Loại bỏ các ký tự đặc biệt ở đầu/cuối như [ ] ( ) { }
    drug_name_clean = drug_name_clean.strip('[](){}')
    drug_name_lower = drug_name_clean.lower().strip()
    
    if not drug_name_lower:
        return None
    
    # Tìm exact match
    exact_match = drug_db[drug_db['DrugName'].str.lower() == drug_name_lower]
    if not exact_match.empty:
        return exact_match.iloc[0].to_dict()
    
    # Tìm partial match - dùng regex=False để tránh lỗi với ký tự đặc biệt
    try:
        partial_match = drug_db[drug_db['DrugName'].str.lower().str.contains(drug_name_lower, na=False, regex=False)]
        if not partial_match.empty:
            return partial_match.iloc[0].to_dict()
    except Exception as e:
        print(f"⚠️ Lỗi tìm kiếm partial match: {e}")
        # Fallback: escape regex special characters
        import re
        escaped_pattern = re.escape(drug_name_lower)
        try:
            partial_match = drug_db[drug_db['DrugName'].str.lower().str.contains(escaped_pattern, na=False, regex=True)]
            if not partial_match.empty:
                return partial_match.iloc[0].to_dict()
        except:
            pass
    
    # Tìm theo từ khóa
    keywords = drug_name_lower.split()
    for keyword in keywords:
        if len(keyword) > 3:  # Chỉ tìm từ có > 3 ký tự
            # Loại bỏ ký tự đặc biệt từ keyword
            keyword_clean = keyword.strip('[](){}.,;:!?')
            if len(keyword_clean) > 3:
                try:
                    keyword_match = drug_db[drug_db['DrugName'].str.lower().str.contains(keyword_clean, na=False, regex=False)]
                    if not keyword_match.empty:
                        return keyword_match.iloc[0].to_dict()
                except Exception as e:
                    print(f"⚠️ Lỗi tìm kiếm keyword '{keyword_clean}': {e}")
                    continue
    
    return None

def extract_drug_details_from_pdf(page_number, offset=-1):
    """
    Trích xuất thông tin chi tiết từ PDF dựa trên số trang
    Tìm thành phần, công dụng, chỉ định, chống chỉ định...
    """
    if pdf_reader is None:
        return {}
    
    try:
        # Chuyển đổi số trang sách thành index PDF (pypdf đánh số từ 0)
        # Offset thường là -1 vì PDF có thể có trang bìa, mục lục
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
    """API endpoint để scan thuốc từ ảnh hoặc text"""
    try:
        # Kiểm tra xem có text được gửi trực tiếp không (từ modal xác nhận OCR)
        if 'text' in request.json:
            confirmed_text = request.json['text']
            print(f"📝 Tìm kiếm với text đã xác nhận: {confirmed_text}")
            
            # Tìm kiếm trong database
            drug_info = search_drug_in_database(confirmed_text)
            
            if drug_info:
                # Kiểm tra thuốc kê đơn
                is_prescription = drug_info.get('Is_Prescription', False)
                if isinstance(is_prescription, str):
                    is_prescription = is_prescription.lower() in ['true', '1', 'yes']
                elif pd.isna(is_prescription):
                    is_prescription = False
                
                if is_prescription:
                    return jsonify({
                        'success': False,
                        'error': 'PRESCRIPTION_REQUIRED',
                        'message': '⚠️ Đây là thuốc kê đơn. Vui lòng sử dụng theo chỉ định của bác sĩ.',
                        'drug_name': drug_info.get('DrugName', ''),
                        'active_ingredient': drug_info.get('ActiveIngredient', ''),
                        'category': drug_info.get('Category', ''),
                        'extracted_text': confirmed_text
                    }), 403
                
                # Lấy thông tin từ PDF
                page_number = drug_info.get('PageNumber', '')
                pdf_details = {}
                if page_number and pdf_reader:
                    pdf_details = extract_drug_details_from_pdf(page_number)
                
                return jsonify({
                    'success': True,
                    'drug_name': drug_info.get('DrugName', ''),
                    'active_ingredient': drug_info.get('ActiveIngredient', ''),
                    'page_number': str(page_number),
                    'category': drug_info.get('Category', ''),
                    'extracted_text': confirmed_text,
                    'rx_status': 'OTC',
                    'composition': pdf_details.get('composition', ''),
                    'indications': pdf_details.get('indications', ''),
                    'contraindications': pdf_details.get('contraindications', ''),
                    'dosage': pdf_details.get('dosage', '')
                })
            else:
                return jsonify({
                    'success': False,
                    'message': 'Không tìm thấy thông tin thuốc trong database',
                    'extracted_text': confirmed_text
                }), 404
        
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
        
        # Trích xuất text từ ảnh (OCR) - trả về text đã chọn và tất cả text
        extracted_text, all_ocr_texts = extract_text_from_image(image_array)  # Dùng ảnh gốc
        
        if not extracted_text:
            return jsonify({
                'success': False,
                'message': 'Không thể nhận diện text từ ảnh. Vui lòng thử lại với ảnh rõ hơn.',
                'extracted_text': '',
                'all_ocr_texts': all_ocr_texts
            }), 400
        
        print(f"📝 Text nhận diện được: {extracted_text}")
        print(f"📋 Tất cả text OCR: {all_ocr_texts}")
        
        # Tìm kiếm trong database
        drug_info = search_drug_in_database(extracted_text)
        
        if drug_info:
            # KIỂM TRA AN TOÀN: Nếu là thuốc kê đơn (Is_Prescription = True), chặn lại
            is_prescription = drug_info.get('Is_Prescription', False)
            
            # Chuyển đổi giá trị boolean từ CSV (có thể là string "True"/"False" hoặc boolean)
            if isinstance(is_prescription, str):
                is_prescription = is_prescription.lower() in ['true', '1', 'yes']
            elif pd.isna(is_prescription):
                is_prescription = False
            
            if is_prescription:
                return jsonify({
                    'success': False,
                    'error': 'PRESCRIPTION_REQUIRED',
                    'message': '⚠️ Đây là thuốc kê đơn. Vui lòng sử dụng theo chỉ định của bác sĩ.',
                    'drug_name': drug_info.get('DrugName', ''),
                    'active_ingredient': drug_info.get('ActiveIngredient', ''),
                    'category': drug_info.get('Category', ''),
                    'extracted_text': extracted_text,
                    'all_ocr_texts': all_ocr_texts  # Trả về tất cả text OCR
                }), 403  # 403 Forbidden
            
            # Nếu là thuốc OTC, tiếp tục tra cứu thông tin chi tiết từ PDF
            page_number = drug_info.get('PageNumber', '')
            pdf_details = {}
            
            if page_number and pdf_reader:
                pdf_details = extract_drug_details_from_pdf(page_number)
            
            # Trả về thông tin thuốc đầy đủ
            return jsonify({
                'success': True,
                'drug_name': drug_info.get('DrugName', ''),
                'active_ingredient': drug_info.get('ActiveIngredient', ''),
                'page_number': str(page_number),
                'category': drug_info.get('Category', ''),
                'extracted_text': extracted_text,
                'all_ocr_texts': all_ocr_texts,  # Trả về tất cả text OCR
                'rx_status': 'OTC',
                'composition': pdf_details.get('composition', ''),
                'indications': pdf_details.get('indications', ''),
                'contraindications': pdf_details.get('contraindications', ''),
                'dosage': pdf_details.get('dosage', '')
            })
        else:
            # Không tìm thấy trong database - trả về để user có thể xác nhận OCR
            return jsonify({
                'success': False,
                'needs_ocr_confirm': True,  # Flag để frontend hiển thị modal xác nhận
                'message': 'Không tìm thấy thông tin thuốc trong database',
                'extracted_text': extracted_text,
                'all_ocr_texts': all_ocr_texts  # Trả về tất cả text OCR
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
    load_pdf()
    print("🚀 Starting MediScan AI Backend Server...")
    print("📡 API available at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)

