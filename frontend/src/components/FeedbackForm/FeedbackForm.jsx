import React, { useState } from 'react';
import { feedbackAPI } from '../../utils/api';
import './FeedbackForm.css';

const FeedbackForm = ({ session, category, categoryName, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const feedbackData = {
        category,
        ...formData
      };
      
      if (session) {
        feedbackData.sessionId = session.sessionId;
      }
      
      await feedbackAPI.submitFeedback(feedbackData);
      onSubmit();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-modal">
      <div className="feedback-form-container">
        <div className="feedback-header">
          <h2>Feedback for: {session ? session.title : categoryName}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="form-group">
            <label className="form-label">Rating (1-5 stars)</label>
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${formData.rating >= star ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, rating: star })}
                >
                  ★
                </button>
              ))}
              <span className="rating-text">({formData.rating}/5)</span>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Comments</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              className="form-input feedback-textarea"
              rows="4"
              placeholder="Share your thoughts about this session..."
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;