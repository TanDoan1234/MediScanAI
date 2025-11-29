#!/bin/bash

# Script to test backend API connection

echo "🔍 Testing Backend API Connection..."
echo ""

API_URL="http://localhost:5000/api"

# Test 1: Health check
echo "1️⃣ Testing Health Endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$HEALTH_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Health check passed!"
    echo "Response: $BODY"
else
    echo "❌ Health check failed (HTTP $HTTP_CODE)"
    echo "⚠️  Backend might not be running"
    echo ""
    echo "To start backend:"
    echo "  cd Backend"
    echo "  python app.py"
    exit 1
fi

echo ""
echo "2️⃣ Testing Search Endpoint..."
SEARCH_RESPONSE=$(curl -s "$API_URL/drugs/search?q=panadol")
echo "Response: $SEARCH_RESPONSE" | head -c 200
echo "..."

echo ""
echo "✅ Backend is running and accessible!"
echo ""
echo "📝 Frontend Configuration:"
echo "  - Development: http://localhost:5000/api"
echo "  - Production: Check Web/src/utils/api.js"

