# AWS UG Vadodara Community Day - Feedback System

## MERN Stack Application

### Project Structure
```
FeedBack/
├── frontend/          # React application
├── backend/           # Node.js/Express API
└── README.md
```

### Tech Stack
- **Frontend:** React.js with AWS Console theme
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT + Whitelist verification
- **Deployment:** amplify, Backend (AWS Elastic Beanstalk)

### Features
- Admin panel for attendee management and session creation
- Attendee feedback system with one-per-session limitation
- CSV/Excel upload for whitelist management
- Scalable architecture for 10,000+ users
- AWS Console-inspired UI with Josefin Sans font

### Quick Start
1. Clone the repository
2. Setup backend: `cd backend && npm install && npm start`
3. Setup frontend: `cd frontend && npm install && npm start`
4. Configure MongoDB connection in backend/.env
