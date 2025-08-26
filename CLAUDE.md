# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LeetCode Motivation is a full-stack web application that tracks LeetCode progress and provides monetary rewards for solved problems. The system consists of a Spring Boot backend and a React frontend.

## Architecture

### Backend (Java Spring Boot)
- **Location**: `/backend`
- **Framework**: Spring Boot 3.3.1 with Java 21
- **Database**: SQLite with JPA/Hibernate
- **Security**: JWT authentication with CSRF protection
- **API**: REST endpoints served at `/api` context path (port 6084)

#### Key Components:
- **User Management**: Registration, login, JWT token generation (`user/` package)
- **Stats Tracking**: LeetCode API integration for problem-solving statistics (`stats/` package)
- **Payment System**: Point calculation and reward distribution (`payment/` package)
- **Security Layer**: Custom JWT filter, CSRF handling, CORS configuration (`spring/security/` package)

#### Reward System:
- Easy problems: 3 points × 10 = 30 cents
- Medium problems: 10 points × 10 = $1.00  
- Hard problems: 25 points × 10 = $2.50

### Frontend (React)
- **Location**: `/web-ui`
- **Framework**: React 18 with React Router
- **Styling**: CSS modules
- **HTTP Client**: Axios with JWT and CSRF token handling
- **State**: Local component state (no global state management)

#### Key Features:
- Authentication flow (login/signup/logout)
- Stats dashboard showing LeetCode progress
- Point redemption interface
- CSRF protection with automatic token handling

## Development Commands

### Backend
```bash
cd backend

# Run the application
./gradlew bootRun

# Build the project
./gradlew build

# Run tests
./gradlew test

# Clean build
./gradlew clean build
```

### Frontend
```bash
cd web-ui

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Security Implementation

The application implements a multi-layered security approach:

1. **JWT Authentication**: Stateless authentication with tokens stored in sessionStorage
2. **CSRF Protection**: Cookie-based CSRF tokens for state-changing operations
3. **CORS Configuration**: Restricted to localhost:3000 for development
4. **Password Encryption**: BCrypt hashing for user passwords

### Authentication Flow:
1. User logs in → Backend generates JWT + CSRF token
2. Frontend stores JWT in sessionStorage
3. CSRF token automatically handled via Axios interceptors
4. Protected endpoints require both valid JWT and CSRF token

## Database Schema

- **Users**: Username, password (hashed), LeetCode account, solved task statistics
- **Stats**: Historical tracking of easy/medium/hard problems solved
- SQLite database (`mydb.db`) with auto-DDL enabled

## API Integration

- **LeetCode Client**: Fetches current problem-solving statistics via GraphQL
- **Payment Service**: Handles reward distribution based on progress differences
- **Stats Comparison**: Calculates points earned since last login

## Configuration

### Backend (`application.properties`):
- Server runs on port 6084 with `/api` context path
- Debug logging enabled for development
- Configurable point values and costs for different problem difficulties

### Frontend:
- API host configured via `REACT_APP_API_HOST` environment variable
- Automatic CSRF token handling in Axios configuration
- Session-based authentication state management