import React, { useState, useEffect } from 'react';
import { sessionAPI, feedbackAPI } from '../../utils/api';
import SessionCard from '../SessionCard/SessionCard';
import FeedbackForm from '../FeedbackForm/FeedbackForm';
import './Sessions.css';

const Sessions = ({ user, onLogout }) => {
  const [sessions, setSessions] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsRes, feedbackRes] = await Promise.all([
        sessionAPI.getSessions(),
        feedbackAPI.getMyFeedback()
      ]);
      setSessions(sessionsRes.data);
      setMyFeedback(feedbackRes.data);
    } catch (error) {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackClick = (session) => {
    setSelectedSession(session);
  };

  const handleFeedbackSubmit = () => {
    loadData();
  };

  const hasFeedback = (sessionId) => {
    return myFeedback.some(f => f.category === 'session' && f.sessionId === sessionId);
  };

  const getFilteredSessions = () => {
    if (selectedTrack === 'All') return sessions;
    if (selectedTrack === 'General') {
      return sessions.filter(s => !s.track || s.track === 'General' || s.track === '');
    }
    return sessions.filter(s => s.track === selectedTrack);
  };

  const getTracks = () => {
    const tracks = ['All', 'General'];
    const uniqueTracks = [...new Set(sessions.map(s => s.track).filter(t => t && t !== 'General'))];
    return [...tracks, ...uniqueTracks];
  };

  if (loading) {
    return <div className="loading">Loading sessions...</div>;
  }

  return (
    <div className="sessions-page">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-brand">
              <h1>Sessions</h1>
              <p className="subtitle">AWS UG Vadodara Community Day</p>
            </div>
            <div className="header-right">
              <div className={`header-actions ${menuOpen ? 'open' : ''}`}>
                <button className="btn btn-secondary" onClick={() => window.location.pathname = '/'}>
                  Back to Dashboard
                </button>
                <button className="btn btn-secondary" onClick={onLogout}>
                  Logout
                </button>
              </div>
              <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
            </div>
          </div>
      </header>

      <main className="container">
        {error && <div className="error-message">{error}</div>}
        
        <div className="sessions-stats">
          <div className="stat-card">
            <h3>{sessions.length}</h3>
            <p>Total Sessions</p>
          </div>
          <div className="stat-card">
            <h3>{myFeedback.filter(f => f.category === 'session').length}</h3>
            <p>Feedback Given</p>
          </div>
        </div>

        <div className="track-filter-sticky">
          <div className="track-buttons">
            {getTracks().map(track => (
              <button
                key={track}
                className={`track-btn ${selectedTrack === track ? 'active' : ''}`}
                onClick={() => setSelectedTrack(track)}
              >
                {track}
              </button>
            ))}
          </div>
        </div>
        
        {getFilteredSessions().length === 0 ? (
          <p>No sessions available for {selectedTrack}</p>
        ) : (
          <div className="sessions-grid">
            {getFilteredSessions().map((session) => (
              <SessionCard
                key={session.sessionId}
                session={session}
                onFeedbackClick={handleFeedbackClick}
                hasFeedback={hasFeedback(session.sessionId)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>AWS User Group Vadodara</h4>
              <div className="footer-links">
                <a href="https://www.linkedin.com/company/awsugbdq/posts/?feedView=all" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a href="https://communityday.awsugvad.in" target="_blank" rel="noopener noreferrer">Official Website</a>
              </div>
            </div>
            <div className="footer-section">
              <p>Thank you for being part of our community!</p>
              <p>Made for AWS UG Community</p>
              <p>© 2025 AWS User Group Vadodara</p>
            </div>
          </div>
        </div>
      </footer>

      {selectedSession && (
        <FeedbackForm
          session={selectedSession}
          category="session"
          onClose={() => setSelectedSession(null)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};

export default Sessions;