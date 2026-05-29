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

### Backend (Cloud VM + Nginx)

Use this setup when the backend service runs on the VM on port `8443`, DNS points
`leetstreak.pro` to the VM external IP, and the frontend should call the backend through
standard HTTPS:

```text
Vercel frontend -> https://leetstreak.pro:443 -> Nginx on VM -> Spring Boot on 127.0.0.1:8443
```

Before running the script, make sure `leetstreak.pro` and `www.leetstreak.pro` point to
the VM external IP, and Google Cloud firewall allows inbound traffic on ports `80` and
`443`.

Copy the repository to the VM, then run:

```bash
sudo bash infrastructure/setup-vm-nginx-letsencrypt.sh
```

The script:

- creates a valid free Let's Encrypt certificate, not a self-signed certificate
- exports it to `/home/<vm-user>/.certs/leetcode-app/keystore.p12` for Spring Boot
- installs Nginx
- configures Nginx on ports `80` and `443`
- redirects HTTP to HTTPS
- proxies `https://leetstreak.pro/api/...` to `https://127.0.0.1:8443/api/...`
- installs a Certbot renewal hook that refreshes `keystore.p12` after certificate renewal

By default the script uses:

```bash
DOMAIN=leetstreak.pro
APP_PROTOCOL=https
APP_PORT=8443
APP_USER=<sudo caller>
```

Override values only if needed:

```bash
sudo DOMAIN=leetstreak.pro APP_PROTOCOL=http APP_PORT=8443 APP_USER=grishin_anton95 \
  bash infrastructure/setup-vm-nginx-letsencrypt.sh
```

The script asks for a PKCS12 keystore password. Use the same password in the Spring Boot
production SSL configuration.

Set the frontend API host to the public domain without `:8443`:

```bash
REACT_APP_API_HOST=https://leetstreak.pro
REACT_APP_USE_MOCK_API=false
```

Also make sure backend CORS allows the production frontend origin:

```bash
CORS_ALLOWED_ORIGINS=https://leetcode-motivation.vercel.app,https://leetstreak.pro
```

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
