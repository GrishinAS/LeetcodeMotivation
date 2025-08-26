#!/bin/bash

# Production build script

echo "🏗️  Building LeetCode Motivation for Production"

# Backend
echo "📦 Building Backend JAR..."
cd backend
./gradlew clean build -x test
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed!"
    exit 1
fi

# Frontend
echo "📦 Building Frontend..."
cd ../web-ui
npm ci
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Production builds completed!"
echo "📊 Backend JAR: backend/build/libs/"
echo "🌐 Frontend build: web-ui/build/"
echo ""
echo "🚀 Ready for deployment!"

# Display deployment instructions
echo ""
echo "📋 Production Deployment Instructions:"
echo "1. Set environment variables:"
echo "   - DB_URL=jdbc:mysql://your-aurora-endpoint:3306/leetcode_motivation"
echo "   - DB_USERNAME=your-db-username"
echo "   - DB_PASSWORD=your-db-password"
echo "   - CORS_ALLOWED_ORIGINS=https://your-domain.com"
echo ""
echo "2. Run backend with production profile:"
echo "   java -jar backend/build/libs/LeetcodeMotivation-*.jar --spring.profiles.active=prod"
echo ""
echo "3. Deploy frontend build/ directory to your web server"