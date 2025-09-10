import React, { useState, useEffect } from 'react';
import { jobAPI, sessionAPI } from '../../utils/api';
import './JobPortal.css';

const JobPortal = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventSettings, setEventSettings] = useState(null);
  const [isEventStarted, setIsEventStarted] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    checkEventStatus();
    loadJobs();
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

  const loadJobs = async () => {
    try {
      const response = await jobAPI.getJobs();
      setJobs(response.data.map(job => ({
        ...job,
        skills: job.skills ? job.skills.split(',').map(s => s.trim()) : []
      })));
    } catch (error) {
      console.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (job) => {
    if (!isEventStarted) {
      setShowEventModal(true);
      return;
    }
    setSelectedJob(job);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      alert('Please upload your resume');
      return;
    }
    
    try {
      const formData = new FormData(e.target);
      formData.append('jobId', selectedJob._id);
      formData.append('jobTitle', selectedJob.title);
      formData.append('company', selectedJob.company);
      formData.append('resume', resumeFile);
      
      await jobAPI.applyForJob(formData);
      alert('Applied successfully!');
      setSelectedJob(null);
      setResumeFile(null);
      e.target.reset();
    } catch (error) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to submit application. Please try again.');
      }
    }
  };

  const handleResumeChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  return (
    <div className="job-portal-page">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-brand">
              <h1>Job Portal</h1>
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
        <div className="jobs-header">
          <h2>Available Opportunities</h2>
          <p>Explore exciting career opportunities from our community partners</p>
        </div>

        {loading ? (
          <div className="loading">Loading jobs...</div>
        ) : !isEventStarted ? (
          <div className="event-not-started">
            <h2>Event Not Started</h2>
            <p>Job applications will be available once the event begins.</p>
            <button className="btn btn-primary" onClick={() => window.location.pathname = '/'}>
              Back to Dashboard
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="no-jobs">
            <p>No job opportunities available at the moment.</p>
            <p>Please check back later or contact the admin.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="job-header">
                <h3>{job.title}</h3>
                <span className="company">{job.company}</span>
              </div>
              <div className="job-details">
                <div className="job-info">
                  <span className="label">Location:</span>
                  <span className="value">{job.location}</span>
                </div>
                <div className="job-info">
                  <span className="label">Experience:</span>
                  <span className="value">{job.experience}</span>
                </div>
                <div className="job-skills">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
                <p className="job-description">{job.description}</p>
              </div>
              <button className="btn btn-primary" onClick={() => handleApply(job)}>
                Apply Now
              </button>
            </div>
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

      {selectedJob && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Apply for {selectedJob.title}</h3>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmitApplication} className="application-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" className="form-input" defaultValue={user.name || ''} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-input" defaultValue={user.email || ''} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phone" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Upload Resume</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="file-input"
                    required
                  />
                  <label htmlFor="resume-upload" className="file-label">
                    {resumeFile ? resumeFile.name : 'Choose Resume File (PDF, DOC, DOCX)'}
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Cover Letter</label>
                <textarea name="coverLetter" className="form-textarea" rows="4" placeholder="Why are you interested in this position?" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
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
              <p>Job applications will be available once the event starts!</p>
              <button className="btn btn-primary" onClick={() => window.location.pathname = '/'}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPortal;
