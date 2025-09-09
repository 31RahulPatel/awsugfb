const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');

// Configure S3 client
const s3ClientConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
};

// Only add credentials if they exist (for IAM User)
// If running on AWS with IAM Role, credentials are automatic
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3ClientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const s3Client = new S3Client(s3ClientConfig);

// File filter function (shared between both upload configs)
const resumeFileFilter = (req, file, cb) => {
  // Allow only PDF, DOC, DOCX files
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const fileExtension = '.' + file.originalname.split('.').pop().toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
  }
};

// Configure multer for S3 upload (standalone resumes)
const uploadToS3 = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME,
    key: function (req, file, cb) {
      // Generate unique filename with original extension
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `resumes/${uuidv4()}.${fileExtension}`;
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedBy: req.user?.email || 'unknown',
        uploadDate: new Date().toISOString(),
        uploadType: 'standalone-resume'
      });
    }
  }),
  fileFilter: resumeFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Configure multer for S3 upload (job application resumes)
const uploadJobResumeToS3 = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME,
    key: function (req, file, cb) {
      // Generate unique filename with original extension
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `jobresume/${uuidv4()}.${fileExtension}`;
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedBy: req.user?.email || 'unknown',
        uploadDate: new Date().toISOString(),
        uploadType: 'job-application',
        jobId: req.body?.jobId || 'unknown',
        jobTitle: req.body?.jobTitle || 'unknown'
      });
    }
  }),
  fileFilter: resumeFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

module.exports = {
  s3Client,
  uploadToS3,
  uploadJobResumeToS3
};