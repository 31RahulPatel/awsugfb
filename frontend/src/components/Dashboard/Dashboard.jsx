import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionAPI, feedbackAPI } from '../../utils/api';
import SessionCard from '../SessionCard/SessionCard';
import FeedbackForm from '../FeedbackForm/FeedbackForm';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsRes, feedbackRes, categoriesRes] = await Promise.all([
        sessionAPI.getSessions(),
        feedbackAPI.getMyFeedback(),
        feedbackAPI.getCategories()
      ]);
      setSessions(sessionsRes.data);
      setMyFeedback(feedbackRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFeedbackClick = (category) => {
    if (category.id === 'session') {
      navigate('/sessions');
    } else {
      setSelectedCategory(category);
      setSelectedSession(null);
    }
  };

  const handleFeedbackSubmit = () => {
    loadData();
  };

  const hasCategoryFeedback = (categoryId) => {
    return myFeedback && myFeedback.length > 0 && myFeedback.some(f => f.category === categoryId);
  };

  if (loading) {
    return <div className="loading">Loading sessions...</div>;
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-brand">
              <h1>AWS UG Vadodara<br className="mobile-break" />Community Day</h1>
              <p className="subtitle">Welcome, {user.name || user.email}</p>
            </div>
            <div className="header-right">
              <div className={`header-actions ${menuOpen ? 'open' : ''}`}>
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
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>{sessions.length}</h3>
            <p>Total Sessions</p>
          </div>
          <div className="stat-card">
            <h3>{myFeedback.filter(f => f.category === 'session').length}</h3>
            <p>Session Feedback</p>
          </div>
          <div className="stat-card">
            <h3>{myFeedback.filter(f => f.category !== 'session').length}</h3>
            <p>Other Feedback</p>
          </div>
        </div>

        <div className="feedback-categories">
          <h2>Event Feedback</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                {category.id === 'session' ? (
                  <div>
                    <span className="session-count">{myFeedback.filter(f => f.category === 'session').length}/{sessions.length} Sessions Rated</span>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleCategoryFeedbackClick(category)}
                    >
                      View Sessions
                    </button>
                  </div>
                ) : loading ? (
                  <span>Loading...</span>
                ) : hasCategoryFeedback(category.id) ? (
                  <span className="feedback-submitted">✓ Feedback Submitted</span>
                ) : (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleCategoryFeedbackClick(category)}
                  >
                    Give Feedback
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="job-portal">
          <h2>Job Portal</h2>
          <div className="job-cards">
            <div className="job-card">
              <h3>Upload Resume</h3>
              <p>Share your resume with AWS community partners and potential employers</p>
              <button className="btn btn-primary" onClick={() => navigate('/resume-upload')}>
                Upload Resume
              </button>
            </div>
            <div className="job-card">
              <h3>Apply for Jobs</h3>
              <p>Browse and apply for exciting opportunities from our community partners</p>
              <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
                View Jobs
              </button>
            </div>
          </div>
        </div>

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

      {selectedCategory && (
        <FeedbackForm
          category={selectedCategory.id}
          categoryName={selectedCategory.name}
          onClose={() => setSelectedCategory(null)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};

export default Dashboard;