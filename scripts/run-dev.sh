#!/bin/bash

# Development startup script

echo "🚀 Starting LeetCode Motivation in Development Mode"

# Backend
echo "📱 Starting Backend (Dev Profile)..."
cd backend
./gradlew bootRun --args='--spring.profiles.active=dev' &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 10

# Frontend
echo "🌐 Starting Frontend (Development Mode)..."
cd ../web-ui
npm start &
FRONTEND_PID=$!

echo "✅ Development servers started!"
echo "📊 Backend: http://localhost:6084/api"
echo "🖥️  Frontend: http://localhost:3000"
echo ""
echo "💡 Using Mock API: ${REACT_APP_USE_MOCK_API:-true}"
echo "🔧 Environment: development"
echo ""
echo "Press Ctrl+C to stop all servers"

# Handle shutdown
trap 'kill $BACKEND_PID $FRONTEND_PID' SIGINT
wait