# AWS Role Setup for S3 Resume Upload System

## 🎯 Overview
This guide sets up IAM Role-based authentication for your Elastic Beanstalk backend to upload resumes to S3 securely without hardcoded credentials.

## 📋 Step-by-Step Setup

### Step 1: Create S3 Bucket

1. **Go to AWS S3 Console**
2. **Create Bucket**:
   - **Bucket name**: `awsug-vadodara-resumes`
   - **Region**: `us-east-1` (or your preferred region)
   - **Object Ownership**: ACLs disabled (recommended)
   - **Block Public Access**: Uncheck "Block all public access"
   - **Acknowledge** the warning about public access

3. **Configure Bucket Policy** (for public read access):
   - Go to bucket → Permissions → Bucket policy
   - Add this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::awsug-vadodara-resumes/*"
        }
    ]
}
```

### Step 2: Create IAM Policy

1. **Go to IAM Console → Policies**
2. **Create Policy** → JSON tab
3. **Policy Name**: `S3ResumeUploadPolicy`
4. **Policy Document**:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::awsug-vadodara-resumes/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::awsug-vadodara-resumes"
        }
    ]
}
```

5. **Add Description**: "Policy for uploading and managing resume files in S3"
6. **Create Policy**

### Step 3: Create IAM Role

1. **Go to IAM Console → Roles**
2. **Create Role**
3. **Trusted Entity Type**: AWS Service
4. **Service or Use Case**: **EC2** (NOT Elastic Beanstalk)
   - This is because ELB runs your app on EC2 instances
5. **Role Name**: `ELB-S3-Resume-Role`
6. **Attach Policy**: Select `S3ResumeUploadPolicy` (created in Step 2)
7. **Add Description**: "Role for ELB EC2 instances to upload resumes to S3"
8. **Create Role**

### Step 4: Create Instance Profile (if needed)

1. **In IAM Console → Roles**
2. **Find your role**: `ELB-S3-Resume-Role`
3. **Note the Instance Profile ARN** (should be created automatically)
4. If not created, go to **Instance Profiles** and create one with the same name

### Step 5: Configure Elastic Beanstalk

1. **Go to Elastic Beanstalk Console**
2. **Select your application environment**
3. **Configuration → Security**
4. **Edit Security Settings**:
   - **Service Role**: Keep existing (usually `aws-elasticbeanstalk-service-role`)
   - **EC2 Instance Profile**: Select `ELB-S3-Resume-Role`
5. **Apply Changes** (this will restart your environment)

### Step 6: Update Environment Variables

In your Elastic Beanstalk environment configuration:

1. **Configuration → Software**
2. **Environment Properties**:

```
AWS_REGION=us-east-1
S3_BUCKET_NAME=awsug-vadodara-resumes
NODE_ENV=production
```

**Note**: No AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY needed!

### Step 7: Deploy Updated Backend

1. **Package your backend** with the updated code
2. **Deploy to Elastic Beanstalk**
3. **Verify deployment** is successful

## 🧪 Testing the Setup

### Test 1: Health Check
```bash
curl https://api.rahulp.me/health
```
Should return: `{"status":"OK","timestamp":"..."}`

### Test 2: Resume Upload
1. **Login to your frontend** as an attendee
2. **Go to "Upload Resume"**
3. **Fill the form** and upload a PDF/DOC file
4. **Check S3 bucket** - you should see the file in `resumes/` folder
5. **Check admin panel** - resume should appear with S3 download link

### Test 3: Admin Export
1. **Login as admin**
2. **Go to resume management**
3. **Export CSV** - should include S3 download links

## 🔍 Troubleshooting

### Issue: "Access Denied" errors
**Solution**: 
- Verify the IAM role is attached to ELB instance profile
- Check S3 bucket policy allows the actions
- Ensure bucket name matches environment variable

### Issue: "Role not found"
**Solution**:
- Wait 5-10 minutes after creating role (AWS propagation)
- Verify instance profile exists
- Restart ELB environment

### Issue: Files not uploading
**Solution**:
- Check ELB logs for detailed error messages
- Verify S3 bucket exists and is in correct region
- Test with smaller file sizes first

## 📁 Final File Structure

### S3 Bucket Structure:
```
awsug-vadodara-resumes/
└── resumes/
    ├── uuid1.pdf
    ├── uuid2.docx
    └── uuid3.doc
```

### Environment Variables:
```
AWS_REGION=us-east-1
S3_BUCKET_NAME=awsug-vadodara-resumes
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=awsugvad@gmail.com
ADMIN_PASSWORD=AdminPass123!
```

## 🎉 Success Indicators

✅ **S3 bucket created** with public read access  
✅ **IAM role created** with S3 permissions  
✅ **ELB configured** with the IAM role  
✅ **Backend deployed** with updated code  
✅ **Resume upload works** and files appear in S3  
✅ **Admin panel shows** S3 download links  
✅ **CSV export includes** S3 URLs  

## 🔒 Security Benefits

- ✅ **No hardcoded credentials** in your code
- ✅ **Automatic credential rotation** by AWS
- ✅ **Least privilege access** - only S3 permissions needed
- ✅ **AWS manages security** for credential handling
- ✅ **Audit trail** through CloudTrail
- ✅ **Easy to revoke** access if needed

Your resume upload system is now production-ready with enterprise-grade security! 🚀