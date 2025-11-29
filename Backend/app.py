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
import google.generativeai as genai

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    # Load .env file từ thư mục Backend
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    load_dotenv(env_path)
    print(f"✅ Đã load .env từ: {env_path}")
except ImportError:
    print("⚠️ python-dotenv chưa được cài đặt. Sử dụng environment variables từ hệ thống.")
except Exception as e:
    print(f"⚠️ Không thể load .env file: {e}")

# Fix cho Pillow 10.0+ không còn Image.ANTIALIAS
# EasyOCR và một số thư viện vẫn cần ANTIALIAS
if not hasattr(Image, 'ANTIALIAS'):
    Image.ANTIALIAS = Image.LANCZOS

app = Flask(__name__)
# Cấu hình CORS chi tiết để hỗ trợ port forwarding
CORS(app, 
     resources={r"/api/*": {
         "origins": "*",
         "methods": ["GET", "POST", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"]
     }},
     supports_credentials=True)

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
        if not base64_string:
            print("❌ Base64 string rỗng")
            return None
        
        # Remove data URL prefix if present (data:image/jpeg;base64,...)
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Loại bỏ whitespace
        base64_string = base64_string.strip()
        
        # Decode base64 với validation
        try:
            image_data = base64.b64decode(base64_string, validate=True)
        except Exception as e:
            print(f"❌ Lỗi decode base64: {e}")
            return None
        
        if len(image_data) == 0:
            print("❌ Image bytes rỗng sau khi decode")
            return None
        
        # Mở ảnh bằng PIL
        try:
            image = Image.open(io.BytesIO(image_data))
        except Exception as e:
            print(f"❌ Lỗi mở ảnh từ bytes: {e}")
            return None
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        image_array = np.array(image)
        if image_array.size == 0:
            print("❌ Image array rỗng")
            return None
        
        print(f"✅ Decode ảnh thành công: {image_array.shape}")
        return image_array
    except Exception as e:
        print(f"❌ Error decoding image: {e}")
        import traceback
        print(traceback.format_exc())
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
            print("❌ OCR reader is None")
            return None, []
        
        # EasyOCR cần ảnh ở dạng numpy array (BGR hoặc RGB)
        if len(image_array.shape) == 2:
            image_rgb = cv2.cvtColor(image_array, cv2.COLOR_GRAY2RGB)
        else:
            image_rgb = image_array
        
        # Chuyển từ RGB sang BGR (OpenCV format)
        image_bgr = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
        height, width = image_bgr.shape[:2]
        print(f"📐 Ảnh kích thước: {width}x{height}")
        
        # OCR với EasyOCR
        print("🔍 Đang chạy OCR...")
        results = reader.readtext(image_bgr)
        print(f"📊 OCR tìm thấy {len(results) if results else 0} text regions")
        
        if not results:
            print("⚠️ OCR không tìm thấy text nào trong ảnh")
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
            print(f"  📝 Text: '{text}' - Confidence: {confidence:.2f}")
            if confidence > 0.2:  # Giảm ngưỡng xuống 20% để bắt được nhiều text hơn
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
            print("⚠️ Không có text nào sau khi filter (confidence > 0.2)")
            # Fallback: Lấy tất cả text dù confidence thấp
            print("🔄 Thử lấy tất cả text (không filter confidence)...")
            for (bbox, text, confidence) in results:
                text_cleaned = text.strip().strip('[](){}.,;:!?-_=+')
                if len(text_cleaned) >= 2:
                    x_coords = [point[0] for point in bbox]
                    y_coords = [point[1] for point in bbox]
                    center_x = sum(x_coords) / len(x_coords)
                    center_y = sum(y_coords) / len(y_coords)
                    text_width = max(x_coords) - min(x_coords)
                    text_height = max(y_coords) - min(y_coords)
                    text_area = text_width * text_height
                    normalized_area = text_area / (width * height)
                    
                    all_texts.append({
                        'text': text_cleaned,
                        'confidence': confidence,
                        'center_x': center_x,
                        'center_y': center_y,
                        'distance_from_center': ((center_x - width/2)**2 + (center_y - height/2)**2)**0.5 / ((width/2)**2 + (height/2)**2)**0.5,
                        'area': normalized_area
                    })
            
            if not all_texts:
                print("❌ Vẫn không có text nào sau khi lấy tất cả")
                return None, []
            else:
                print(f"✅ Đã lấy được {len(all_texts)} text (không filter confidence)")
        
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
        import traceback
        print(f"❌ Lỗi OCR: {e}")
        print(f"📋 Traceback:\n{traceback.format_exc()}")
        return None, []

def search_drug_in_database(drug_name, all_ocr_texts=None):
    """Tìm kiếm thuốc trong database - cải thiện với fuzzy matching và tìm theo hoạt chất"""
    if drug_db is None or drug_db.empty:
        return None
    
    # Làm sạch text: loại bỏ ký tự đặc biệt có thể gây lỗi regex
    drug_name_clean = drug_name.strip()
    # Loại bỏ các ký tự đặc biệt ở đầu/cuối như [ ] ( ) { }
    drug_name_clean = drug_name_clean.strip('[](){}')
    drug_name_lower = drug_name_clean.lower().strip()
    
    if not drug_name_lower:
        return None
    
    print(f"🔍 Tìm kiếm thuốc: '{drug_name_clean}'")
    
    # Tìm exact match trong DrugName
    exact_match = drug_db[drug_db['DrugName'].str.lower() == drug_name_lower]
    if not exact_match.empty:
        print(f"✅ Tìm thấy exact match: {exact_match.iloc[0]['DrugName']}")
        return exact_match.iloc[0].to_dict()
    
    # Tìm partial match trong DrugName
    try:
        partial_match = drug_db[drug_db['DrugName'].str.lower().str.contains(drug_name_lower, na=False, regex=False)]
        if not partial_match.empty:
            print(f"✅ Tìm thấy partial match: {partial_match.iloc[0]['DrugName']}")
            return partial_match.iloc[0].to_dict()
    except Exception as e:
        print(f"⚠️ Lỗi tìm kiếm partial match: {e}")
    
    # Tìm theo từ khóa trong DrugName
    keywords = drug_name_lower.split()
    for keyword in keywords:
        if len(keyword) > 3:
            keyword_clean = keyword.strip('[](){}.,;:!?')
            if len(keyword_clean) > 3:
                try:
                    keyword_match = drug_db[drug_db['DrugName'].str.lower().str.contains(keyword_clean, na=False, regex=False)]
                    if not keyword_match.empty:
                        print(f"✅ Tìm thấy theo keyword '{keyword_clean}': {keyword_match.iloc[0]['DrugName']}")
                        return keyword_match.iloc[0].to_dict()
                except Exception as e:
                    print(f"⚠️ Lỗi tìm kiếm keyword '{keyword_clean}': {e}")
                    continue
    
    # Nếu không tìm thấy, thử tìm trong ActiveIngredient
    print(f"🔍 Không tìm thấy trong DrugName, thử tìm trong ActiveIngredient...")
    try:
        ingredient_match = drug_db[drug_db['ActiveIngredient'].str.lower().str.contains(drug_name_lower, na=False, regex=False)]
        if not ingredient_match.empty:
            print(f"✅ Tìm thấy theo hoạt chất: {ingredient_match.iloc[0]['DrugName']} ({ingredient_match.iloc[0]['ActiveIngredient']})")
            return ingredient_match.iloc[0].to_dict()
    except Exception as e:
        print(f"⚠️ Lỗi tìm kiếm trong ActiveIngredient: {e}")
    
    # Nếu có all_ocr_texts, thử tìm với các text khác có confidence cao
    if all_ocr_texts:
        print(f"🔍 Thử tìm với các text OCR khác: {all_ocr_texts[:5]}")
        for ocr_text in all_ocr_texts[:5]:  # Thử 5 text đầu tiên
            if ocr_text and len(ocr_text.strip()) > 3:
                ocr_clean = ocr_text.strip().lower()
                try:
                    # Tìm trong DrugName
                    ocr_match = drug_db[drug_db['DrugName'].str.lower().str.contains(ocr_clean, na=False, regex=False)]
                    if not ocr_match.empty:
                        print(f"✅ Tìm thấy với text OCR '{ocr_text}': {ocr_match.iloc[0]['DrugName']}")
                        return ocr_match.iloc[0].to_dict()
                    
                    # Tìm trong ActiveIngredient
                    ocr_ingredient_match = drug_db[drug_db['ActiveIngredient'].str.lower().str.contains(ocr_clean, na=False, regex=False)]
                    if not ocr_ingredient_match.empty:
                        print(f"✅ Tìm thấy hoạt chất với text OCR '{ocr_text}': {ocr_ingredient_match.iloc[0]['DrugName']} ({ocr_ingredient_match.iloc[0]['ActiveIngredient']})")
                        return ocr_ingredient_match.iloc[0].to_dict()
                except:
                    continue
    
    print(f"❌ Không tìm thấy thuốc: '{drug_name_clean}'")
    return None

def summarize_drug_info_with_gemini(pdf_text, drug_name, drug_info):
    """
    Sử dụng Gemini AI để đọc toàn bộ thông tin từ PDF và tổng hợp thành:
    - Cách dùng (usage): Dễ hiểu, ngắn gọn
    - Lưu ý (notes): Từ chống chỉ định, tương tác thuốc, tác dụng phụ
    """
    if not pdf_text or len(pdf_text.strip()) < 50:
        print("⚠️ PDF text quá ngắn hoặc rỗng, không thể tổng hợp")
        return {
            'usage': 'Thông tin cách dùng không có trong dược thư cho thuốc này.',
            'notes': 'Thông tin lưu ý không có trong dược thư cho thuốc này.'
        }
    
    # Lấy API key từ environment variable
    gemini_api_key = os.getenv('GEMINI_API_KEY')
    if not gemini_api_key:
        print("⚠️ GEMINI_API_KEY không được cấu hình, trả về 'không có'")
        return {
            'usage': 'Thông tin cách dùng không có trong dược thư cho thuốc này.',
            'notes': 'Thông tin lưu ý không có trong dược thư cho thuốc này.'
        }
    
    try:
        # Cấu hình Gemini
        genai.configure(api_key=gemini_api_key)
        # Sử dụng Gemini 2.0 Flash (model mới nhất, nhanh và chính xác)
        try:
            model = genai.GenerativeModel('gemini-2.0-flash-exp')
        except Exception as e:
            print(f"⚠️ Không thể dùng gemini-2.0-flash-exp, thử gemini-2.0-flash: {e}")
            try:
                model = genai.GenerativeModel('gemini-2.0-flash')
            except Exception as e2:
                print(f"⚠️ Không thể dùng gemini-2.0-flash, thử gemini-1.5-flash: {e2}")
                model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Lấy thông tin bổ sung từ drug_info
        category = drug_info.get('Category', '')
        active_ingredient = drug_info.get('ActiveIngredient', '')
        
        # Giới hạn độ dài PDF text để tránh vượt quá token limit
        pdf_text_limited = pdf_text[:3000] if len(pdf_text) > 3000 else pdf_text
        
        # Prompt để tổng hợp thông tin - cải thiện để filter đúng thuốc và không bịa ra thông tin
        prompt = f"""Bạn là một dược sĩ chuyên nghiệp. Hãy đọc và tổng hợp thông tin từ Dược thư Quốc gia về thuốc CỤ THỂ sau:

**THUỐC CẦN TÌM:**
- Tên thuốc: {drug_name}
- Hoạt chất: {active_ingredient}
- Phân loại: {category}

**LƯU Ý QUAN TRỌNG - ĐỌC KỸ:**
- Trang PDF có thể chứa thông tin của NHIỀU thuốc khác nhau
- BẠN CHỈ ĐƯỢC tổng hợp thông tin về thuốc "{drug_name}" hoặc "{active_ingredient}"
- BỎ QUA hoàn toàn thông tin về các thuốc khác (như Polymyxin, Polygelin, hoặc bất kỳ thuốc nào khác)
- **QUAN TRỌNG NHẤT: NẾU KHÔNG TÌM THẤY THÔNG TIN VỀ THUỐC NÀY TRONG PDF, BẠN PHẢI TRẢ VỀ "KHÔNG CÓ TRONG DƯỢC THƯ"**
- **TUYỆT ĐỐI KHÔNG ĐƯỢC BỊA RA, TẠO RA, HOẶC SUY ĐOÁN THÔNG TIN KHÔNG CÓ TRONG PDF**
- **CHỈ TỔNG HỢP THÔNG TIN CÓ THẬT TRONG PDF, KHÔNG THÊM BẤT KỲ THÔNG TIN NÀO KHÔNG CÓ TRONG PDF**

**Thông tin từ Dược thư (có thể chứa nhiều thuốc):**
{pdf_text_limited}

**YÊU CẦU:**
1. Tổng hợp phần "CÁCH DÙNG" (usage) - CHỈ về thuốc "{drug_name}":
   - **CHỈ tổng hợp thông tin CÓ THẬT trong PDF về thuốc này**
   - Viết bằng ngôn ngữ đơn giản, dễ hiểu
   - Tập trung vào: liều lượng, thời điểm uống, cách uống, tần suất
   - Sử dụng câu ngắn gọn, rõ ràng
   - Loại bỏ thuật ngữ y khoa phức tạp
   - **NẾU KHÔNG TÌM THẤY THÔNG TIN VỀ THUỐC NÀY, BẠN PHẢI VIẾT CHÍNH XÁC: "Thông tin cách dùng không có trong dược thư cho thuốc này."**
   - **KHÔNG ĐƯỢC TẠO RA, BỊA RA, HOẶC SUY ĐOÁN THÔNG TIN**

2. Tổng hợp phần "LƯU Ý" (notes) - CHỈ về thuốc "{drug_name}":
   - **CHỈ tổng hợp thông tin CÓ THẬT trong PDF về thuốc này**
   - Từ chống chỉ định: ai không nên dùng
   - Tương tác thuốc: không dùng cùng với thuốc gì
   - Tác dụng phụ: cần chú ý gì
   - Đối tượng đặc biệt: phụ nữ có thai, trẻ em, người già
   - Bảo quản: cách bảo quản thuốc
   - **NẾU KHÔNG TÌM THẤY THÔNG TIN VỀ THUỐC NÀY, BẠN PHẢI VIẾT CHÍNH XÁC: "Thông tin lưu ý không có trong dược thư cho thuốc này."**
   - **KHÔNG ĐƯỢC TẠO RA, BỊA RA, HOẶC SUY ĐOÁN THÔNG TIN**

**Trả về theo định dạng JSON:**
{{
  "usage": "Phần cách dùng (CHỈ thông tin có thật trong PDF về {drug_name}, hoặc 'Thông tin cách dùng không có trong dược thư cho thuốc này.' nếu không có)",
  "notes": "Phần lưu ý (CHỈ thông tin có thật trong PDF về {drug_name}, hoặc 'Thông tin lưu ý không có trong dược thư cho thuốc này.' nếu không có)"
}}

**QUAN TRỌNG:**
- Chỉ trả về JSON, không thêm text khác
- KHÔNG được trả về thông tin của thuốc khác
- **TUYỆT ĐỐI KHÔNG BỊA RA THÔNG TIN - CHỈ TỔNG HỢP THÔNG TIN CÓ THẬT TRONG PDF**
- Nếu không tìm thấy, phải trả về message "không có trong dược thư" một cách rõ ràng"""
        
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Loại bỏ markdown code blocks nếu có
        result_text = result_text.replace('```json', '').replace('```', '').strip()
        
        # Parse JSON
        import json
        try:
            result = json.loads(result_text)
            usage = result.get('usage', '').strip()
            notes = result.get('notes', '').strip()
            
            # Kiểm tra xem có phải là thông báo không có thông tin không
            # Chuẩn hóa message để đảm bảo rõ ràng
            usage_lower = usage.lower()
            notes_lower = notes.lower()
            
            # Kiểm tra các pattern cho "không có thông tin"
            no_info_patterns = [
                'không tìm thấy',
                'không có trong',
                'không có thông tin',
                'chưa có thông tin',
                'thiếu thông tin'
            ]
            
            if any(pattern in usage_lower for pattern in no_info_patterns):
                usage = "Thông tin cách dùng không có trong dược thư cho thuốc này."
            
            if any(pattern in notes_lower for pattern in no_info_patterns):
                notes = "Thông tin lưu ý không có trong dược thư cho thuốc này."
            
            # Kiểm tra nếu Gemini trả về text quá ngắn hoặc không có ý nghĩa (có thể là bịa ra)
            # Nếu usage hoặc notes quá ngắn (< 20 ký tự) và không phải là message "không có", có thể là lỗi
            if len(usage.strip()) < 20 and not any(pattern in usage_lower for pattern in no_info_patterns):
                print(f"⚠️ Usage quá ngắn ({len(usage)} ký tự), có thể không chính xác. Đặt lại thành 'không có'")
                usage = "Thông tin cách dùng không có trong dược thư cho thuốc này."
            
            if len(notes.strip()) < 20 and not any(pattern in notes_lower for pattern in no_info_patterns):
                print(f"⚠️ Notes quá ngắn ({len(notes)} ký tự), có thể không chính xác. Đặt lại thành 'không có'")
                notes = "Thông tin lưu ý không có trong dược thư cho thuốc này."
            
            # Giới hạn độ dài
            if len(usage) > 500:
                usage = usage[:500] + "..."
            if len(notes) > 600:
                notes = notes[:600] + "..."
            
            print(f"✅ Đã tổng hợp thông tin với Gemini cho {drug_name}")
            return {
                'usage': usage,
                'notes': notes
            }
        except json.JSONDecodeError:
            # Nếu không parse được JSON, thử extract thủ công
            print("⚠️ Không parse được JSON từ Gemini, thử extract thủ công")
            # Tìm phần usage và notes trong text
            usage_start = result_text.find('"usage"') or result_text.find('CÁCH DÙNG')
            notes_start = result_text.find('"notes"') or result_text.find('LƯU Ý')
            
            if usage_start > -1 and notes_start > -1:
                usage = result_text[usage_start:notes_start].replace('"usage":', '').strip('",')
                notes = result_text[notes_start:].replace('"notes":', '').strip('",')
                return {'usage': usage[:500], 'notes': notes[:600]}
            else:
                # Fallback: chia text làm 2 phần
                parts = result_text.split('\n\n')
                usage = parts[0] if len(parts) > 0 else ''
                notes = parts[1] if len(parts) > 1 else ''
                return {'usage': usage[:500], 'notes': notes[:600]}
        
    except Exception as e:
        print(f"⚠️ Lỗi khi gọi Gemini API: {e}")
        return {'usage': '', 'notes': ''}

def generate_recommendations(drug_info, pdf_details):
    """
    Tạo khuyến nghị sử dụng thuốc dựa trên thông tin thuốc
    """
    recommendations = []
    
    # Khuyến nghị dựa trên phân loại
    category = drug_info.get('Category', '').lower()
    if 'kháng sinh' in category:
        recommendations.append("Kháng sinh cần uống đủ liều và đủ thời gian theo chỉ định của bác sĩ, không tự ý ngừng thuốc.")
    elif 'giảm đau' in category or 'hạ sốt' in category:
        recommendations.append("Thuốc giảm đau hạ sốt nên uống sau khi ăn để tránh kích ứng dạ dày.")
    elif 'chống viêm' in category:
        recommendations.append("Thuốc chống viêm nên uống sau khi ăn và uống nhiều nước.")
    elif 'vitamin' in category or 'bổ sung' in category:
        recommendations.append("Vitamin và chất bổ sung nên uống theo liều lượng khuyến nghị, không lạm dụng.")
    
    # Khuyến nghị dựa trên chống chỉ định
    contraindications = pdf_details.get('contraindications', '').lower()
    if contraindications:
        if 'phụ nữ có thai' in contraindications or 'mang thai' in contraindications:
            recommendations.append("Không sử dụng cho phụ nữ có thai hoặc đang cho con bú nếu không có chỉ định của bác sĩ.")
        if 'trẻ em' in contraindications or 'trẻ nhỏ' in contraindications:
            recommendations.append("Cần thận trọng khi sử dụng cho trẻ em, nên tham khảo ý kiến bác sĩ.")
    
    # Khuyến nghị dựa trên cách dùng
    usage = pdf_details.get('usage', '') or pdf_details.get('dosage', '')
    if usage:
        if 'sau khi ăn' in usage.lower() or 'sau bữa ăn' in usage.lower():
            recommendations.append("Nên uống thuốc sau khi ăn để đạt hiệu quả tốt nhất và giảm tác dụng phụ.")
        if 'trước khi ăn' in usage.lower() or 'khi đói' in usage.lower():
            recommendations.append("Nên uống thuốc trước khi ăn hoặc khi đói để hấp thu tốt hơn.")
    
    # Khuyến nghị chung
    if not recommendations:
        recommendations.append("Vui lòng đọc kỹ hướng dẫn sử dụng trước khi dùng và tuân thủ liều lượng khuyến nghị.")
        recommendations.append("Nếu có bất kỳ dấu hiệu bất thường nào, hãy ngừng sử dụng và tham khảo ý kiến bác sĩ.")
    else:
        recommendations.append("Nếu có bất kỳ dấu hiệu bất thường nào, hãy ngừng sử dụng và tham khảo ý kiến bác sĩ.")
    
    return recommendations

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
        
        # Tìm phần text liên quan đến thuốc cụ thể (nếu có tên thuốc trong text)
        # Lấy toàn bộ text nhưng sẽ filter trong prompt của Gemini
        full_text = text
        
        details = {
            'composition': '',
            'indications': '',
            'contraindications': '',
            'dosage': '',
            'usage': '',  # Cách dùng
            'full_text': full_text  # Giữ toàn bộ text để Gemini có thể filter
        }
        
        # Regex patterns để tìm các thông tin
        patterns = {
            'composition': re.compile(r'(Thành phần|Thành phần chính|Hoạt chất)[:\.]\s*(.+?)(?:\n|$)', re.IGNORECASE),
            'indications': re.compile(r'(Chỉ định|Công dụng|Tác dụng)[:\.]\s*(.+?)(?:\n|Chống chỉ định|Liều dùng|$)', re.IGNORECASE | re.DOTALL),
            'contraindications': re.compile(r'(Chống chỉ định|Không dùng)[:\.]\s*(.+?)(?:\n|Liều dùng|Cách dùng|$)', re.IGNORECASE | re.DOTALL),
            'dosage': re.compile(r'(Liều dùng|Cách dùng|Liều lượng|Cách sử dụng)[:\.]\s*(.+?)(?:\n|Tác dụng phụ|Lưu ý|Bảo quản|$)', re.IGNORECASE | re.DOTALL),
            'usage': re.compile(r'(Cách dùng|Hướng dẫn sử dụng|Sử dụng)[:\.]\s*(.+?)(?:\n|Lưu ý|Tác dụng phụ|$)', re.IGNORECASE | re.DOTALL)
        }
        
        # Tìm từng loại thông tin
        for key, pattern in patterns.items():
            match = pattern.search(text)
            if match:
                details[key] = match.group(2).strip()[:500]  # Giới hạn độ dài
        
        # Nếu không tìm thấy "usage", dùng "dosage" làm cách dùng
        if not details['usage'] and details['dosage']:
            details['usage'] = details['dosage']
        
        return details
        
    except Exception as e:
        print(f"⚠️ Lỗi đọc PDF trang {page_number}: {e}")
        return {}

@app.route('/api/health', methods=['GET', 'OPTIONS'])
def health_check():
    """Health check endpoint"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    
    return jsonify({
        'status': 'ok',
        'message': 'Backend API is running',
        'drugs_loaded': len(drug_db) if drug_db is not None else 0
    })

@app.route('/api/scan', methods=['POST', 'OPTIONS'])
def scan_drug():
    """API endpoint để scan thuốc từ ảnh hoặc text"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    
    try:
        # Kiểm tra request có JSON không
        if not request.is_json:
            print("❌ Request không phải JSON")
            return jsonify({
                'success': False,
                'error': 'Invalid request format',
                'message': 'Request phải là JSON format'
            }), 400
        
        # Kiểm tra xem có text được gửi trực tiếp không (từ modal xác nhận OCR)
        if request.json and 'text' in request.json:
            confirmed_text = request.json['text']
            print(f"📝 Tìm kiếm với text đã xác nhận: {confirmed_text}")
            
            # Tìm kiếm trong database
            drug_info = search_drug_in_database(confirmed_text, None)
            
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
                    
                    # Sử dụng Gemini để tổng hợp thông tin từ PDF
                    drug_name = drug_info.get('DrugName', '')
                    pdf_full_text = pdf_details.get('full_text', '')
                    
                    if pdf_full_text:
                        # Tổng hợp với Gemini: cách dùng + lưu ý
                        gemini_summary = summarize_drug_info_with_gemini(pdf_full_text, drug_name, drug_info)
                        
                        # Cập nhật usage và thêm notes
                        if gemini_summary.get('usage'):
                            pdf_details['usage'] = gemini_summary['usage']
                        if gemini_summary.get('notes'):
                            pdf_details['notes'] = gemini_summary['notes']
                
                # Tạo khuyến nghị
                recommendations = generate_recommendations(drug_info, pdf_details)
                
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
                    'dosage': pdf_details.get('dosage', ''),
                    'usage': pdf_details.get('usage', ''),  # Cách dùng (tổng hợp bởi Gemini)
                    'notes': pdf_details.get('notes', ''),  # Lưu ý (tổng hợp bởi Gemini)
                    'recommendations': recommendations  # Khuyến nghị
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
            
            # Loại bỏ data URL prefix nếu có (data:image/jpeg;base64,...)
            if ',' in base64_image:
                base64_image = base64_image.split(',')[1]
            
            image_array = decode_base64_image(base64_image)
            if image_array is None:
                print(f"❌ Lỗi decode base64 image. Length: {len(base64_image) if base64_image else 0}")
                return jsonify({
                    'success': False,
                    'error': 'Invalid image data',
                    'message': 'Không thể đọc ảnh. Vui lòng thử lại với ảnh khác.'
                }), 400
        else:
            print(f"❌ Không có image trong request. Keys: {list(request.json.keys()) if request.json else 'No JSON'}")
            return jsonify({
                'success': False,
                'error': 'No image provided',
                'message': 'Vui lòng cung cấp ảnh để quét.'
            }), 400
        
        # Tiền xử lý ảnh
        processed_image = preprocess_image(image_array)
        
        # Trích xuất text từ ảnh (OCR) - trả về text đã chọn và tất cả text
        extracted_text, all_ocr_texts = extract_text_from_image(image_array)  # Dùng ảnh gốc
        
        # Kiểm tra kết quả OCR
        if extracted_text is None:
            print("❌ OCR trả về None")
            return jsonify({
                'success': False,
                'message': 'Lỗi khi xử lý OCR. Vui lòng thử lại.',
                'extracted_text': '',
                'all_ocr_texts': all_ocr_texts or []
            }), 500
        
        if not extracted_text or extracted_text.strip() == '':
            print(f"⚠️ OCR không tìm thấy text. All texts: {all_ocr_texts}")
            # Vẫn trả về 200 nhưng với success=False để frontend có thể xử lý
            return jsonify({
                'success': False,
                'message': 'Không thể nhận diện text từ ảnh. Vui lòng thử lại với ảnh rõ hơn hoặc chụp lại.',
                'extracted_text': '',
                'all_ocr_texts': all_ocr_texts or []
            }), 200  # Đổi thành 200 để frontend có thể xử lý
        
        print(f"📝 Text nhận diện được: {extracted_text}")
        print(f"📋 Tất cả text OCR: {all_ocr_texts}")
        
        # Tìm kiếm trong database - truyền cả all_ocr_texts để tìm với các text khác
        drug_info = search_drug_in_database(extracted_text, all_ocr_texts)
        
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
                
                # Sử dụng Gemini để tổng hợp thông tin từ PDF
                drug_name = drug_info.get('DrugName', '')
                pdf_full_text = pdf_details.get('full_text', '')
                
                if pdf_full_text:
                    # Tổng hợp với Gemini: cách dùng + lưu ý
                    gemini_summary = summarize_drug_info_with_gemini(pdf_full_text, drug_name, drug_info)
                    
                    # Cập nhật usage và thêm notes
                    if gemini_summary.get('usage'):
                        pdf_details['usage'] = gemini_summary['usage']
                    if gemini_summary.get('notes'):
                        pdf_details['notes'] = gemini_summary['notes']
            
            # Tạo khuyến nghị
            recommendations = generate_recommendations(drug_info, pdf_details)
            
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
                'dosage': pdf_details.get('dosage', ''),
                'usage': pdf_details.get('usage', ''),  # Cách dùng (tổng hợp bởi Gemini)
                'notes': pdf_details.get('notes', ''),  # Lưu ý (tổng hợp bởi Gemini)
                'recommendations': recommendations  # Khuyến nghị
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
        import traceback
        error_trace = traceback.format_exc()
        print(f"❌ Error processing scan: {e}")
        print(f"📋 Traceback:\n{error_trace}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': f'Lỗi khi xử lý: {str(e)}'
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
    
    # Hiển thị IP local để kết nối từ mobile
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        print(f"📱 Mobile access: http://{local_ip}:5000")
        print(f"   (Đảm bảo mobile và máy tính cùng WiFi)")
    except:
        pass
    
    app.run(debug=True, host='0.0.0.0', port=5000)

