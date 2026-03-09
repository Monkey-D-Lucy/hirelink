import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import GlobalStyles from './styles/GlobalStyles';
import HomePage from './pages/HomePage';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Job Seeker Pages
import SeekerDashboard from './pages/seeker/Dashboard';
import SeekerProfile from './pages/seeker/Profile';
import JobListings from './pages/seeker/JobListings';
import JobDetail from './pages/seeker/JobDetail';
import Applications from './pages/seeker/Applications';
import SavedJobs from './pages/seeker/SavedJobs';

// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard';
import EmployerProfile from './pages/employer/Profile';
import PostJob from './pages/employer/PostJob';
import ManageJobs from './pages/employer/ManageJobs';
import Applicants from './pages/employer/Applicants';
import CompanyProfile from './pages/employer/CompanyProfile';

// Common Components
import PrivateRoute from './components/common/PrivateRoute';
import AuthSuccess from './pages/auth/AuthSuccess';
import Notifications from './pages/Notifications';

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalStyles />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Navbar />
        <Routes>
          {/* HOME PAGE - MUST BE FIRST */}
          <Route path="/" element={<HomePage />} />
          
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/job/:id" element={<JobDetail />} />
          
          {/* Notifications route */}
          <Route path="/notifications" element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          } />
          
          {/* Job Seeker routes */}
          <Route path="/seeker/dashboard" element={
            <PrivateRoute userType="job_seeker">
              <SeekerDashboard />
            </PrivateRoute>
          } />
          <Route path="/seeker/profile" element={
            <PrivateRoute userType="job_seeker">
              <SeekerProfile />
            </PrivateRoute>
          } />
          <Route path="/seeker/applications" element={
            <PrivateRoute userType="job_seeker">
              <Applications />
            </PrivateRoute>
          } />
          <Route path="/seeker/saved-jobs" element={
            <PrivateRoute userType="job_seeker">
              <SavedJobs />
            </PrivateRoute>
          } />
          
          {/* Employer routes */}
          <Route path="/employer/dashboard" element={
            <PrivateRoute userType="employer">
              <EmployerDashboard />
            </PrivateRoute>
          } />
          <Route path="/employer/profile" element={
            <PrivateRoute userType="employer">
              <EmployerProfile />
            </PrivateRoute>
          } />
          <Route path="/employer/post-job" element={
            <PrivateRoute userType="employer">
              <PostJob />
            </PrivateRoute>
          } />
          <Route path="/employer/manage-jobs" element={
            <PrivateRoute userType="employer">
              <ManageJobs />
            </PrivateRoute>
          } />
          <Route path="/employer/applicants/:jobId" element={
            <PrivateRoute userType="employer">
              <Applicants />
            </PrivateRoute>
          } />
          <Route path="/employer/company" element={
            <PrivateRoute userType="employer">
              <CompanyProfile />
            </PrivateRoute>
          } />

          {/* Auth success route */}
          <Route path="/auth/success" element={<AuthSuccess />} />

          {/* Catch-all - Keep this LAST */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;