// Script to test backend connection
// Run with: node test_backend_connection.js

const API_URL = 'http://localhost:5000/api';

async function testBackendConnection() {
  console.log('🔍 Testing backend connection...\n');

  // Test 1: Health check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    console.log('⚠️  Make sure backend is running: cd Backend && python app.py');
    return;
  }

  // Test 2: Search drugs
  console.log('\n2️⃣ Testing search endpoint...');
  try {
    const searchResponse = await fetch(`${API_URL}/drugs/search?q=panadol`);
    const searchData = await searchResponse.json();
    console.log('✅ Search test:', searchData);
  } catch (error) {
    console.log('❌ Search test failed:', error.message);
  }

  // Test 3: Scan endpoint (with dummy image)
  console.log('\n3️⃣ Testing scan endpoint...');
  try {
    // Create a dummy base64 image (1x1 pixel)
    const dummyImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==';
    
    const scanResponse = await fetch(`${API_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: dummyImage
      })
    });
    const scanData = await scanResponse.json();
    console.log('✅ Scan test:', scanData);
  } catch (error) {
    console.log('❌ Scan test failed:', error.message);
  }

  console.log('\n✅ Backend connection test completed!');
}

testBackendConnection();

