import React from 'react';
import './SessionCard.css';

const SessionCard = ({ session, onFeedbackClick, hasFeedback }) => {
  return (
    <div className="session-card">
      <div className="session-header">
        <h3 className="session-title">{session.title}</h3>
        <span className="session-track">{session.track}</span>
      </div>
      
      <div className="session-details">
        <div className="session-info">
          <span className="session-label">Speaker:</span>
          <span className="session-value">{session.speaker}</span>
        </div>
        
        <div className="session-info">
          <span className="session-label">Time:</span>
          <span className="session-value">{session.time}</span>
        </div>
        
        <div className="session-info">
          <span className="session-label">Room:</span>
          <span className="session-value">{session.room}</span>
        </div>
      </div>
      
      <div className="session-actions">
        {hasFeedback ? (
          <span className="feedback-submitted">✓ Feedback Submitted</span>
        ) : (
          <button 
            className="btn btn-primary"
            onClick={() => onFeedbackClick(session)}
          >
            Give Feedback
          </button>
        )}
      </div>
    </div>
  );
};

export default SessionCard;