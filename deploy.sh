#!/bin/bash

echo "🚀 AWS Amplify Deployment Script"
echo "================================"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first."
    exit 1
fi

# Check if Amplify CLI is installed
if ! command -v amplify &> /dev/null; then
    echo "❌ Amplify CLI not found. Installing..."
    npm install -g @aws-amplify/cli
fi

echo "📦 Installing frontend dependencies..."
cd frontend && npm install

echo "🔧 Building frontend..."
npm run build

echo "✅ Frontend build complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify/"
echo "2. Click 'New app' > 'Host web app'"
echo "3. Connect your GitHub repository"
echo "4. Select this repository and main branch"
echo "5. Amplify will detect the amplify.yml configuration"
echo "6. Add environment variable REACT_APP_API_URL with your backend URL"
echo "7. Deploy!"
echo ""
echo "🔗 For backend deployment, see deployment-guide.md"