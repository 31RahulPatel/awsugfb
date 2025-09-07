# AWS Deployment Guide

## Architecture Overview
- **Frontend**: React app deployed on AWS Amplify or S3 + CloudFront
- **Backend**: Node.js API deployed on AWS Elastic Beanstalk or EC2
- **Database**: MongoDB Atlas (managed service)

## Deployment Steps

### 1. Database Setup (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create new cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string

### 2. Backend Deployment (Elastic Beanstalk)
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
cd backend
eb init aws-ug-feedback-api

# Create environment
eb create production

# Deploy
eb deploy
```

### 3. Frontend Deployment (AWS Amplify)
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
cd frontend
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### 4. Environment Variables
Set these in your deployment platform:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Strong secret key
- `ADMIN_EMAIL`: Admin login email
- `ADMIN_PASSWORD`: Admin login password

### 5. Domain Configuration
- Configure custom domain in Amplify Console
- Update CORS settings in backend for production domain

## Scaling Considerations
- Use Application Load Balancer for backend
- Enable Auto Scaling for EC2 instances
- Implement Redis for session management
- Use CloudWatch for monitoring