import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import './AdminReports.css';

const AdminReports = () => {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [sessionFeedback, setSessionFeedback] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryFeedback, setCategoryFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, sessionsRes, categoryStatsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getSessions(),
        adminAPI.getCategoryStats()
      ]);
      setStats(statsRes.data);
      setSessions(sessionsRes.data);
      setCategoryStats(categoryStatsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSelect = async (sessionId) => {
    setSelectedSession(sessionId);
    if (sessionId) {
      try {
        const response = await adminAPI.getSessionFeedback(sessionId);
        setSessionFeedback(response.data);
      } catch (error) {
        console.error('Failed to load session feedback:', error);
      }
    } else {
      setSessionFeedback([]);
    }
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    if (category) {
      try {
        const response = await adminAPI.getFeedbackByCategory(category);
        setCategoryFeedback(response.data);
      } catch (error) {
        console.error('Failed to load category feedback:', error);
      }
    } else {
      setCategoryFeedback([]);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const response = await adminAPI.exportFeedback();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `feedback-export-${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const getAverageRating = (feedback) => {
    if (feedback.length === 0) return 0;
    const sum = feedback.reduce((acc, f) => acc + f.rating, 0);
    return (sum / feedback.length).toFixed(1);
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="admin-reports">
      <div className="reports-header">
        <h3>Feedback Reports</h3>
        <button 
          className="btn btn-primary"
          onClick={handleExport}
          disabled={exportLoading}
        >
          {exportLoading ? 'Exporting...' : 'Export All Feedback'}
        </button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h4>{stats.totalSessions}</h4>
            <p>Total Sessions</p>
          </div>
          <div className="stat-card">
            <h4>{stats.totalFeedback}</h4>
            <p>Total Feedback</p>
          </div>
          <div className="stat-card">
            <h4>{stats.totalAttendees}</h4>
            <p>Registered Attendees</p>
          </div>
        </div>
      )}

      <div className="category-feedback-section">
        <h3>Feedback by Category</h3>
        <div className="category-stats-grid">
          {categoryStats.map((cat) => (
            <div 
              key={cat.category} 
              className={`category-card ${selectedCategory === cat.category ? 'selected' : ''}`}
              onClick={() => handleCategorySelect(cat.category)}
            >
              <h4>{cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}</h4>
              <p><strong>{cat.count}</strong> responses</p>
              <p><strong>{cat.averageRating}</strong>/5 avg rating</p>
            </div>
          ))}
        </div>

        {categoryFeedback.length > 0 && (
          <div className="feedback-details">
            <div className="feedback-summary">
              <h4>{selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Feedback</h4>
              <p><strong>Total Responses:</strong> {categoryFeedback.length}</p>
              <p><strong>Average Rating:</strong> {getAverageRating(categoryFeedback)}/5</p>
            </div>

            <div className="feedback-list">
              {categoryFeedback.map((feedback, index) => (
                <div key={index} className="feedback-item">
                  <div className="feedback-header">
                    <span className="feedback-email">{feedback.userEmail}</span>
                    <span className="feedback-rating">
                      {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                    </span>
                  </div>
                  <p className="feedback-comment">{feedback.comment}</p>
                  <small className="feedback-date">
                    {new Date(feedback.createdAt).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="session-feedback-section">
        <div className="form-group">
          <label className="form-label">Select Session for Detailed Feedback</label>
          <select
            value={selectedSession}
            onChange={(e) => handleSessionSelect(e.target.value)}
            className="form-input"
          >
            <option value="">-- Select a session --</option>
            {sessions.map((session) => (
              <option key={session.sessionId} value={session.sessionId}>
                {session.title} - {session.speaker}
              </option>
            ))}
          </select>
        </div>

        {sessionFeedback.length > 0 && (
          <div className="feedback-details">
            <div className="feedback-summary">
              <h4>Session Feedback Summary</h4>
              <p><strong>Total Responses:</strong> {sessionFeedback.length}</p>
              <p><strong>Average Rating:</strong> {getAverageRating(sessionFeedback)}/5</p>
            </div>

            <div className="feedback-list">
              {sessionFeedback.map((feedback, index) => (
                <div key={index} className="feedback-item">
                  <div className="feedback-header">
                    <span className="feedback-email">{feedback.userEmail}</span>
                    <span className="feedback-rating">
                      {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                    </span>
                  </div>
                  <p className="feedback-comment">{feedback.comment}</p>
                  <small className="feedback-date">
                    {new Date(feedback.createdAt).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;