# AWS Amplify Deployment Guide

## Frontend Deployment (AWS Amplify)

### 1. Setup Amplify App
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure
```

### 2. Deploy Frontend
1. Go to AWS Amplify Console
2. Connect your GitHub repository
3. Select the main branch
4. Amplify will auto-detect the `amplify.yml` build settings
5. Add environment variable: `REACT_APP_API_URL` with your backend URL

### 3. Environment Variables
Set in Amplify Console > App Settings > Environment Variables:
- `REACT_APP_API_URL`: Your backend API URL

## Backend Deployment Options

### Option 1: AWS App Runner (Recommended)
1. Create App Runner service
2. Connect to your repository
3. Set source directory to `backend/`
4. Configure environment variables

### Option 2: AWS Elastic Beanstalk
1. Create EB application
2. Upload backend code as ZIP
3. Configure environment variables

### Option 3: AWS Lambda + API Gateway
1. Use Serverless Framework or SAM
2. Convert Express app to Lambda handlers

## Environment Variables for Backend
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
NODE_ENV=production
```

## Post-Deployment Steps
1. Update `REACT_APP_API_URL` in Amplify with actual backend URL
2. Configure CORS in backend to allow Amplify domain
3. Test all API endpoints
4. Setup MongoDB Atlas whitelist for backend IP