import React, { useState, useEffect } from 'react';
import { jobAPI, sessionAPI } from '../../utils/api';
import './ResumeUpload.css';

const ResumeUpload = ({ user, onLogout }) => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: '',
    experience: '',
    skills: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [checkingResume, setCheckingResume] = useState(true);
  const [eventSettings, setEventSettings] = useState(null);
  const [isEventStarted, setIsEventStarted] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    checkEventStatus();
    checkResumeStatus();
  }, []);

  const checkEventStatus = async () => {
    try {
      const eventRes = await sessionAPI.getEventSettings();
      setEventSettings(eventRes.data);
      const now = new Date();
      const eventStart = new Date(eventRes.data.eventStartDate);
      const started = now >= eventStart;
      setIsEventStarted(started);
      if (!started) {
        setShowEventModal(true);
      }
    } catch (error) {
      console.error('Failed to check event status');
    }
  };

  const checkResumeStatus = async () => {
    try {
      const response = await jobAPI.checkResumeStatus();
      setHasResume(response.data.hasResume);
      if (response.data.hasResume) {
        setMessage('You have already submitted your resume. Only one resume per user is allowed.');
      }
    } catch (error) {
      console.error('Failed to check resume status');
    } finally {
      setCheckingResume(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const uploadData = new FormData();
      uploadData.append('resume', file);
      uploadData.append('name', formData.name);
      uploadData.append('phone', formData.phone);
      uploadData.append('experience', formData.experience);
      uploadData.append('skills', formData.skills);
      
      await jobAPI.uploadResume(uploadData);
      setMessage('Resume submitted successfully!');
      setHasResume(true);
      setFile(null);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: '',
        experience: '',
        skills: ''
      });
      document.querySelector('input[type="file"]').value = '';
    } catch (error) {
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Failed to upload resume. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-upload-page">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-brand">
              <h1>Upload Resume</h1>
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
        {checkingResume ? (
          <div className="loading">Checking resume status...</div>
        ) : !isEventStarted ? (
          <div className="event-not-started">
            <h2>Event Not Started</h2>
            <p>Resume upload will be available once the event begins.</p>
            <button className="btn btn-primary" onClick={() => window.location.pathname = '/'}>
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="upload-form-container">
            <form onSubmit={handleSubmit} className="upload-form">
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={hasResume}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={hasResume}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={hasResume}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={hasResume}
                      required
                    >
                      <option value="">Select Experience</option>
                      <option value="0-1">0-1 years</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Key Skills</label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="e.g., AWS, React, Node.js, Python..."
                    rows="3"
                    disabled={hasResume}
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Resume Upload</h3>
                <div className="file-upload">
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="file-input"
                    disabled={hasResume}
                    required={!hasResume}
                  />
                  <label htmlFor="resume" className="file-label">
                    {hasResume ? 'Resume already submitted' : (file ? file.name : 'Choose Resume File (PDF, DOC, DOCX)')}
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary submit-btn" disabled={loading || hasResume}>
                {hasResume ? 'Resume Already Submitted' : (loading ? 'Uploading...' : 'Upload Resume')}
              </button>

              {message && (
                <div className={`message ${message.includes('success') || message.includes('submitted') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        )}
        
        {showEventModal && !isEventStarted && (
          <div className="feedback-modal">
            <div className="feedback-form-container">
              <div className="feedback-header">
                <h2>Event Not Started</h2>
                <button className="close-btn" onClick={() => setShowEventModal(false)}>×</button>
              </div>
              <div className="event-modal-content">
                <p>The event will begin on:</p>
                <h3>{eventSettings && new Date(eventSettings.eventStartDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</h3>
                <p>Resume upload will be available once the event starts!</p>
                <button className="btn btn-primary" onClick={() => window.location.pathname = '/'}>
                  Back to Dashboard
                </button>
              </div>
            </div>
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
    </div>
  );
};

export default ResumeUpload;
