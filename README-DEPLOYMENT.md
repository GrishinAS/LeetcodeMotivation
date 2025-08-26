# Environment Configuration & Deployment Guide

## 🏗️ Environment Profiles

### Development Mode

**Backend (Spring Profile: `dev`)**
- Uses local SQLite database
- Debug logging enabled
- CORS allows localhost:3000
- Auto DDL generation

**Frontend (React: `development`)**
- Mock API enabled by default
- Debug logging
- Development tools enabled

### Production Mode  

**Backend (Spring Profile: `prod`)**
- AWS Aurora MySQL database
- Minimal logging
- Environment-based configuration
- Security headers enabled
- Connection pooling optimized

**Frontend (React: `production`)**
- Real API calls
- Optimized build
- Analytics enabled
- No debug tools

## 🚀 Quick Start

### Development
```bash
# Option 1: Use development script
./scripts/run-dev.sh

# Option 2: Manual startup
# Backend
cd backend && ./gradlew bootRun --args='--spring.profiles.active=dev'

# Frontend  
cd web-ui && npm start
```

### Production Build
```bash
./scripts/build-prod.sh
```

## 🔧 Environment Variables

### Backend (Production)
Required environment variables:
```bash
DB_URL=jdbc:mysql://your-aurora-endpoint:3306/leetcode_motivation
DB_USERNAME=your-db-username  
DB_PASSWORD=your-db-password
CORS_ALLOWED_ORIGINS=https://your-domain.com
```

### Frontend
Create `.env.production.local` for production overrides:
```bash
REACT_APP_API_HOST=https://your-api-domain.com
REACT_APP_USE_MOCK_API=false
```

## 📁 Configuration Files

### Backend Spring Profiles
- `application.properties` - Common settings
- `application-dev.properties` - Development settings  
- `application-prod.properties` - Production settings

### Frontend Environment Files
- `.env.development` - Development defaults
- `.env.production` - Production defaults
- `.env.local` - Local overrides (gitignored)

## 🧪 Mock API (Development)

When `REACT_APP_USE_MOCK_API=true`:
- All API calls return mock data
- Authentication always succeeds
- No backend required
- Simulated network delays
- Console logging of all "API" calls

Mock user credentials:
- Username: testuser
- Email: test@example.com  
- LeetCode Account: testleetcode

## 🔄 Environment Switching

### Change Backend Profile
```bash
# Development
./gradlew bootRun --args='--spring.profiles.active=dev'

# Production  
java -jar build/libs/app.jar --spring.profiles.active=prod
```

### Change Frontend Mode
```bash
# Force mock API in development
REACT_APP_USE_MOCK_API=true npm start

# Use real API in development
REACT_APP_USE_MOCK_API=false npm start
```

## 🏭 Production Deployment

### Backend (AWS)
1. Set environment variables in your AWS service (ECS/Elastic Beanstalk/EC2)
2. Deploy JAR file: `backend/build/libs/LeetcodeMotivation-*.jar`
3. Run with: `java -jar app.jar --spring.profiles.active=prod`

### Frontend (AWS S3/CloudFront)
1. Build: `npm run build`  
2. Upload `build/` contents to S3 bucket
3. Configure CloudFront distribution
4. Update API_HOST to your backend URL

## 🔒 Security Notes

- Production properties file should be environment-specific (not in git)
- Use AWS Parameter Store/Secrets Manager for sensitive data
- Enable HTTPS in production
- Configure proper CORS origins
- Use secure JWT secret keys

## 🐛 Troubleshooting

### Common Issues
1. **CORS errors**: Check `CORS_ALLOWED_ORIGINS` matches your frontend domain
2. **Database connection**: Verify Aurora endpoint and credentials  
3. **Mock API not working**: Ensure `REACT_APP_USE_MOCK_API=true`
4. **JWT errors**: Check if backend restarted (invalidates tokens)

### Debug Commands
```bash
# Check environment variables
printenv | grep REACT_APP
echo $DB_URL

# Check Spring profile
curl http://localhost:6084/api/actuator/env
```