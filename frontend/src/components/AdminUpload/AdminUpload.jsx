import React, { useState } from 'react';
import { adminAPI } from '../../utils/api';
import './AdminUpload.css';

const AdminUpload = ({ onUploadSuccess }) => {
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

    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await adminAPI.uploadWhitelist(formData);
      setMessage(response.data.message);
      setFile(null);
      document.querySelector('input[type="file"]').value = '';
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-upload">
      <h3>Upload Attendee Whitelist</h3>
      
      <form onSubmit={handleUpload} className="upload-form">
        <div className="form-group">
          <label className="form-label">Select CSV or Excel file</label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="file-input"
          />
          {file && <p className="file-name">Selected: {file.name}</p>}
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading || !file}>
          {loading ? 'Uploading...' : 'Upload Whitelist'}
        </button>
      </form>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="upload-info">
        <h4>File Format Requirements:</h4>
        <p>CSV/Excel file should contain columns: <strong>email, name, phone</strong></p>
        <div className="format-example">
          <strong>Example:</strong><br/>
          email,name,phone<br/>
          john@example.com,John Doe,9876543210<br/>
          jane@example.com,Jane Smith,9876543211
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;