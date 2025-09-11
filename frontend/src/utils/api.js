import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.pathname = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
};

export const sessionAPI = {
  getSessions: () => api.get('/sessions'),
  getSession: (sessionId) => api.get(`/sessions/${sessionId}`),
  getEventSettings: () => api.get('/sessions/event/settings'),
};

export const feedbackAPI = {
  submitFeedback: (feedback) => api.post('/feedback', feedback),
  getMyFeedback: () => api.get('/feedback/my-feedback'),
  getCategories: () => api.get('/feedback/categories'),
};

export const jobAPI = {
  getJobs: () => api.get('/jobs'),
  createJob: (job) => api.post('/jobs', job),
  checkResumeStatus: () => api.get('/jobs/resumes/check'),
  uploadResume: (formData) => api.post('/jobs/resumes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  applyForJob: (formData) => api.post('/jobs/apply', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  downloadResumeAdmin: (filename) => api.get(`/jobs/admin/download/${filename}`, { responseType: 'blob' }),
  downloadApplicationResumeAdmin: (applicationId) => api.get(`/jobs/admin/download/application/${applicationId}`, { responseType: 'blob' }),
  getResumes: () => api.get('/jobs/admin/resumes'),
  getApplications: () => api.get('/jobs/admin/applications'),
  exportApplications: () => api.get('/jobs/admin/export/applications', { responseType: 'blob' }),
  exportResumes: () => api.get('/jobs/admin/export/resumes', { responseType: 'blob' }),
  uploadJobsCSV: (formData) => api.post('/jobs/upload-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  deleteJobApplication: (id) => api.delete(`/jobs/applications/${id}`),
};

export const adminAPI = {
  uploadWhitelist: (formData) => api.post('/admin/uploadWhitelist', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadSessions: (formData) => api.post('/admin/uploadSessions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  createSession: (session) => api.post('/admin/createSession', session),
  getSessions: () => api.get('/admin/sessions'),
  getSessionFeedback: (sessionId) => api.get(`/admin/feedback/${sessionId}`),
  exportFeedback: () => api.get('/admin/exportFeedback', { responseType: 'blob' }),
  getStats: () => api.get('/admin/stats'),
  getAttendees: () => api.get('/admin/attendees'),
  createAttendee: (attendee) => api.post('/admin/attendees', attendee),
  updateAttendee: (id, attendee) => api.put(`/admin/attendees/${id}`, attendee),
  deleteAttendee: (id) => api.delete(`/admin/attendees/${id}`),
  updateSession: (id, session) => api.put(`/admin/sessions/${id}`, session),
  deleteSession: (id) => api.delete(`/admin/sessions/${id}`),
  getFeedbackByCategory: (category) => api.get(`/admin/feedback/category/${category}`),
  getCategoryStats: () => api.get('/admin/feedback/categories/stats'),
  getEventSettings: () => api.get('/admin/event-settings'),
  updateEventSettings: (settings) => api.put('/admin/event-settings', settings),
};

export default api;
