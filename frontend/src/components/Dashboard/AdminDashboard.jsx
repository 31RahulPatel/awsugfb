import React, { useState, useEffect } from 'react';
import { adminAPI, jobAPI } from '../../utils/api';

import AdminReports from '../AdminReports/AdminReports';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('event-settings');
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState('All');
  const [selectedSpeaker, setSelectedSpeaker] = useState('All');
  const [jobs, setJobs] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [resumes, setResumes] = useState([]);

  const [jobApplications, setJobApplications] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingAttendee, setEditingAttendee] = useState(null);
  const [showAttendeeForm, setShowAttendeeForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    experience: '',
    skills: '',
    description: ''
  });
  const [newSession, setNewSession] = useState({
    sessionId: '',
    title: '',
    speaker: '',
    time: '',
    room: '',
    track: ''
  });
  const [newAttendee, setNewAttendee] = useState({
    email: '',
    name: '',
    bookingId: ''
  });
  const [eventSettings, setEventSettings] = useState({
    eventStartDate: '',
    eventName: 'AWS UG Vadodara Community Day'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'sessions') {
      loadSessions();
    } else if (activeTab === 'jobs') {
      loadJobs();
      loadJobApplications();
      loadResumes();
    } else if (activeTab === 'attendees') {
      loadAttendees();
    } else if (activeTab === 'event-settings') {
      loadEventSettings();
    }
  }, [activeTab]);

  const loadSessions = async () => {
    try {
      const response = await adminAPI.getSessions();
      setSessions(response.data);
      setFilteredSessions(response.data);
    } catch (error) {
      setError('Failed to load sessions');
    }
  };

  const getFilteredSessions = () => {
    let filtered = sessions;
    
    if (selectedTrack !== 'All') {
      if (selectedTrack === 'General') {
        filtered = filtered.filter(s => !s.track || s.track === 'General' || s.track === '');
      } else {
        filtered = filtered.filter(s => s.track === selectedTrack);
      }
    }
    
    if (selectedSpeaker !== 'All') {
      filtered = filtered.filter(s => s.speaker === selectedSpeaker);
    }
    
    return filtered;
  };

  const getTracks = () => {
    const tracks = ['All', 'General'];
    const uniqueTracks = [...new Set(sessions.map(s => s.track).filter(t => t && t !== 'General'))];
    return [...tracks, ...uniqueTracks];
  };

  const getSpeakers = () => {
    const uniqueSpeakers = [...new Set(sessions.map(s => s.speaker).filter(s => s))];
    return uniqueSpeakers.sort();
  };

  const loadJobs = async () => {
    try {
      const response = await jobAPI.getJobs();
      setJobs(response.data);
    } catch (error) {
      setError('Failed to load jobs');
    }
  };



  const loadJobApplications = async () => {
    try {
      const response = await jobAPI.getApplications();
      setJobApplications(response.data);
    } catch (error) {
      setError('Failed to load job applications');
    }
  };

  const loadResumes = async () => {
    try {
      const response = await jobAPI.getResumes();
      setResumes(response.data);
    } catch (error) {
      setError('Failed to load resumes');
    }
  };

  const loadAttendees = async () => {
    try {
      const response = await adminAPI.getAttendees();
      setAttendees(response.data);
    } catch (error) {
      setError('Failed to load attendees');
    }
  };

  const handleAttendeeInputChange = (e) => {
    setNewAttendee({
      ...newAttendee,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateAttendee = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (editingAttendee) {
        await adminAPI.updateAttendee(editingAttendee._id, newAttendee);
        setMessage('Attendee updated successfully');
      } else {
        await adminAPI.createAttendee(newAttendee);
        setMessage('Attendee created successfully');
      }
      setNewAttendee({ email: '', name: '', bookingId: '' });
      setEditingAttendee(null);
      setShowAttendeeForm(false);
      loadAttendees();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save attendee');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAttendee = (attendee) => {
    setNewAttendee({
      email: attendee.email,
      name: attendee.name,
      bookingId: attendee.bookingId
    });
    setEditingAttendee(attendee);
    setShowAttendeeForm(true);
  };

  const handleDeleteAttendee = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendee?')) {
      try {
        await adminAPI.deleteAttendee(id);
        setMessage('Attendee deleted successfully');
        loadAttendees();
      } catch (error) {
        setError('Failed to delete attendee');
      }
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await adminAPI.uploadWhitelist(formData);
      setMessage(response.data.message);
      loadAttendees();
    } catch (error) {
      setError('Failed to upload CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await adminAPI.uploadSessions(formData);
      setMessage(response.data.message);
      loadSessions();
    } catch (error) {
      setError('Failed to upload sessions CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSession = (session) => {
    setNewSession({
      sessionId: session.sessionId,
      title: session.title,
      speaker: session.speaker,
      time: session.time,
      room: session.room,
      track: session.track
    });
    setEditingSession(session);
    setShowSessionForm(true);
  };

  const handleDeleteSession = async (id) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await adminAPI.deleteSession(id);
        setMessage('Session deleted successfully');
        loadSessions();
      } catch (error) {
        setError('Failed to delete session');
      }
    }
  };

  const handleInputChange = (e) => {
    setNewSession({
      ...newSession,
      [e.target.name]: e.target.value
    });
  };

  const handleJobInputChange = (e) => {
    setNewJob({
      ...newJob,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (editingSession) {
        await adminAPI.updateSession(editingSession._id, newSession);
        setMessage('Session updated successfully');
      } else {
        await adminAPI.createSession(newSession);
        setMessage('Session created successfully');
      }
      setNewSession({
        sessionId: '',
        title: '',
        speaker: '',
        time: '',
        room: '',
        track: ''
      });
      setEditingSession(null);
      setShowSessionForm(false);
      loadSessions();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save session');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await jobAPI.createJob(newJob);
      setMessage('Job created successfully');
      setNewJob({
        title: '',
        company: '',
        location: '',
        experience: '',
        skills: '',
        description: ''
      });
      loadJobs();
    } catch (error) {
      setError('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const handleJobCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await jobAPI.uploadJobsCSV(formData);
      setMessage(response.data.message);
      loadJobs();
    } catch (error) {
      setError('Failed to upload jobs CSV');
    } finally {
      setLoading(false);
    }
  };



  const exportJobs = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const csvContent = 'Title,Company,Location,Experience\n' +
      jobs.map(j => `"${j.title}","${j.company}","${j.location}","${j.experience}"`).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobs-export-${timestamp}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };



  const exportJobApplications = async () => {
    try {
      const response = await jobAPI.exportApplications();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `job-applications-${timestamp}.csv`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to export applications');
    }
  };

  const exportResumes = async () => {
    try {
      const response = await jobAPI.exportResumes();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `resumes-export-${timestamp}.csv`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to export resumes');
    }
  };

  const handleDeleteJobApplication = async (id) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        await jobAPI.deleteJobApplication(id);
        setMessage('Job application deleted successfully');
        loadJobApplications();
      } catch (error) {
        setError('Failed to delete job application');
      }
    }
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobAPI.deleteJob(id);
        setMessage('Job deleted successfully');
        loadJobs();
      } catch (error) {
        setError('Failed to delete job');
      }
    }
  };

  const loadEventSettings = async () => {
    try {
      const response = await adminAPI.getEventSettings();
      setEventSettings({
        eventStartDate: new Date(response.data.eventStartDate).toISOString().slice(0, 16),
        eventName: response.data.eventName
      });
    } catch (error) {
      setError('Failed to load event settings');
    }
  };

  const handleEventSettingsChange = (e) => {
    setEventSettings({
      ...eventSettings,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateEventSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await adminAPI.updateEventSettings({
        eventStartDate: new Date(eventSettings.eventStartDate).toISOString(),
        eventName: eventSettings.eventName
      });
      setMessage('Event settings updated successfully');
    } catch (error) {
      setError('Failed to update event settings');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'event-settings':
        return (
          <div className="event-settings-tab">
            <h3>Event Settings</h3>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleUpdateEventSettings} className="event-settings-form">
              <div className="form-group">
                <label className="form-label">Event Name</label>
                <input
                  type="text"
                  name="eventName"
                  value={eventSettings.eventName}
                  onChange={handleEventSettingsChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Event Start Date & Time</label>
                <input
                  type="datetime-local"
                  name="eventStartDate"
                  value={eventSettings.eventStartDate}
                  onChange={handleEventSettingsChange}
                  className="form-input"
                  required
                />
                <p className="form-help">Users will only be able to submit feedback after this date and time</p>
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Event Settings'}
              </button>
            </form>
          </div>
        );
      
      case 'sessions':
        return (
          <div className="sessions-tab">
            <div className="csv-upload-section">
              <h3>Upload Sessions via CSV</h3>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleSessionCSVUpload}
                className="file-input"
              />
              <p className="csv-format">CSV Format: sessionId, title, speaker, time, room, track</p>
            </div>

            <div className="create-session-section">
              <div className="section-header">
                <h3>Manage Sessions</h3>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowSessionForm(!showSessionForm);
                    setEditingSession(null);
                    setNewSession({ sessionId: '', title: '', speaker: '', time: '', room: '', track: '' });
                  }}
                >
                  {showSessionForm ? 'Cancel' : 'Add Session'}
                </button>
              </div>

              {showSessionForm && (
                <form onSubmit={handleCreateSession} className="session-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Session ID</label>
                      <input
                        type="text"
                        name="sessionId"
                        value={newSession.sessionId}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={newSession.title}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Speaker</label>
                      <input
                        type="text"
                        name="speaker"
                        value={newSession.speaker}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Time</label>
                      <input
                        type="text"
                        name="time"
                        value={newSession.time}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., 10:00 AM - 11:00 AM"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Room</label>
                      <input
                        type="text"
                        name="room"
                        value={newSession.room}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Track</label>
                      <input
                        type="text"
                        name="track"
                        value={newSession.track}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : (editingSession ? 'Update Session' : 'Create Session')}
                  </button>
                </form>
              )}
            </div>

            <div className="sessions-list">
              <h3>Event Sessions ({getFilteredSessions().length})</h3>
              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}
              
              {sessions.length > 0 && (
                <div className="session-filters">
                  <div className="filter-group">
                    <label className="filter-label">Filter by Track:</label>
                    <select
                      value={selectedTrack}
                      onChange={(e) => setSelectedTrack(e.target.value)}
                      className="filter-select"
                    >
                      <option value="All">All Tracks</option>
                      {getTracks().filter(track => track !== 'All').map(track => (
                        <option key={track} value={track}>{track}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Filter by Speaker:</label>
                    <select
                      value={selectedSpeaker}
                      onChange={(e) => setSelectedSpeaker(e.target.value)}
                      className="filter-select"
                    >
                      <option value="All">All Speakers</option>
                      {getSpeakers().map(speaker => (
                        <option key={speaker} value={speaker}>{speaker}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              {sessions.length === 0 ? (
                <p>No sessions created yet</p>
              ) : getFilteredSessions().length === 0 ? (
                <p>No sessions match the selected filters</p>
              ) : (
                <div className="data-table">
                  <div className="table-header">
                    <div>Session ID</div>
                    <div>Title</div>
                    <div>Speaker</div>
                    <div>Time</div>
                    <div>Room</div>
                    <div>Track</div>
                    <div>Actions</div>
                  </div>
                  {getFilteredSessions().map((session) => (
                    <div key={session._id} className="table-row">
                      <div>{session.sessionId}</div>
                      <div>{session.title}</div>
                      <div>{session.speaker}</div>
                      <div>{session.time}</div>
                      <div>{session.room}</div>
                      <div>{session.track}</div>
                      <div className="actions">
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEditSession(session)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteSession(session._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'jobs':
        return (
          <div className="jobs-tab">
            <div className="create-job-form">
              <h3>Create New Job</h3>
              <form onSubmit={handleCreateJob}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input
                      type="text"
                      name="title"
                      value={newJob.title}
                      onChange={handleJobInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={newJob.company}
                      onChange={handleJobInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={newJob.location}
                      onChange={handleJobInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience Required</label>
                    <input
                      type="text"
                      name="experience"
                      value={newJob.experience}
                      onChange={handleJobInputChange}
                      className="form-input"
                      placeholder="e.g., 2-4 years"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Required Skills</label>
                  <input
                    type="text"
                    name="skills"
                    value={newJob.skills}
                    onChange={handleJobInputChange}
                    className="form-input"
                    placeholder="e.g., AWS, React, Node.js"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Job Description</label>
                  <textarea
                    name="description"
                    value={newJob.description}
                    onChange={handleJobInputChange}
                    className="form-textarea"
                    rows="3"
                    required
                  />
                </div>
                
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Job'}
                </button>
              </form>
            </div>

            <div className="csv-upload-section">
              <h3>Upload Jobs via CSV</h3>
              <input
                type="file"
                accept=".csv"
                onChange={handleJobCSVUpload}
                className="file-input"
              />
              <p className="csv-format">CSV Format: title,company,location,experience,skills,description</p>
            </div>

            <div className="jobs-list">
              <div className="list-header">
                <h3>Posted Jobs ({jobs.length})</h3>
                <button 
                  className="btn btn-secondary" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    exportJobs();
                  }}
                  type="button"
                >
                  Download CSV
                </button>
              </div>
              {jobs.length === 0 ? (
                <p>No jobs posted yet</p>
              ) : (
                <div className="data-table">
                  <div className="table-header jobs-header">
                    <div>Title</div>
                    <div>Company</div>
                    <div>Location</div>
                    <div>Experience</div>
                    <div>Actions</div>
                  </div>
                  {jobs.map((job) => (
                    <div key={job._id} className="table-row jobs-row">
                      <div>{job.title}</div>
                      <div>{job.company}</div>
                      <div>{job.location}</div>
                      <div>{job.experience}</div>
                      <div className="actions">
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteJob(job._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>



            <div className="applications-list">
              <div className="list-header">
                <h3>Job Applications ({jobApplications.length})</h3>
                <div className="header-actions">
                  <button 
                    className="btn btn-secondary" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      exportJobApplications();
                    }}
                    type="button"
                  >
                    Download CSV
                  </button>
                </div>
              </div>
              {jobApplications.length === 0 ? (
                <p>No job applications received yet</p>
              ) : (
                <div className="data-table">
                  <div className="table-header applications-header">
                    <div>Name</div>
                    <div>Job</div>
                    <div>Email</div>
                    <div>Phone</div>
                    <div>Applied</div>
                    <div>Resume</div>
                    <div>Actions</div>
                  </div>
                  {jobApplications.map((application) => (
                    <div key={application._id} className="table-row applications-row">
                      <div>{application.name}</div>
                      <div>{application.jobTitle} at {application.company}</div>
                      <div>{application.userEmail}</div>
                      <div>{application.phone}</div>
                      <div>{new Date(application.createdAt).toLocaleDateString()}</div>
                      <div>
                        {application.resumeS3Url ? (
                          <a 
                            href={application.resumeS3Url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary"
                          >
                            View Resume
                          </a>
                        ) : (
                          <span className="text-muted">No resume</span>
                        )}
                      </div>
                      <div className="actions">
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteJobApplication(application._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="resumes-list">
              <div className="list-header">
                <h3>Uploaded Resumes ({resumes.length})</h3>
                <button 
                  className="btn btn-secondary" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    exportResumes();
                  }}
                  type="button"
                >
                  Download CSV
                </button>
              </div>
              {resumes.length === 0 ? (
                <p>No resumes uploaded yet</p>
              ) : (
                <div className="data-grid">
                  {resumes.map((resume) => (
                    <div key={resume._id} className="data-item">
                      <h4>{resume.name}</h4>
                      <p><strong>Email:</strong> {resume.userEmail}</p>
                      <p><strong>Phone:</strong> {resume.phone}</p>
                      <p><strong>Experience:</strong> {resume.experience}</p>
                      <p><strong>Skills:</strong> {resume.skills}</p>
                      <p><strong>Uploaded:</strong> {new Date(resume.createdAt).toLocaleDateString()}</p>
                      <div className="resume-actions">
                        <a 
                          href={resume.s3Url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-primary"
                        >
                          Download Resume
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'attendees':
        return (
          <div className="attendees-tab">
            <div className="csv-upload-section">
              <h3>Upload Attendees via CSV</h3>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleCSVUpload}
                className="file-input"
              />
              <p className="csv-format">CSV Format: email, name, bookingId</p>
            </div>

            <div className="create-attendee-section">
              <div className="section-header">
                <h3>Manage Attendees</h3>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowAttendeeForm(!showAttendeeForm);
                    setEditingAttendee(null);
                    setNewAttendee({ email: '', name: '', bookingId: '' });
                  }}
                >
                  {showAttendeeForm ? 'Cancel' : 'Add Attendee'}
                </button>
              </div>

              {showAttendeeForm && (
                <form onSubmit={handleCreateAttendee} className="attendee-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={newAttendee.email}
                        onChange={handleAttendeeInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newAttendee.name}
                        onChange={handleAttendeeInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Booking ID</label>
                      <input
                        type="text"
                        name="bookingId"
                        value={newAttendee.bookingId}
                        onChange={handleAttendeeInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : (editingAttendee ? 'Update Attendee' : 'Create Attendee')}
                  </button>
                </form>
              )}
            </div>

            <div className="attendees-list">
              <h3>Registered Attendees ({attendees.length})</h3>
              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}
              {attendees.length === 0 ? (
                <p>No attendees registered yet</p>
              ) : (
                <div className="data-table">
                  <div className="table-header">
                    <div>Email</div>
                    <div>Name</div>
                    <div>Booking ID</div>
                    <div>Actions</div>
                  </div>
                  {attendees.map((attendee) => (
                    <div key={attendee._id} className="table-row">
                      <div>{attendee.email}</div>
                      <div>{attendee.name}</div>
                      <div>{attendee.bookingId}</div>
                      <div className="actions">
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEditAttendee(attendee)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteAttendee(attendee._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'reports':
        return <AdminReports />;
      
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-brand">
              <h1>AWS UG Vadodara<br />Admin Panel</h1>
              <p className="subtitle">Community Day Management</p>
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
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'event-settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('event-settings')}
          >
            Event Settings
          </button>
          <button
            className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            Sessions
          </button>
          <button
            className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Jobs
          </button>
          <button
            className={`tab-btn ${activeTab === 'attendees' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendees')}
          >
            Attendees
          </button>
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
        </div>

        <div className="tab-content">
          {renderTabContent()}
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
    </div>
  );
};

export default AdminDashboard;