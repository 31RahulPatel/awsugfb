# AWS UG Vadodara Community Day - Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone and Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
npm run dev
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm start
```

### 3. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Credentials
- **Admin Login**: admin@awsugvadodara.com / AdminPass123!
- **Attendee Login**: Use any email from uploaded whitelist (no password)

## Sample Data
Use files in `sample-data/` folder:
- `attendees-whitelist.csv`: Sample attendee list
- `sessions.csv`: Sample session data

## Features Implemented
✅ JWT Authentication with whitelist verification  
✅ Admin panel for attendee and session management  
✅ Attendee dashboard with session cards  
✅ One feedback per session limitation  
✅ CSV/Excel upload for attendee whitelist  
✅ Feedback export functionality  
✅ AWS Console-inspired UI with Josefin Sans font  
✅ Scalable MongoDB schema with indexes  
✅ Rate limiting and security measures  
✅ Docker deployment configuration  

## API Endpoints
- `POST /api/auth/login` - Login
- `GET /api/sessions` - Get all sessions
- `POST /api/feedback` - Submit feedback
- `POST /api/admin/uploadWhitelist` - Upload attendee list
- `POST /api/admin/createSession` - Create session
- `GET /api/admin/exportFeedback` - Export feedback

## Database Schema
- **users**: User accounts
- **sessions**: Event sessions
- **feedback**: Session feedback (with compound unique index)
- **whitelist**: Approved attendee emails

## Deployment
See `deployment/aws-deployment.md` for AWS deployment instructions.