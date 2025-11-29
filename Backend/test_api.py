"""
Test script for MediScan Backend API
"""
import requests
import json
import os

BASE_URL = "http://localhost:5000"


def test_health_check():
    """Test health check endpoint"""
    print("Testing /health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print("-" * 50)


def test_search_drug(query):
    """Test drug search endpoint"""
    print(f"Testing /api/search with query: '{query}'...")
    response = requests.get(f"{BASE_URL}/api/search", params={'q': query})
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print("-" * 50)


def test_get_drug_details(drug_name):
    """Test get drug details endpoint"""
    print(f"Testing /api/drug/{drug_name}...")
    response = requests.get(f"{BASE_URL}/api/drug/{drug_name}")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print("-" * 50)


def test_scan_drug(image_path):
    """Test drug scan endpoint with image"""
    if not os.path.exists(image_path):
        print(f"Error: Image file not found: {image_path}")
        return
    
    print(f"Testing /api/scan with image: {image_path}...")
    with open(image_path, 'rb') as f:
        files = {'image': f}
        response = requests.post(f"{BASE_URL}/api/scan", files=files)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print("-" * 50)


def main():
    """Run all tests"""
    print("=" * 50)
    print("MediScan Backend API Tests")
    print("=" * 50)
    
    # Test 1: Health check
    test_health_check()
    
    # Test 2: Search drugs
    test_search_drug("paracetamol")
    test_search_drug("vitamin")
    test_search_drug("kháng sinh")
    
    # Test 3: Get drug details
    test_get_drug_details("Paracetamol")
    
    # Test 4: Scan drug (if you have a test image)
    # test_scan_drug("path/to/test/image.jpg")
    
    print("All tests completed!")


if __name__ == "__main__":
    main()
