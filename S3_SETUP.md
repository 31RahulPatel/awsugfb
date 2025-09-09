# S3 Resume Upload Setup Guide

## 1. Create S3 Bucket

1. **Go to AWS S3 Console**
2. **Create a new bucket**:
   - Bucket name: `awsug-vadodara-resumes` (or your preferred name)
   - Region: `us-east-1` (or your preferred region)
   - Keep default settings for now

## 2. Configure Bucket Permissions

### Public Access Settings:
- **Uncheck** "Block all public access" (we need public read access for resume downloads)
- Acknowledge the warning

### Bucket Policy:
Add this policy to allow public read access to resume files:

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

## 3. AWS Authentication Setup

### Option A: IAM User (Simpler Setup)

1. **Go to IAM Console → Users**
2. **Create new user**: `awsug-backend-user`
3. **Attach policy**: Create custom policy named `S3ResumeUploadPolicy`:

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
        }
    ]
}
```

4. **Generate Access Keys** and save them securely
5. **Add to .env file**:
```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xyz123...
```

### Option B: IAM Role (More Secure - Recommended for Production)

1. **Go to IAM Console → Roles**
2. **Create new role**: `ELB-S3-Resume-Role`
3. **Trusted entity**: AWS Service → Elastic Beanstalk
4. **Attach the same policy** as above
5. **In Elastic Beanstalk Console**:
   - Go to Configuration → Security
   - Set "Service role" to `ELB-S3-Resume-Role`
6. **Remove AWS keys from .env** (role provides automatic credentials)

## 4. Environment Variables

### For IAM User (Option A):
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET_NAME=awsug-vadodara-resumes
```

### For IAM Role (Option B):
```env
AWS_REGION=us-east-1
S3_BUCKET_NAME=awsug-vadodara-resumes
# No AWS keys needed - role provides automatic credentials
```

## 5. Install Dependencies

```bash
cd backend
npm install @aws-sdk/client-s3 multer-s3 uuid
```

## 6. Test Upload

After deployment, test by:
1. Login as attendee
2. Go to "Upload Resume"
3. Fill form and upload a PDF/DOC file
4. Check S3 bucket for the uploaded file
5. Check admin panel for the resume with S3 link

## 7. Admin Features

- **View Resumes**: See all uploaded resumes with S3 links
- **Download**: Click links to download directly from S3
- **Export CSV**: Get all resume data + S3 links in CSV format

## File Structure in S3:
```
awsug-vadodara-resumes/
└── resumes/
    ├── uuid1.pdf
    ├── uuid2.docx
    └── uuid3.doc
```

## Security Notes:
- Files are stored with UUID names for security
- Original filenames are preserved in database
- Public read access allows direct downloads
- Upload is restricted to authenticated users only