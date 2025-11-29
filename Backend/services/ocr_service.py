"""
OCR Service - Nhận diện chữ từ ảnh sử dụng EasyOCR và Tesseract
"""
import cv2
import numpy as np
from PIL import Image
import easyocr
import logging

logger = logging.getLogger(__name__)


class OCRService:
    def __init__(self):
        """
        Initialize OCR service with EasyOCR (supports Vietnamese)
        """
        try:
            # Initialize EasyOCR with Vietnamese and English
            self.reader = easyocr.Reader(['vi', 'en'], gpu=False)
            logger.info("EasyOCR initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize EasyOCR: {str(e)}")
            self.reader = None

    def preprocess_image(self, image_path):
        """
        Tiền xử lý ảnh để cải thiện độ chính xác OCR
        """
        try:
            # Read image
            img = cv2.imread(image_path)
            
            if img is None:
                raise ValueError(f"Cannot read image: {image_path}")
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply adaptive thresholding
            thresh = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY, 11, 2
            )
            
            # Denoise
            denoised = cv2.fastNlMeansDenoising(thresh)
            
            return denoised
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            return cv2.imread(image_path)

    def extract_text(self, image_path):
        """
        Trích xuất text từ ảnh
        
        Args:
            image_path: Đường dẫn đến file ảnh
            
        Returns:
            str: Text được nhận diện từ ảnh
        """
        try:
            if not self.reader:
                raise Exception("OCR reader not initialized")
            
            logger.info(f"Processing image: {image_path}")
            
            # Preprocess image
            processed_img = self.preprocess_image(image_path)
            
            # Perform OCR
            results = self.reader.readtext(processed_img)
            
            # Extract text from results
            extracted_texts = []
            for (bbox, text, confidence) in results:
                if confidence > 0.3:  # Filter low confidence results
                    extracted_texts.append(text.strip())
                    logger.info(f"Detected: '{text}' (confidence: {confidence:.2f})")
            
            # Combine all detected text
            full_text = ' '.join(extracted_texts)
            
            return full_text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting text: {str(e)}")
            return ""

    def extract_text_with_details(self, image_path):
        """
        Trích xuất text kèm thông tin chi tiết (bounding box, confidence)
        
        Returns:
            list: List of dict containing text, bbox, confidence
        """
        try:
            if not self.reader:
                raise Exception("OCR reader not initialized")
            
            # Preprocess image
            processed_img = self.preprocess_image(image_path)
            
            # Perform OCR
            results = self.reader.readtext(processed_img)
            
            # Format results
            formatted_results = []
            for (bbox, text, confidence) in results:
                if confidence > 0.3:
                    formatted_results.append({
                        'text': text.strip(),
                        'bbox': bbox,
                        'confidence': float(confidence)
                    })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error extracting text with details: {str(e)}")
            return []
