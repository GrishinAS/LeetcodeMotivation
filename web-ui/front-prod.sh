echo "🌐 Starting Frontend (Development Mode)..."

export REACT_APP_USE_MOCK_API=false
export NODE_ENV=production
npm start &
FRONTEND_PID=$!

trap 'kill $BACKEND_PID $FRONTEND_PID' SIGINT
wait