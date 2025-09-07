import React, { useState } from 'react';
import { adminAPI } from '../../utils/api';
import './SessionUpload.css';

const SessionUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
    setError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    console.log('Starting upload for file:', file.name, 'Type:', file.type);
    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Sending upload request...');
      const response = await adminAPI.uploadSessions(formData);
      console.log('Upload successful:', response.data);
      setMessage(response.data.message);
      setFile(null);
      document.getElementById('session-file-input').value = '';
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="session-upload">
      <h3>Upload Sessions</h3>
      
      <form onSubmit={handleUpload} className="upload-form">
        <div className="form-group">
          <label htmlFor="session-file-input" className="form-label">Select CSV or Excel file</label>
          <input
            id="session-file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="file-input"
            style={{ marginBottom: '15px' }}
          />
          <p className="file-info">Supported formats: CSV (.csv), Excel (.xlsx, .xls)</p>
          {file && <p className="file-name">Selected: {file.name}</p>}
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button 
            type="submit" 
            className="btn btn-success" 
            disabled={loading || !file}
            style={{ 
              padding: '15px 30px', 
              fontSize: '18px', 
              backgroundColor: file ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: file ? 'pointer' : 'not-allowed',
              fontWeight: 'bold'
            }}
          >
            {loading ? '🔄 Uploading...' : file ? '🚀 Upload Sessions Now' : 'Select File First'}
          </button>
        </div>
      </form>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="upload-info">
        <h4>File Format Requirements:</h4>
        <p>CSV/Excel file should contain columns: <strong>sessionId, title, speakers, time, room, track</strong></p>
        <div className="format-example">
          <strong>Example:</strong><br/>
          sessionId,title,speakers,time,room,track<br/>
          ACD101,AWS Basics,John Doe,10:00 AM,Hall A,Beginner<br/>
          ACD102,Serverless,Jane Smith,11:00 AM,Hall B,Advanced
        </div>
      </div>
    </div>
  );
};

export default SessionUpload;