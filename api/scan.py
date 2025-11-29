from http.server import BaseHTTPRequestHandler
import json
import sys
from api.utils import (
    decode_base64_image,
    preprocess_image,
    extract_text_from_image,
    search_drug_in_database
)

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        return
    
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            # Parse JSON
            try:
                data = json.loads(body.decode('utf-8'))
            except:
                self.send_error(400, 'Invalid JSON')
                return
            
            # Get image from request
            if 'image' not in data:
                self.send_error(400, 'No image provided')
                return
            
            base64_image = data['image']
            image_array = decode_base64_image(base64_image)
            
            if image_array is None:
                self.send_error(400, 'Invalid image data')
                return
            
            # Process image
            processed_image = preprocess_image(image_array)
            extracted_text = extract_text_from_image(processed_image)
            
            # Search in database
            drug_info = search_drug_in_database(extracted_text)
            
            if drug_info:
                response = {
                    'success': True,
                    'drug_name': drug_info.get('DrugName', ''),
                    'active_ingredient': drug_info.get('ActiveIngredient', ''),
                    'page_number': str(drug_info.get('PageNumber', '')),
                    'extracted_text': extracted_text,
                    'rx_status': 'OTC'
                }
                status_code = 200
            else:
                response = {
                    'success': False,
                    'message': 'Không tìm thấy thông tin thuốc trong database',
                    'extracted_text': extracted_text
                }
                status_code = 404
            
            # Send response
            self.send_response(status_code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"Error processing scan: {e}", file=sys.stderr)
            error_response = {
                'error': 'Internal server error',
                'message': str(e)
            }
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode())

