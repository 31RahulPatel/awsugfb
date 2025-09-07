import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import Sessions from './components/Sessions/Sessions';
import ResumeUpload from './components/ResumeUpload/ResumeUpload';
import JobPortal from './components/JobPortal/JobPortal';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={
              user ? (
                user.role === 'admin' ? 
                  <AdminDashboard user={user} onLogout={handleLogout} /> : 
                  <Dashboard user={user} onLogout={handleLogout} onNavigateToSessions={() => setCurrentPage('sessions')} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/sessions" 
            element={
              user && user.role !== 'admin' ? (
                <Sessions user={user} onLogout={handleLogout} onBack={() => setCurrentPage('dashboard')} />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/resume-upload" 
            element={
              user && user.role !== 'admin' ? (
                <ResumeUpload user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/jobs" 
            element={
              user && user.role !== 'admin' ? (
                <JobPortal user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;