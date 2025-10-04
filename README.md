# LeetCode Motivation

LeetCode Motivation is a full-stack web application that tracks LeetCode progress and provides rewards for solved problems. The system includes a Spring Boot backend and a React frontend.

---
#### Key Features
- Authentication flow (login/signup/logout)
- Stats dashboard showing LeetCode progress
- Point redemption interface

## Project Structure

### Backend (Java Spring Boot)
- **Location**: `/backend`
- **Framework**: Spring Boot 3.3.1 with Java 21
- **Database**: SQLite (development) / AWS Aurora MySQL (production)
- **API**: REST endpoints served at `/api` (port 6084)
- **Security**: JWT authentication, CSRF protection, CORS configuration

---

### Frontend (React)
- **Location**: `/web-ui`
- **Framework**: React 18 with React Router
- **Styling**: CSS modules
- **HTTP Client**: Axios with JWT and CSRF token handling
- **State Management**: Local component state

